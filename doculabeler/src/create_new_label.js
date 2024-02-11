import { useState } from "react"
import {CompactPicker} from "react-color"


export const CreateNewLabel = (params) => {
    const [isColorWidgetActive, setColorWidgetState] = useState(false);
    const color = params.color;
    const changeColor = params.onColorChange;
    const addNewLabel = params.onLabelAdd;
    const stopCreateLabel = params.onLabelStop;

    const toggleColorWidget = () => {
        setColorWidgetState(!isColorWidgetActive)
    }


    function handleChange(selected_color) {
        changeColor(selected_color);
        setColorWidgetState(false)
    }
    return (
        <div className="new-label-form">
            <div>
                <input placeholder="Label Name" type="text" maxLength={24}>
                </input> 
                <div id="label-name-error"></div>
            </div>
            <button className="new-label-color" onClick={toggleColorWidget}  >
                <div className="label-color-palette"
                    style={{backgroundColor: color.hex}}> . 
                </div>
            </button>
            {isColorWidgetActive && <CompactPicker onChange={handleChange}/>}  
            <button id="add-label-button" onClick={addNewLabel}>Add Label</button>
            <button id="cancel-add-label-button" onClick={stopCreateLabel}>Cancel</button>
        </div>
    )
}