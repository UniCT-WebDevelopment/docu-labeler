import { TaskCard } from "./project_task";
import { NavBar } from "./navbar";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { currUserProjects } from "./projects";
import {CompactPicker} from "react-color"
import { CreateTaskPage } from "./create_task";
import no_tasks_img from "./img/empty_white.png";
import { TextLabel } from "./text_label";
import load_icon from "./img/loader.png"
import modify_icon from "./img/pencil.png";


let currentTasks=[];
const apiAddress = process.env.REACT_APP_.DOCULABELER_API_ADDRESS;

export const ProjectTasksContainer = (params) => {
    let navigate = useNavigate();

    const [isCreateLabelFormActive, setCreateLabelState] = useState(false)
    const [isColorWidgetActive, setColorWidgetState] = useState(false);
    const [color, changeColor] = useState({hex: "#000000", rgb: {r: 0, g: 0, b: 0}});
    const [guestMode, setGuestMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreatingTask, setIsCreatingTask] = useState(false);

    const [isCreateFormVisible, setIsCreateForm] = useState(false);
    const [projectTasks, setProjectTasks] = useState([]);
    const [droppedFiles, setDroppedFiles] = useState([]);
    const [projectInfo, setProjectInfo] = useState([]);
    const [labelsList, setLabelsList] = useState([]);

    const { project_id } = useParams();

    useEffect(()=> {
      if(localStorage.getItem("username")==="")
        setGuestMode(true);
    }, [])

    function handleChange(selected_color) {
      changeColor(selected_color);
      setColorWidgetState(false)
    }

    const handleReturnProjectsPage = () => {
        navigate("/projects");
    }

    const stopCreateLabel = () => {
      setCreateLabelState(false)
      setColorWidgetState(false)
  }

    const handleTaskCreationStart = () => {
        setDroppedFiles([]);
        setIsCreateForm(true);
    }

    const handleTaskCreationEnd = () => {
        setDroppedFiles([]);
        setIsCreateForm(false);
    }

    const handleTaskCreationConfirm = async () => {
        console.log(droppedFiles);
        let error_message = document.getElementById("task-name-error") 
        const task_name_input = document.getElementById("task-name-container");
        const create_task_grid = document.getElementById("create-task-grid");
    
        create_task_grid.style.zIndex=5;
        setIsCreatingTask(true);
        
        let task_name = task_name_input.value
    
        if(task_name.length>32) {
          error_message.innerHTML ="<b>Error!</b> The task name's length exceeds the limit of 32.";
          create_task_grid.style.zIndex=10;
          setIsCreatingTask(false);
          return;
        } else if(task_name.length==0) { 
          error_message.innerHTML ="<b>Error!</b> Task name cannot be an empty string.";
          create_task_grid.style.zIndex=10;
          setIsCreatingTask(false);
          return;
        }  else if(droppedFiles.length==0) {
          error_message.innerHTML ="<b>Error!</b> There are no files to load.";
          create_task_grid.style.zIndex=10;
          setIsCreatingTask(false);
          return; 
        }
    
    
        const formData = new FormData();
        formData.append("project_id", project_id);
        formData.append("task_name", task_name);
        formData.append("username", localStorage.getItem("username"));
    
    
        for (let i = 0; i < droppedFiles.length; i++) {
          formData.append("files", droppedFiles[i]);
        }    
        const task_creation_res = await fetch(`http://${apiAddress}/task/create_task`, {
          method: 'POST',
          //headers: {
          //  'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          //},
          body: formData,
        });
    
        if (task_creation_res.ok) {
          // Task created successfully
          let data = await task_creation_res.json();
          error_message.innerHTML ="<b>Task creato!!</b>";
          let newTask = data.task;
          let newTaskThumbnailBinary = atob(newTask.thumbnail);
          const thumbnailBlob = new Blob([newTaskThumbnailBinary], {type: 'image/jpeg'});
          const newTaskThumbnailUrl = URL.createObjectURL(thumbnailBlob);
          newTask.thumbnailUrl = newTaskThumbnailUrl;
          let updatedProjectTasks = projectTasks;
          updatedProjectTasks.push(newTask);
          setProjectTasks(updatedProjectTasks);
          setIsCreateForm(false);
          setIsCreatingTask(false);
          create_task_grid.style.zIndex=10;

        } else {
          // Handle error
          error_message.innerHTML ="<b>Error!</b> Task creation has failed";
          setIsCreatingTask(false);
          create_task_grid.style.zIndex=10;
        }
    }

    async function deleteTask(task_id) {
      const formData = new URLSearchParams();
      formData.append('task_id', task_id);
      await fetch(`http://${apiAddress}/task/delete_task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          "Access-Control-Allow-Origin": "http://172.23.192.1:8080",
        },
        body: formData.toString()
      })
    } 

    const handleTaskDelete = (task_id) => {
        console.log("Delete!", task_id);
        console.log(projectTasks);
        let updatedProjectTasks = projectTasks.filter((task) => task._id != task_id);
        setProjectTasks(updatedProjectTasks);
        deleteTask(task_id);
    }
    
    async function getProjectTasks(project_id) {
        setIsLoading(true)
        console.log("Richiesti task per ", project_id);
        const formData = new URLSearchParams();
        formData.append('project_id', project_id);
        await fetch(`http://${apiAddress}/task/get_project_tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          },
          body: formData.toString()
        })
        .then(async response =>await response.json())
        .then(async data => {
          currentTasks = data.tasks_list;
          for(let task of currentTasks) {
            let taskThumbnailBinary = atob(task.thumbnail);
            const thumbnailBlob = new Blob([taskThumbnailBinary], {type: 'image/jpeg'});
            const taskThumbnailUrl = URL.createObjectURL(thumbnailBlob);
            task.thumbnailUrl = taskThumbnailUrl;
          }
          //console.log("Task correnti!!", currentTasks);
          let project_info = data.project_info;
          setProjectTasks(currentTasks);
          setLabelsList(project_info.labels);
          setProjectInfo(project_info);
          setIsLoading(false);
        })
    }

    const handleModifyDescription = () => {
      const descriptionBox = document.getElementById("project-info-description-box");
      descriptionBox.contentEditable = "true";
      descriptionBox.focus();

    }

    const handleStopModifyDescription = async () => {
      const descriptionBox = document.getElementById("project-info-description-box");
      descriptionBox.contentEditable = "false";
      const description = descriptionBox.innerText;
      console.log("Descrizione!", description);
      const response = await fetch(`http://${apiAddress}/project/update_project_description`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({project_id, description})
      })

      if(response.ok) {
      } else {
        descriptionBox.innerHTML = "Description update has failed"
      }
    }

    const addNewLabel = async () => {
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

        setCreateLabelState(false)
        setColorWidgetState(false)
        let updatedLabelsList = [...labelsList]
        updatedLabelsList.push({
            "label_name": newLabelName,
            "label_color": `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`
            })
        setLabelsList(updatedLabelsList); 
    }

    useEffect(() => {
        if (projectTasks.length == 0 || 
        (projectTasks.length > 0 && projectTasks[0].project_id != project_id)) 
        {
            getProjectTasks(project_id);
        }
    }, [])

    //Parte quando vengono aggiornate le etichette
    useEffect(() => {
      if(projectInfo.labels!==undefined && labelsList!==undefined && projectInfo.labels.length != labelsList.length) {
        console.log("Aggiunta etichetta")
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
        <div id="project-tasks-page">
            <NavBar hasCreateButton={false}/>
            {isCreateFormVisible &&
            <div id="overlay">
                
            </div>}
            {isCreateFormVisible && 
              <CreateTaskPage project_id={project_id} 
                onCreationEnd={handleTaskCreationEnd} 
                onCreationConfirm={handleTaskCreationConfirm} 
                onFileDrop={setDroppedFiles}/>
            }
            { isCreatingTask ? <div id="loading-div"><img id="loading-icon" src={load_icon} width="40px"/></div> : null}
            { isLoading ? <div id="loading-div"><img id="loading-icon" src={load_icon}/></div> : 
            <div id="project-task-container-grid">
                <button id="task-to-project-page-btn" onClick={handleReturnProjectsPage}>
                    <span id="task-to-project-page-cnt"> Projects Page </span>
                </button>
                <div id="project-info-container">
                    <p id="project-info-title">{projectInfo.title}</p>    
                    <p id="project-info-owner">Project owned by {projectInfo.creator}</p>
                    <div id="project-info-description-container">
                      <p id="project-info-description"> Project description</p>
                      {!guestMode && <img onClick={handleModifyDescription} src={modify_icon} width="14px"/>}
                    </div>
                    <div id="project-info-description-box" onBlur={handleStopModifyDescription}>{projectInfo.content !== "" ? projectInfo.content : '\xa0'}</div>
                    <div id="project-info-labels-flex"> 
                      <p id="project-info-labels"> Labels </p>
                      {!guestMode && <img onClick={() => setCreateLabelState(true)}src={modify_icon} width="14px"/>}
                    </div>
                    <div id="project-info-label-container">
                      { isCreateLabelFormActive ?
                        <div className="new-label-form">
                          <div>
                              <input placeholder="Label Name" type="text" maxLength={24}>
                              </input> 
                              <div id="label-name-error"></div>
                          </div>
                          <button className="new-label-color" onClick={() => setColorWidgetState(!isColorWidgetActive)}  >
                              <div className="label-color-palette"
                              style={{backgroundColor: color.hex}}> . </div>
                          </button>
                          {isColorWidgetActive && <CompactPicker onChange={handleChange}/>}  
                          <button id="add-label-button" onClick={addNewLabel}>Add Label</button>
                          <button id="cancel-add-label-button" onClick={stopCreateLabel}>Cancel</button>
                        </div>
                        :
                        labelsList.map((label, index) => (
                          <TextLabel 
                          key={index}
                          index={index}
                          label_name={label.label_name} 
                          label_color={label.label_color} 
                          isDeletable={false}
                          label_type="create-project"/>
                        ))
                      }
                    </div>
                </div>
                <div id="project-task-navbar">
                {!guestMode && <button id="new-task-button" onClick={handleTaskCreationStart}> New Task</button>}
                </div>
                <div className="project-task-container">
                    {projectTasks.map((task, index) => (
                        <TaskCard key={index} task_info={task} 
                        onDelete={() => handleTaskDelete(task._id)}
                        thumbnail={task.thumbnail}/>
                    ))}
                </div>
              {!isLoading && currentTasks.length==0 &&
                <div id="no-task-placeholder"> 
                  <img src={no_tasks_img}></img>
                  There are no tasks here 
                  <div id="no-task-placeholder-subtxt"> Click on <b>New Task</b> to create one </div>
                </div>
              }
            </div>
            }

        </div>
    );
};