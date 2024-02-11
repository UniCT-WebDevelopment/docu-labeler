const express = require('express');
const router = express.Router();
const Tesseract = require("node-tesseract-ocr");
const path = require("path");
const fs = require('fs');
const sizeOf = require("image-size");
const utils = require("../utils")
const { ObjectId } = require("mongodb");
const TaskAnnotations = require("../schemas/TaskAnnotations");
const Project = require("../schemas/Project");
const Task = require("../schemas/Task");



router.post("/save_task_annotations", async (req, res) => {
    const {project_id, task_id, imageRectanglesDict, deletedRectUids} = req.body;

    const projects_dir = path.join(__dirname, "../storage", "project_data");
    const img_dir = path.join(projects_dir, project_id, task_id);
    let filenames = [];
    let imgDimensions = {};
    if (!fs.existsSync(img_dir)) {
        return res.status(400).json({message: "No task images found on the server"});
    };
    try {
        filenames = fs.readdirSync(img_dir);  
        // Sta roba converrebbe farla separatamente, per evitare di perdere troppo tempo per salvare. 
        for(const filename of filenames) {
            const full_path = path.join(img_dir, filename);
            const dimensions = sizeOf(full_path)
            imgDimensions[filename] = dimensions;
        }   
    } catch (err){
        console.error("Error while reading files:", err);
        res.status(500).json({ message: "Internal server error" });
    }   
    try {
        let currTask = await Task.findById(task_id);
        currTask.last_update_date = utils.getCurrentDate();
        currTask.save();

        const prevTaskLabels = await TaskAnnotations.findOne({ project_id, task_id });
        //primo push delle annotazioni a DB per il task
        if(!prevTaskLabels) {
            let newTaskLabels = new TaskAnnotations({
                "project_id": project_id,
                "task_id": task_id,
                "filenames": filenames,
                "filenames_info": imgDimensions,
                "annotations": imageRectanglesDict,
            });
            console.log("Sto per salvare nuove etichette");
            await newTaskLabels.save();

            currTask.total_images = filenames.length;
            let done = 0
            let missing = 0
            for (const [key, value] of Object.entries(imageRectanglesDict)) {
                if(value.length==0) {
                    missing += 1;
                } else {
                    done += 1
                }
            }
            currTask.ok_annotation = done;
            currTask.missing_annotations = missing;
            console.log("done e missing primo salvataggio", done, missing)
            await currTask.save();

            let currentProject = await Project.findOne({"_id": ObjectId(project_id)});
            currentProject.ok_annotations += done;
            currentProject.missing_annotations -= done;
            currentProject.save();
            
            console.log("Ho salvato");
        } 
        // Esiste già una vecchia versione delle etichette.
        else {
            let updatedLabels = {};
            let prevRectanglesDict = prevTaskLabels.annotations;
            for (const [key, prevLabels] of Object.entries(prevRectanglesDict)) {
                // Se l'immagine con indice "key" non ha nessuna annotazione le assegno
                // quelle nuove
                if(prevLabels.length == 0) {
                    // Aggiorna le annotazioni esistenti con quelle nuove
                    updatedLabels[key] = imageRectanglesDict[key];
                }
                else {
                    for(const deletedUid of deletedRectUids) {
                        const deletedIndex = prevLabels.findIndex(
                            (prevLabel) => prevLabel.uid === deletedUid
                        );

                        if(deletedIndex !== -1) {
                            prevLabels.splice(deletedIndex, 1);
                        }
                    }
                    // Copia delle vecchie annotazioni
                    updatedLabels[key] = prevLabels;
                    let newLabels = imageRectanglesDict[key];


                    // Index di partenza per eventuali nuove annotazioni
                    let newLabelId = prevLabels.length+1;
                    for (let newLabel of newLabels) {
                        const matchingIndex = prevLabels.findIndex(
                            (prevLabel) => prevLabel.uid === newLabel.uid
                        );
                        if (matchingIndex !== -1) {
                            // Aggiorna l'annotazione esistente con i nuovi valori
                            let updatedLabel = prevLabels[matchingIndex];
                                for (const [lkey, lvalue] of Object.entries(newLabel)) 
                                    if (lkey in updatedLabel && lkey!="index") updatedLabel[lkey] = lvalue;
                        } else {
                            // Assegna un nuovo indice all'annotazione e aggiungila
                            newLabel.index= newLabelId;
                            updatedLabels[key].push(newLabel);
                            newLabelId+=1;
                        }
                    }
                }
            }
            let done = 0
            let missing = 0
            for (const [key, value] of Object.entries(updatedLabels)) {
                if(value.length==0) {
                    missing += 1;
                } else {
                    done += 1
                }
            }
            let prevDone = 0
            let prevMissing = 0
            for (const [key, value] of Object.entries(prevTaskLabels.annotations)) {
                if(value.length==0) {
                    prevMissing += 1;
                } else {
                    prevDone += 1
                }
            }

            const doneDelta = done - prevDone;
            const missingDelta = missing - prevMissing;
            console.log("done e missing", done, missing, "delta", doneDelta, missingDelta);
            let currentProject = await Project.findOne({"_id": ObjectId(project_id)});
            currentProject.ok_annotations += doneDelta;
            currentProject.missing_annotations += missingDelta;
            await currentProject.save();

            let currAnnotations = await TaskAnnotations.findOne({ project_id, task_id });;
            currAnnotations.set("annotations", updatedLabels);
            await currAnnotations.save();
            currTask.set("ok_annotation", done);
            currTask.set("missing_annotations", missing);
            await currTask.save();
        }
        
        res.status(200).json({"message": "Task Labels have been saved successfully"})
    } catch (error) {
        console.log("Errore", error);
        res.status(500).json({"message": "Internal server error"})
    } 
})

