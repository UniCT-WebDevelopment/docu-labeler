
import { param } from "express-validator";
import { useState } from "react"
import {CompactPicker} from "react-color"
import { TextLabel } from "./text_label";
import { CreateNewLabel } from "./create_new_label";



export const CreateProjectLabelContainer = (params) => {
    const [isCreateLabelFormActive, setCreateLabelState] = useState(false)
    const [isColorWidgetActive, setColorWidgetState] = useState(false);
    const color = params.labelColor;
    const changeColor = params.onColorChange;
    const labelsList = params.labelsList;
    const setLabelsList = params.onLabelsChange;
    const deleteLabel = params.onLabelsDelete;

    function handleChange(selected_color) {
        changeColor(selected_color);
        setColorWidgetState(false)
      }

    const startCreateLabel = () => {
        setCreateLabelState(true)
        setColorWidgetState(false)
    }

    const stopCreateLabel = () => {
        setCreateLabelState(false)
        setColorWidgetState(false)
    }

    const addNewLabel = () => {
        const newLabelElement = document.querySelector(".new-label-form>div>input");
        const labelError = document.getElementById("label-name-error");
        const newLabelName = newLabelElement.value.trim();
        console.log("Nuova etichetta", newLabelName)
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
        setCreateLabelState(false)
        setColorWidgetState(false)
        labelsList.push({
            "label_name": newLabelName,
            "label_color": color.hex 
            })
        setLabelsList(labelsList);
    }

    const toggleColorWidget = () => {
        setColorWidgetState(!isColorWidgetActive)
    }

    return (
        <div id="create-proj-text-label-container">
            {!isCreateLabelFormActive &&
            <button className="new-label-button" onClick={startCreateLabel}>
                +
            </button>
            }
            {!isCreateLabelFormActive &&
                <div id="create-project-label-container">
                    {labelsList.map((label, index) => (
                        <TextLabel
                        index={index}
                        label_name={label.label_name}
                        label_color={label.label_color}
                        label_type="create-project"
                        isDeletable={true}
                        onDelete={deleteLabel}/>
                    ))}
                </div>
            }
            
            {isCreateLabelFormActive && 
                //<CreateNewLabel
                //    color={color}
                //    onColorChange={changeColor}
                //    onLabelAdd={addNewLabel}
                //    onLabelStop={stopCreateLabel}
                ///>
                <div className="new-label-form">
                    <div>
                        <input placeholder="Label Name" type="text" maxLength={24}>
                        </input> 
                        <div id="label-name-error"></div>
                    </div>
                    <button className="new-label-color" onClick={toggleColorWidget}  >
                        <div className="label-color-palette"
                        style={{backgroundColor: color.hex}}> . </div>
                    </button>
                    {isColorWidgetActive && <CompactPicker onChange={handleChange}/>}  
                    <button id="add-label-button" onClick={addNewLabel}>Add Label</button>
                    <button id="cancel-add-label-button" onClick={stopCreateLabel}>Cancel</button>
                </div>
            }
        </div>
    )
}