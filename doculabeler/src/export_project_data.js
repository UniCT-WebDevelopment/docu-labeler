import { useEffect, useState } from "react";
import JSZip from "jszip";
import { check } from "express-validator";

let zip = new JSZip();
let taskImagesTmp = []
export const ExportProjectDataPage = (params) => {
    const [selectedFormat, setSelectedFormat] = useState("Raw JSON");
    const [hasAnnotationExportFinished, setAnnotationExportState] = useState(false);

    const [hasImageExportFinished, setImageExportState] = useState(false);
    const [taskImages, setTaskImages] = useState([])
    const [downloadedImagesCount, setDownloadedImagesCount] = useState([])
    const [imagesTotal, setImagesTotal] = useState(0);

    const getProjectAnnotations = params.getProjectAnnotations;
    const getTaskImage = params.getTaskImage;
    const onExportCancel = params.onExportCancel;
    const exportProjectData = async () => {
        await getProjectAnnotations();
    }


    async function getImageSync(currentTaskId, currentImageId, filename) {
        const img = await getTaskImage(currentImageId, currentTaskId);
        taskImagesTmp.push({"filename": filename, "img": img});
        zip.file(filename, img);
        setDownloadedImagesCount(taskImagesTmp.length);
    }

    useEffect(() => {
        //console.log(downloadedImagesCount, imagesTotal)
        if (downloadedImagesCount === imagesTotal && imagesTotal!=0) {
          // All images have been downloaded
          setTaskImages(taskImagesTmp);
        }
      }, [downloadedImagesCount, imagesTotal]);


    useEffect( ()=> {
        if(Object.keys(params.projectData).length !== 0) {
            console.log("Scaricati dati progetto", params.projectData)
            // Inizializza zip e taskImagesTmp
            zip = new JSZip();
            taskImagesTmp = []

            const checkbox = document.getElementById("download-images-check");

            //setImagesTotal(filenames.length);
            if (!checkbox.checked) {
                setImageExportState(true);
            }
            let imagesTmp = 0;
            for(let taskData of params.projectData) {
                imagesTmp+=taskData.images;
            }
            setImagesTotal(imagesTmp);
            if (selectedFormat === "Raw JSON") {
                console.log("Params!!!", params)
                for(let taskData of params.projectData) {
                    const filenames = taskData.filenames;

                    const jsonBlob = new Blob([JSON.stringify(taskData)], {
                        type: "application/json",
                      });
                    console.log(taskData.title+".json")
                    zip.file(taskData.title+".json", jsonBlob)
                    setAnnotationExportState(true)
                    if(checkbox.checked) {
                        for(let i=0; i<taskData.images; i++) {
                            getImageSync(taskData.id, i, filenames[i])
                        } 
                    }
                }
            }
            else if (selectedFormat === "YOLO v1") {
                for(let taskData of params.projectData){
                    const filenames = taskData.filenames;
                    const filenames_info = taskData.filenames_info;
                    const annotations = taskData.annotations;
                    const labels = taskData.labels;
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
                            console.log("Coords:",x ,y, w, h)
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
                            getImageSync(taskData.id, key, filename);
                        } 
                        zip.file(`${basename}.txt`, yolo_item_string_list);
                    }
                }
                
            }
            // Notifica che ho finito di esportare le etichette
            console.log("Finito export etichette");
            setAnnotationExportState(true);
        }
    },
    [params.projectData])

    useEffect(() => {
        console.log("Totale immagini", taskImages.length, "su", imagesTotal);
        console.log(taskImages);
        if(taskImages.length == imagesTotal && imagesTotal!=0) {
            console.log("Ho finito di scaricare le immagini");
            for(let image of taskImages) {
                zip.file(image.filename, image.img);
            }
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
            params.initProjectData();
            setImageExportState(false);
            setAnnotationExportState(false);
        }
    }, [hasAnnotationExportFinished, hasImageExportFinished])



    return (
        <div id="export-project-data-form-container" onClick={(e) => e.preventDefault()}>
            <div id="export-project-data-form">
                <h3>Export Project Data</h3>
                <div> Export format</div>
                <select value={selectedFormat} onChange={(e) => setSelectedFormat(e.target.value)}>
                    <option> Raw JSON </option>
                    <option> YOLO v1 </option>
                </select>
                <div>
                    <input id="download-images-check" type="checkbox" name="images-flag"
                    onClick={(e) => e.stopPropagation()}></input>
                    <label for="images-flag"> Download Images </label>
                </div>
                <div id="export-project-btn-container">
                    <button className="confirm-button"
                    onClick={(e) => {exportProjectData()}}>
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