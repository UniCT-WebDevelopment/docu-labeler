const express = require('express');
const router = express.Router();
const storageController = require("../storageController");
const utils = require("../utils");
const path = require("path");
const Project = require('../schemas/Project');
const User = require('../schemas/User');
const Task = require('../schemas/Task');
const TaskAnnotations = require('../schemas/TaskAnnotations')
const fs = require("fs");


router.post("/create_project", async (req, res) => {
    const {username, projectName, labelsObjList} = req.body;
    console.log("Chiamata API /create_project")
    try {
        // Find the user by username using Mongoose
        const existingUser = await User.findOne({ username });
    
        if (!existingUser) {
            return res.status(400).json({ message: 'Username is not valid' });
        }
    
        const user_id = existingUser._id;
        const user_name = existingUser.username;
    
        const newProject = new Project({
            user_id: user_id,
            title: projectName,
            creator: user_name,
            completed_tasks: 0,
            ok_annotations: 0,
            missing_annotations: 0,
            total_tasks: 0,
            creation_date: utils.getCurrentDate(),
            content: "",
            thumbnail: "",
            labels: labelsObjList,
            public: false,
            shared_users_list: [],
        });
    
        await newProject.save();
    
        res.status(200).json({ message: 'Project creation successful' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Project creation failed' });
    }
});

router.post("/delete_project", async (req, res) => {
    const {project_id, user_id} = req.body;
    console.log("Richiesta cancellazione progetto con id ", project_id)

    try {
        const projectToDelete = await Project.findById(project_id);

        if (!projectToDelete) {
            return res.status(404).json({ message: 'Project not found' });
        }
        console.log("userid", user_id, projectToDelete.user_id);
        if(user_id!=projectToDelete.user_id) {
            return res.status(401).json({message: 'You\'re not the owner of the project'})
        }
        await Task.deleteMany({ project_id: project_id });
        await TaskAnnotations.deleteMany({ project_id: project_id});
        // Delete the project document
        await Project.deleteOne({ _id: project_id });
        try {
            let project_folder_path = __dirname + '/../storage/project_data/' + project_id ;
            console.log("cancello folder ", project_folder_path)
            storageController.deleteFolderRecursiveSync(project_folder_path);
        }
        catch {
            console.log("Niente foto da cancellare");
        }
        res.status(200).json({ message: 'Project deletion successful' });
    } catch (error){
        console.error('Error:', error);
        res.status(500).json({ message: 'Project deletion failed' });
    }
})

router.post("/update_project_description", async (req, res) => {
    const {project_id, description} = req.body;
    console.log("Richiesto update descrizione progetto");
    try {
        const projectToUpdate = await Project.findById(project_id);

        if (!projectToUpdate) {
        return res.status(400).json({ message: 'Project not found' });
        }

        // Update the project's description
        projectToUpdate.content = description;
        await projectToUpdate.save();
        res.status(200).json({ message: 'Project description updated'});
    } catch {
        console.error('Error:', error);
        res.status(500).json({ message: 'Project description update failed'});
    } 
}) 

router.post("/update_project_labels", async (req, res) => {
    const {project_id, labelsList} = req.body;
    console.log("Richiesto update etichette progetto");
    try {
        // Find the project by its ID using Mongoose
        const projectToUpdate = await Project.findById(project_id);

        if (!projectToUpdate) {
        return res.status(400).json({ message: 'Project not found' });
        }

        // Update the project's labels
        projectToUpdate.labels = labelsList;
        await projectToUpdate.save();
        res.status(200).json({ message: 'Project labels updated'});
    } catch {
        console.error('Error:', error);
        res.status(500).json({ message: 'Project labels update failed'});
    } 
}) 

router.post("/publish_project", async (req, res) => {
    const {project_id} = req.body;
    console.log("Richiesto pubblicazione progetto");
    try {
        const projectToUpdate = await Project.findById(project_id);

        if (!projectToUpdate) {
        return res.status(400).json({ message: 'Project not found' });
        }

        // Update the project's description
        projectToUpdate.public = true;
        await projectToUpdate.save();
        res.status(200).json({ message: 'Project published'});
    } catch {
        console.error('Error:', error);
        res.status(500).json({ message: 'Project publishing failed'});
    } 
}) 

router.post("/private_project", async (req, res) => {
    const {project_id} = req.body;
    console.log("Richiesto privatizzazione progetto");
    try {
        const projectToUpdate = await Project.findById(project_id);

        if (!projectToUpdate) {
        return res.status(400).json({ message: 'Project not found' });
        }

        // Update the project's description
        projectToUpdate.public = false;
        await projectToUpdate.save();
        res.status(200).json({ message: 'Project published'});
    } catch {
        console.error('Error:', error);
        res.status(500).json({ message: 'Project publishing failed'});
    } 
}) 

router.post("/get_project_info", async (req, res) => {
    console.log('Richieste info progetto');
    const { project_id } = req.body;
    try {
        // Find the project by its ID using Mongoose
        const reqProjectInfo = await Project.findById(project_id);

        if (!reqProjectInfo) {
        return res.status(404).json({ message: 'Project info not found', project_info: [] });
        }

        res.status(200).json({ message: 'Project info retrieved', project_info: reqProjectInfo });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Project info retrieval failed', project_info: [] });
    } 
});

router.post("/get_projects", async (req, res) => {
    const {username} = req.body;
    console.log(username, "ha richiesto i suoi progetti");

    try {
        const existingUser = await User.findOne({ username });

        if(!existingUser) {
            return res.status(400).json({ message: 'Username is not valid' });
        } 

        const projectsList = await Project.find({ user_id: existingUser._id });

        for(let project of projectsList) {
            if(project.thumbnail!=="") 
                continue;
            let project_id = project._id;
            let storedImage = ""
            console.log("Ricerca thumbnail progetto ", project_id)
            const uploadPathProject = __dirname+'/../storage/project_data/' + project_id;
            console.log("Path completo", uploadPathProject);
            let uploadPathTaskList = []
            try {
                uploadPathTaskList = fs.readdirSync(uploadPathProject);
            } catch(error) {
                console.log(error)
                console.log("Nessuna cartella per il progetto ", project_id);
            }

            if(uploadPathTaskList.length>0) {
                for(let uploadPathTask of uploadPathTaskList) {
                    try {
                        storedImage = await storageController.loadFirstImage(path.join(uploadPathProject, uploadPathTask));
                        console.log(uploadPathTask," piena");
                        break;
                    }
                    catch {
                        console.log(uploadPathTask," vuota");
                    }
                }
            }

            if(storedImage !== ""){
                const resizedImage = await utils.resizeImage(storedImage, 300);
                //Converte l'immagine in BASE64
                const base64Image = resizedImage.toString('base64');
                project.set("thumbnail", base64Image);
            } else {
                project.set("thumbnail", "");
            }
            await project.save();            
        }
        res.status(200).json({ "message": 'Project retrieval successful', 
                               "projects_list": projectsList});

    } catch (error){
        console.log("Fallito fetch dei progetti")
        console.error('Error:', error);
        res.status(500).json({ message: 'Project retrieval failed' });
    }
});

router.post("/get_public_projects", async (req, res) => {
    console.log("Richiesta lista dei progetti pubblici");

    try {
        const projectsList = await Project.find({ public: true });

        for(let project of projectsList) {
            if(project.thumbnail!=="") 
                continue;
            let project_id = project._id;
            let storedImage = ""
            console.log("Ricerca thumbnail progetto ", project_id)
            const uploadPathProject = __dirname+'/../storage/project_data/' + project_id;
            console.log("Path completo", uploadPathProject);
            let uploadPathTaskList = []
            try {
                uploadPathTaskList = fs.readdirSync(uploadPathProject);
            } catch(error) {
                console.log(error)
                console.log("Nessuna cartella per il progetto ", project_id);
            }

            if(uploadPathTaskList.length>0) {
                for(let uploadPathTask of uploadPathTaskList) {
                    try {
                        storedImage = await storageController.loadFirstImage(path.join(uploadPathProject, uploadPathTask));
                        console.log(uploadPathTask," piena");
                        break;
                    }
                    catch {
                        console.log(uploadPathTask," vuota");
                    }
                }
            }

            if(storedImage !== ""){
                const resizedImage = await utils.resizeImage(storedImage, 300);
                //Converte l'immagine in BASE64
                const base64Image = resizedImage.toString('base64');
                project.set("thumbnail", base64Image);
            } else {
                project.set("thumbnail", "");
            }
            await project.save();            
        }
        res.status(200).json({ "message": 'Project retrieval successful', 
                               "projects_list": projectsList});

    } catch (error){
        console.log("Fallito fetch dei progetti")
        console.error('Error:', error);
        res.status(500).json({ message: 'Project retrieval failed' });
    }
});

module.exports = router;