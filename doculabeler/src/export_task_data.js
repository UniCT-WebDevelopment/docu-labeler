import { useEffect, useState } from "react";
import JSZip from "jszip";
import { check } from "express-validator";

let zip = new JSZip();
export const ExportTaskDataPage = (params) => {
    const [selectedFormat, setSelectedFormat] = useState("Raw JSON");
    const [hasAnnotationExportFinished, setAnnotationExportState] = useState(false);

    const [hasImageExportFinished, setImageExportState] = useState(false);
    const [taskImages, setTaskImages] = useState([])
    const [imagesTotal, setImagesTotal] = useState(0);

    let taskImagesTmp = []
    const getTaskAnnotations = params.getTaskAnnotations;
    const getTaskImage = params.getTaskImage;
    const onExportCancel = params.onExportCancel;
    const exportTaskData = async () => {
        await getTaskAnnotations();
    }


    async function getImageSync(currentImageId, filename) {
        const img = await getTaskImage(currentImageId);
        taskImagesTmp.push({"filename": filename, "img": img});
        zip.file(filename, img);
        //updatedTaskImages.push({"filename": filename, "img": img})
        if(imagesTotal!=0 && taskImagesTmp.length==imagesTotal) {
            console.log("Set task Images!!!", taskImagesTmp.length, imagesTotal);
            setTaskImages(taskImagesTmp);
        }
    }
    useEffect( ()=> {
        if(Object.keys(params.taskData).length !== 0) {
            // Inizializza zip e taskImagesTmp
            zip = new JSZip();
            taskImagesTmp = []

            const checkbox = document.getElementById("download-images-check");
            const filenames = params.taskData.filenames;
            const filenames_info = params.taskData.filenames_info;
            const annotations = params.taskData.annotations;
            const labels = params.taskData.labels;
            setImagesTotal(filenames.length);
            if (!checkbox.checked) {
                setImageExportState(true);
            }
            if (selectedFormat === "Raw JSON") {
                const jsonBlob = new Blob([JSON.stringify(params.taskData)], {
                    type: "application/json",
                  });
                
                zip.file("annotations.json", jsonBlob)
                setAnnotationExportState(true)
                if(checkbox.checked) {
                    for(let i=0; i<filenames.length; i++) {
                        getImageSync(i, filenames[i])
                    } 
                }
                //const url = URL.createObjectURL(jsonBlob);
                //const a = document.createElement("a");s
                //a.href = url;
                //a.download = "taskData.json";
                //document.body.appendChild(a);
                //a.click();
                //URL.revokeObjectURL(url);
                //document.body.removeChild(a);
            }
            else if (selectedFormat === "YOLO v1") {
                let label_name_idx = {}
                
                let c=0;
                for (let label of labels) {
                    label_name_idx[label.label_name] = c;
                    c++;
                }
                for(const key in annotations) {
                    
                    const filename = filenames[key];
                    const file_info = filenames_info[filename];
                    const height = file_info.height;
                    const width = file_info.width;
                    let yolo_item_string_list = []
                    const x_offset = 100;
                    //NOTA, LIMITARE COORDINATE X e Y BOX! TRA 0 E W/H
                    for(const item of annotations[key]) {
                        //400 è la dimensione del viewport SVG, OCCHIO SE CAMBIA!!
                        let rateo = width/400;
                        const label_id= (item.label in label_name_idx ? label_name_idx[item.label] : Object.keys(label_name_idx).length)
                        let [x, y, w, h] = [(item.x-x_offset)*rateo, item.y*rateo, item.width*rateo, item.height*rateo];
                        const x2 = Math.max(0, Math.min(x+w, width));
                        const y2 = Math.max(0, Math.min(y+h, height));
                        // Limita coordinate in modo che non escano dai bordi dell'immagine
                        x = Math.max(0, Math.min(x, width))
                        y = Math.max(0, Math.min(y, height))
                        w = x2 - x;
                        h = y2 - y;                        

                        const yolo_x = ((x+(w/2))/width).toFixed(5);
                        const yolo_y = ((y+(h/2))/height).toFixed(5);
                        const yolo_w = (w/width).toFixed(5);
                        const yolo_h = (h/height).toFixed(5);
                        const yolo_item_string = [label_id, yolo_x, yolo_y, yolo_w, yolo_h].join(" ");
                        yolo_item_string_list.push(yolo_item_string);
                    }
                    yolo_item_string_list = yolo_item_string_list.join("\n");
                    let basename = filename.split(".").slice(0, -1).join(".");
                    if (checkbox.checked) {
                        getImageSync(key, filename);
                    } 
                    zip.file(`${basename}.txt`, yolo_item_string_list);
                }
            }
            // Notifica che ho finito di esportare le etichette
            setAnnotationExportState(true);
        }
    },
    [params.taskData])

    useEffect(() => {
        console.log("Totale immagini", taskImages.length, "su", imagesTotal);
        console.log(taskImages);
        if(taskImages.length == imagesTotal && imagesTotal!=0) {
            console.log("Ho finito di scaricare le immagini");
            //for(let image of taskImages) {
            //    zip.file(image.filename, image.img);
            //}
            setImageExportState(true);
        }
    }, [taskImages])

    useEffect( () => {
        console.log("Stato annot. e imm.", hasAnnotationExportFinished, hasImageExportFinished)
        if (hasAnnotationExportFinished && hasImageExportFinished) {
            console.log("Finito export annotazioni e immagini!")
            zip.generateAsync({ type: "blob" }).then((content) => {
                // Create a download link for the zip archive
                const url = window.URL.createObjectURL(content);
                const a = document.createElement("a");
                a.href = url;
                a.download = "annotations.zip";
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            });
            setImageExportState(false);
            setAnnotationExportState(false);
        }
    }, [hasAnnotationExportFinished, hasImageExportFinished])



    return (
        <div id="export-task-data-form-container">
            <div id="export-task-data-form">
                <h3>Export Task Data</h3>
                <div> Export format</div>
                <select value={selectedFormat} onChange={(e) => setSelectedFormat(e.target.value)}>
                    <option> Raw JSON </option>
                    <option> YOLO v1 </option>
                </select>
                <div>
                    <input id="download-images-check" type="checkbox" name="images-flag"></input>
                    <label for="images-flag"> Download Images </label>
                </div>
                <div id="export-task-btn-container">
                    <button className="confirm-button"
                    onClick={exportTaskData}>
                        Start Export
                    </button>
                    <button className="cancel-button"
                    onClick={onExportCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}