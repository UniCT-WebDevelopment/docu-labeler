
import { ReactDOM } from "react";
import { useState } from "react";
import { CreateProjectLabelContainer } from "./create_project_text_label_container";

export const startCreate = () => {
    ReactDOM.render(
        CreateProjectPage(),
        document.getElementById("project-card-container")
    );
};

export const CreateProjectPage = (params) => {
    const [color, changeColor] = useState({hex: "#000000"});
    const [labelsList, setLabelsList] = useState([]);

    const deleteLabel = (labelName) => {
        let updatedLabels = labelsList.filter(label => label.label_name!=labelName);
        setLabelsList(updatedLabels);
    }
    
    return (
        <div id="overlay">
            <div id="create-project-grid">
            <div id="create-project-container">
                <h2>New Project</h2>
                <div className="input-container">
                    <p>Name</p>
                    <input type="text" placeholder=" Project name (max. 32 characters)"></input>
                </div>
                <span id="project-name-error"> </span>
                <div id="labels-container">
                    <p>Labels</p>
                    <CreateProjectLabelContainer
                        labelColor={color}
                        onColorChange={changeColor}
                        labelsList={labelsList}
                        onLabelsChange={setLabelsList}
                        onLabelsDelete={deleteLabel}>
                    </CreateProjectLabelContainer>
                </div>
                <div id="create-form-buttons">
                <button className="confirm-button" onClick={params.onCreate}> Confirm </button>
                <button className="cancel-button" onClick={params.onEndCreate}> Cancel </button>
                </div>
            </div>
            </div>
        </div>
    );
}