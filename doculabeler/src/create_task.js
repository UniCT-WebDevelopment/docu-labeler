

let dropped_files = [];

export const CreateTaskPage = (params) => {
    console.log("Creo task page, ecco project ID");
    console.log(params.project_id);
    const cancelCreateTask = params.onCreationEnd;  
    const confirmCreateTask = params.onCreationConfirm;
  
    const handleFileDrop = async (e) => {
      let selected_files_info = document.getElementById("selected_files_info")
      const drag_drop_box = document.getElementById("task-drag-and-drop")
      drag_drop_box.style.borderColor="rgb(0,0,0)"
      drag_drop_box.style.boxShadow="0px 0px 8px 3px #79cb9c"
      selected_files_info.innerHTML = "";
      e.preventDefault();
      e.stopPropagation();
  
      dropped_files = e.dataTransfer.files;
      params.onFileDrop(dropped_files);
  
      for (let i = 0; i < dropped_files.length; i++) {
        let fname_split = dropped_files[i].name.split(".");
        const extension = fname_split[fname_split.length-1].toLowerCase();
        // Gestione compatibilità formati, per ora solo questi.
        if (extension!="png" && extension!="jpg" && extension!="jpeg") {
          dropped_files = "";
          selected_files_info.innerHTML = "<b>Error!</b> Some of the loaded files are not supported";
          drag_drop_box.style.boxShadow="0px 0px 8px 2px #ff2f2f"
          return;
        }
      }
      // Se vengono selezionati meno di 8 files mostro ogni nome
      if(dropped_files.length < 8) {
        for (let i = 0; i < dropped_files.length; i++) {
          let fname = document.createElement("li");
          fname.innerHTML = dropped_files[i].name;
          selected_files_info.append(fname);
        }
      }
      // Altrimenti dico direttamente quanti ne sono stati selezionati
      else {
        selected_files_info.innerHTML = dropped_files.length+" files selected";
      }
    }

    
    
      return(
        <div id="create-task-grid">
          <div id="create-task-container">
            <h2>New Task</h2>
            <div className="input-container">
              <p id="create-task-name-helper">Name</p>
              <input type="text" id="task-name-container" placeholder=" Task name (max. 32 characters)"></input>
            </div>
            <span id="task-name-error"> </span>
            <div id="task-load-files-container">
              <p id="load-files-helper">Load Files</p>
              <div id="task-drag-and-drop" onDrop={handleFileDrop} 
              onDragEnter={(e) => e.preventDefault()} onDragOver={(e) => e.preventDefault()}> 
                  Drag your files here
                  <p id="load-files-subhelper">Valid formats: <i>jpg, png</i></p>
              </div>
              <ul id="selected_files_info">
              </ul>
            </div>
            <div id="create-task-form-buttons">
              <button className="cancel-button" onClick={cancelCreateTask}> Cancel </button>
              <button className="confirm-button" onClick={confirmCreateTask}> Confirm </button>
            </div>
          </div>
        </div>
      )
}