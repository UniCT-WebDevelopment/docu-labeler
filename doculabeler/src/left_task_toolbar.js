import pointer_img from "./img/mouse-pointer.png";
import move_img from "./img/move_white.png";
import rect_img from "./img/rectangle_white.png";
import label_img from "./img/label_white.png"
import back_to_project from "./img/back_to_project.png";
import do_ocr_img from "./img/ocr_w.png";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";


let icons_size = "35px";
export const LeftTaskAnnotationToolbar = (params) => {
    const navigate = useNavigate();
    const currentMode = params.currentMode;
    const projectId = params.projectId;
    const applyTesseractOcr = params.applyTesseractOcr

    useEffect(() => {
        const selectBtn = document.getElementById("select-mode-btn");
        const moveBtn = document.getElementById("move-mode-btn");
        const rectBtn = document.getElementById("rect-mode-btn");
        const labelBtn = document.getElementById("label-mode-btn");
        switch(currentMode) {
            case "selectMode":
                selectBtn.style.backgroundColor="#3b3b3b";
                moveBtn.style.backgroundColor="#191b1b";
                rectBtn.style.backgroundColor="#191b1b";
                labelBtn.style.backgroundColor="#191b1b";
                break;
            case "moveMode":
                selectBtn.style.backgroundColor="#191b1b";
                moveBtn.style.backgroundColor="#3b3b3b";
                rectBtn.style.backgroundColor="#191b1b";
                labelBtn.style.backgroundColor="#191b1b";
                break;
            case "drawRectMode":
                selectBtn.style.backgroundColor="#191b1b";
                moveBtn.style.backgroundColor="#191b1b";
                rectBtn.style.backgroundColor="#3b3b3b";
                labelBtn.style.backgroundColor="#191b1b";
                break;
            case "labelMode":
                selectBtn.style.backgroundColor="#191b1b";
                moveBtn.style.backgroundColor="#191b1b";
                rectBtn.style.backgroundColor="#191b1b";
                labelBtn.style.backgroundColor="#3b3b3b";
        }
    }, [currentMode]);

    return (
        <div id="left-task-annotation-toolbar">
            <div id="left-task-annotation-toolbar-top">
                <img title="Select Mode" onClick={()=>params.modeSetter("selectMode")} className="left-toolbar-item prevent-select" id="select-mode-btn" src={pointer_img} width={icons_size}></img>
                <img title="Move Mode" onClick={()=>params.modeSetter("moveMode")} className="left-toolbar-item prevent-select" id="move-mode-btn" src={move_img} width={icons_size}></img>
                <img title="Draw Mode" onClick={()=>params.modeSetter("drawRectMode")} className="left-toolbar-item prevent-select" id="rect-mode-btn" src={rect_img} width={icons_size}></img>
                <img title="Labeling Mode" onClick={()=>params.modeSetter("labelMode")} className="left-toolbar-item prevent-select" id="label-mode-btn" src={label_img} width={icons_size}></img>
                <img title="Apply Ocr" onClick={()=>applyTesseractOcr()} className="left-toolbar-item prevent-select" src={do_ocr_img} width={icons_size}></img>
            </div>
            <div id="left-task-annotation-toolbar-bottom">
                <img title="Draw Mode" onClick={()=>navigate("/projects/"+projectId)} className="left-toolbar-item prevent-select" src={back_to_project} width={icons_size}></img>
            </div>
        </div>
    );
}