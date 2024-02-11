const express = require('express');
const router = express.Router();
const {ObjectId} = require("mongodb");
const fileUpload = require('express-fileupload');
const utils = require("../utils")
const storageController = require("../storageController")
const path = require("path")
const sizeOf = require("image-size");
const fs = require("fs");
const User = require("../schemas/User");
const Task = require("../schemas/Task");
const Project = require("../schemas/Project");
const TaskAnnotations = require("../schemas/TaskAnnotations");


router.post("/create_task", fileUpload(), async (req, res) => {
    console.log("Called POST API /create_task")
    const project_id = req.body.project_id;
    const task_name = req.body.task_name;
    const username = req.body.username;
    const files = req.files ? req.files.files : [];
    try {
        const existing_user = await User.findOne({ "username": username });
        if(!existing_user) {
            return res.status(400).json({ message: 'Username is not valid' });
        } 
        const user_id = existing_user._id;

        const existing_project = await Project.findOne({ "_id": ObjectId(project_id)});

        if(!existing_project) {
            return res.status(400).json({ message: 'Project is not valid' });
        } 

        existing_project.total_tasks += 1;
        existing_project.missing_annotations += files.length;
        existing_project.save();

        const existing_task_name = await Task.findOne({ "title": task_name, "project_id": project_id });
        if(existing_task_name) {
            return res.status(400).json({ message: 'Project has already a task with this name'});
        } 

        const newTask = new Task({
            "user_id": user_id,
            "project_id": project_id,
            "title": task_name,
            "creator": username,
            "total_images": files.length,
            "missing_annotations": files.length
        });

        //Inserisci nuovo task a DB
        const createdTask = await newTask.save();
        //_ID del task appena inserito
        let task_id = createdTask._id;

        //Salva i file relativi al nuovo task in una cartella apposita
        let storedFilesPath = await storageController.storeTaskFiles(
            project_id.toString(), 
            task_id.toString(), 
            files
        );
        //Aggiungi il path della cartella di storage alle info del nuovo task
        createdTask.filedir = storedFilesPath;
        
        //Carica prima immagine del task salvata
        const storedImage = await storageController.loadFirstImage(storedFilesPath);
        //Ridimensiona l'immagine in modo che il lato maggiore misuri 300px
        const resizedImage = await utils.resizeImage(storedImage, 300);
        //Converte l'immagine in BASE64
        const base64Image = resizedImage.toString('base64');
        createdTask.thumbnail = base64Image
        createdTask.save();

        const projects_dir = path.join(__dirname, "../storage", "project_data");
        let filenames = [];
        let imgDimensions = {};
        if (!fs.existsSync(storedFilesPath)) {
            return res.status(400).json({message: "No task images found on the server"});
        };
        try {
            filenames = fs.readdirSync(storedFilesPath);  
            // Sta roba converrebbe farla separatamente, per evitare di perdere troppo tempo per salvare. 
            for(const filename of filenames) {
                const full_path = path.join(storedFilesPath, filename);
                const dimensions = sizeOf(full_path)
                imgDimensions[filename] = dimensions;
            }   
        } catch (err){
            console.error("Error while reading files:", err);
            res.status(500).json({ message: "Internal server error" });
        }   
        let imageRectanglesDict = {}
        for(let c=0; c<filenames.length; c++) {
            imageRectanglesDict[c] = [];
        }
        try {
            //primo push delle annotazioni a DB per il task
            let newTaskLabels = new TaskAnnotations({
                "project_id": project_id,
                "task_id": task_id,
                "filenames": filenames,
                "filenames_info": imgDimensions,
                "annotations": imageRectanglesDict,
            });
            console.log("Sto per inizializzare etichette del nuovo task");
            await newTaskLabels.save();

            res.status(200).json({ message: 'Task creation and data storage successful', 
                                task: createdTask});
        }
        catch (error) {
            console.log("Error:", error);
        }

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Task creation failed' });
    }
});

router.post("/delete_task", async (req, res) => {
    const {task_id} = req.body;
    console.log("Richiesta cancellazione task con id ", task_id)

    try {
        const deletedTask = await Task.findByIdAndRemove(task_id);

        if (!deletedTask) {
            return res.status(400).json({ message: 'Task not found' });
        }

        const existingProject = await Project.findOne({ "_id": deletedTask.project_id});

        if(!existingProject) {
            return res.status(400).json({ message: 'Project is not valid' });
        } 

        existingProject.ok_annotations-=deletedTask.ok_annotation;
        existingProject.missing_annotations-=deletedTask.missing_annotations;
        existingProject.total_tasks-=1;
        existingProject.save();

        const deletedAnnotations = await TaskAnnotations.deleteOne({task_id: ObjectId(task_id)})

        if (!deletedAnnotations) {
            console.log("No annotation found for the deleted task");
        }

        const projects_dir = path.join(__dirname, "../storage/project_data");
        fs.readdirSync(projects_dir).forEach( async(p_dir) => {
            if(storageController.findDir(path.join(projects_dir, p_dir), task_id)) {
                console.log("Trovato path task ", projects_dir+"/"+p_dir+"/"+task_id);
                storageController.deleteFolderRecursiveSync(path.join(projects_dir, p_dir, task_id));
            }
        })
        res.status(200).json({ message: 'Task deletion successful' });

    } catch {
        console.error('Error:', error);
        res.status(500).json({ message: 'Task deletion failed' });
    }
})

router.post("/get_project_tasks", async (req, res) => {
    const {project_id} = req.body;
    console.log("Richiesti task del progetto", project_id);

    try {
        const projectInfo = await Project.findById(project_id);

        if (!projectInfo) {
            return res.status(400).json({ message: 'Project not found' });
        }

        const tasksList = await Task.find({ project_id });
        
        res.status(200).json({ "message": 'Task retrieval successful', 
                               "tasks_list": tasksList,
                               "project_info": projectInfo});

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Task retrieval failed' });
    }
});

router.post("/get_task_image", async (req, res) => {
    const {project_id, task_id, currentImageId} = req.body;
    console.log("Richiesta immagine task", project_id, task_id, currentImageId);
    const projects_dir = path.join(__dirname, "../storage/project_data");
    const img_dir = path.join(projects_dir, project_id, task_id);
    
    if (!fs.existsSync(img_dir)) {
        return res.status(400).json({message: "No task data found on the server"});
    };
    try {
        const files_list = fs.readdirSync(img_dir);
        const selected_file = files_list[currentImageId];
        filePath = path.join(img_dir, selected_file);
        res.setHeader("Content-Type", "image/jpeg");
        res.sendFile(filePath)
    } catch {
        console.error("Error while looking for image", currentImageId, err);
        res.status(500).json({ message: "Internal server error" });
    }   
})

router.post("/get_task_images_len", async (req, res) => {
    const {project_id, task_id} = req.body;
    console.log("Richiesto numero di immagini del task");
    const projects_dir = path.join(__dirname, "../storage/project_data");
    const img_dir = path.join(projects_dir, project_id, task_id);
    
    if (!fs.existsSync(img_dir)) {
        return res.status(400).json({message: "No task data found on the server"});
    };
    try {
        const files_list = fs.readdirSync(img_dir);
        res.status(200).json({ task_images: files_list.length})

    } catch {
        console.error("Error while reading files:", err);
        res.status(500).json({ message: "Internal server error" });
    }
})

module.exports = router;