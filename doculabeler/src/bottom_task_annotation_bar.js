import { TextLabel} from "./text_label";
import { useState } from "react";
import { blendWithWhite } from "./right_task_toolbar_item";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { CompactPicker } from "react-color";

const apiAddress = process.env.REACT_APP_.DOCULABELER_API_ADDRESS;

export const BottomTaskAnnotationBar = ({labels_list, activeLabel, setActiveLabel}) => {
    const {project_id, task_id} = useParams();
    const [isNewLabelFormActive, setNewLabelFormState] = useState(false);
    const [isColorWidgetActive, setColorWidgetState] = useState(false);
    const [color, changeColor] = useState({hex: "#000000", rgb: {r: 0, g: 0, b: 0}});
    const [labelsList, setLabelsList] = useState([...labels_list])

    const handleLabelClick = (labelName, labelColor) => {
        if(activeLabel===labelName) {
            setActiveLabel(["", "rgb(0,0,0)"]);
        } else {
            setActiveLabel([labelName, labelColor]);
        }
        
      };

      function handleChange(selected_color) {
        changeColor(selected_color);
        setColorWidgetState(false)
    }

    const stopCreateLabel = () => {
        setNewLabelFormState(false)
        setColorWidgetState(false)
    }

    const addNewLabel = () => {
        const newLabelElement = document.querySelector(".new-label-form-task-annotation>div>input");
        const labelError = document.getElementById("label-name-error");
        const newLabelName = newLabelElement.value.trim();
        if(newLabelName.length == 0) {
            newLabelElement.setAttribute("style", 
            "border: 1px solid red; background-color:rgba(255,0,0,0.15);");
            labelError.innerHTML = "Project label name cannot be empty!";
            return;
        }

        for(let label of labelsList) {
            if(label.label_name==newLabelName) {
                labelError.innerHTML = "Project labels must be unique!";
                newLabelElement.setAttribute("style", 
                    "border: 1px solid red; background-color:rgba(255,0,0,0.15);");
                return;
            }
        }

        console.log(newLabelName);
        setNewLabelFormState(false)
        setColorWidgetState(false)
        let updatedLabelsList = [...labelsList]
        updatedLabelsList.push({
            "label_name": newLabelName,
            "label_color": "rgb("+color.rgb.r+", "+color.rgb.g+", "+color.rgb.b+")"
        })
        setLabelsList(updatedLabelsList);
    }

    useEffect(() => {
        if(labelsList!==undefined) {
          const formData = new URLSearchParams();
          formData.append('project_id', project_id);
          formData.append('labelsList', JSON.stringify(labelsList));
          fetch(`http://${apiAddress}/project/update_project_labels`, {

            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({project_id, labelsList})
          })
        }
      }, [labelsList]);

    return (
        <div id="bottom-task-annotation-bar">
            {labelsList.map((label, index) => (
                <TextLabel 
                index={index}
                label_name={label.label_name} 
                label_color={label.label_color}
                label_type="task-annotation"
                onClick={handleLabelClick}
                isActive={activeLabel[0]===label.label_name}/>
            ))}
            {!isNewLabelFormActive && <div className="new-label-btn" onClick={()=>setNewLabelFormState(true)}>+</div>}
            {isNewLabelFormActive &&
            <div className="new-label-form-task-annotation">
            <div>
                <input placeholder="Label Name" type="text" maxLength={24}>
                </input> 
                <div id="label-name-error"></div>
            </div>
            <button className="new-label-color" onClick={() => setColorWidgetState(!isColorWidgetActive)}  >
                <div className="label-color-palette"
                style={{backgroundColor: color.hex}}> . </div>
            </button>
            {isColorWidgetActive && <CompactPicker className="bottom-task-picker" onChange={handleChange}/>}  
            <button id="add-label-button" onClick={addNewLabel}>Add Label</button>
            <button id="cancel-add-label-button" onClick={stopCreateLabel}>Cancel</button>
            </div>}
        </div>
    )
}