router.post("/get_task_annotations", async (req, res) => {
    const {project_id, task_id} = req.body;
    console.log("Chiamata API get_task_annotations");
    try {
        const currentTaskLabels = await TaskAnnotations.findOne({"task_id": task_id});
        res.status(200).json(currentTaskLabels)
    } catch (error){
        console.log("Errore recupero annotazioni", error)
        res.status(500).json({"message": "Internal server error"})
    } 
})

router.post("/get_task_annotations_export", async (req, res) => {
    const {project_id, task_id} = req.body;
    console.log("Chiamata API get_task_annotations");
    try {
        const currentProject = await Project.findOne({"_id": ObjectId(project_id)});
        const projectLabels = currentProject.labels;
        const currentTaskLabels = await TaskAnnotations.findOne({"task_id": task_id});
        let exportTaskLabels = {"filenames": currentTaskLabels.filenames,
                                "labels": projectLabels,
                                "annotations": currentTaskLabels.annotations,
                                "filenames_info": currentTaskLabels.filenames_info}
        res.status(200).json(exportTaskLabels)
    } catch (error){
        console.log("Errore recupero annotazioni", error)
        res.status(500).json({"message": "Internal server error"})
    } finally {
    }
})

router.post("/get_project_annotations_export", async (req, res) => {
    const {project_id} = req.body;
    console.log("Chiamata API /get_project_annotations_export");
    try {
        const currentProject = await Project.findOne({"_id": ObjectId(project_id)});
        const projectLabels = currentProject.labels;
        const taskLabelsList = await TaskAnnotations.find({"project_id": ObjectId(project_id)});
        let exportProjectLabels = []
        if(taskLabelsList.length>0){
          console.log("Nessuna annotazione");
          res.status(200).json({"message": "No annotations available"});  
        }
        for (const taskLabels of taskLabelsList) {
            const task = await Task.findOne({"_id": ObjectId(taskLabels.task_id)})
            let exportTaskLabels = {
                "title": task.title,
                "id": task._id,
                "images": task.total_images,
                "filenames": taskLabels.filenames,
                "labels": projectLabels,
                "annotations": taskLabels.annotations,
                "filenames_info": taskLabels.filenames_info
            }
            exportProjectLabels.push(exportTaskLabels);
        }

        res.status(200).json(exportProjectLabels)
    } catch (error){
        console.log("Errore recupero annotazioni", error)
        res.status(500).json({"message": "Internal server error"})
    } finally {
    }
});

router.post("/get_image_ocr", async(req, res) => {
    const {project_id, task_id, currentImageId} = req.body;
    console.log("Richiesta OCR su immagine", project_id, task_id, currentImageId);
    const projects_dir = path.join(__dirname, "../storage/project_data");
    const img_dir = path.join(projects_dir, project_id, task_id);
    const config = {
        lang: "eng", // Language for OCR (e.g., English)
        oem: 1, // OCR Engine Mode (1 for LSTM, 0 for Legacy)
        outputType: "json", // Output the results as JSON
        presets: ["tsv"]
    };
    if (!fs.existsSync(img_dir)) {
        return res.status(400).json({message: "No task data found on the server"});
    };
    try {
        const files_list = fs.readdirSync(img_dir);
        // Path to the image you want to OCR

        const imagePath = path.join(img_dir, files_list[currentImageId]);
        // Define the OCR options, including the output type as 'json'
        const dimensions = sizeOf(imagePath);
        ar = 400/dimensions.width;
        let ocrResult = [];
        Tesseract
        .recognize(imagePath, config)
        .then((data) => {
            // Process the OCR results
            const ocrData = data.split("\r\n")

            // Access the bounding boxes and recognized text
            ocrData.forEach((word, index) => {
                if(index>1 && index!=ocrData.length-1){
                data = word.split("\t");
                const left = data[6] * ar + 100;
                const top = data[7] * ar;
                const w = data[8] * ar;
                const h = data[9] * ar;
                const confidence = data[10];
                const text = data[11]
                if (left!==NaN && confidence!="-1" && text.trim()!="") {
                    ocrResult.push({
                        "x": left,
                        "y": top,
                        "width": w,
                        "height": h,
                        "label": "",
                        "color": "rgb(0,0,0)",
                        "textcontent": text,
                        "selected": 0,
                        "hidden": 0,
                        "collapsed": 1,
                        "deleted": 0,
                        "textfocused": 0
                    })
                }
            }
            });
            console.log(ocrResult[3])
            res.status(200).json({"result": ocrResult})
        })
        .catch((error) => {
            console.error("Error:", error);
        });
    }
    catch (error) {
        console.log("Error on image file retrieval:", error)
    }
})

module.exports = router;