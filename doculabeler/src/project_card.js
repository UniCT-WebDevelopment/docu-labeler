import ProjectCardDropdown from './project_card_dropdown'
import placeholder from "./img/empty-folder.png"
import { useEffect, useState } from "react";
import publicImg from "./img/public.png";
import privateImg from "./img/private.png";

import { Link } from 'react-router-dom';

import {ExportProjectDataPage} from "./export_project_data";

const apiAddress = process.env.REACT_APP_.DOCULABELER_API_ADDRESS;

export const ProjectCard = ({ title, id, creator, completed_tasks, total_tasks, ok_annotations, missing_annotations, creation_date, onDelete, thumbnail, isPublic, projects, updateProjects}) => {
  const [isExportMenuActive, setExportMenuState] = useState(false);
  const [projectData, setProjectData] = useState([]);
  const [imgThumbnail, setImgThumbnail] = useState(placeholder);
  

  const get_project_annotations = async () => {
    console.log("GET PROJECT ANNOTATIONS")
    const project_id = id;
    await fetch(`http://${apiAddress}/annotation/get_project_annotations_export`, {
        method: 'POST',
        headers: {
          //'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({project_id})
        //body: formData.toString()
      })
      .then(async response => await response.json())
      .then(data => {
        console.log("proj data", data);
        setProjectData(data);
    });
  }

  const publish_project = async (e) => {
    e.preventDefault();
    const updProjects = [...projects]
    const project_id = id;
    await fetch(`http://${apiAddress}/project/publish_project`, {
        method: 'POST',
        headers: {
          //'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({project_id})
        //body: formData.toString()
      })
      .then(async response => await response.json())
      .then(data => {
        console.log("Progetto pubblicato!");
    });
    const currProjectIdx = updProjects.findIndex(
      (project) =>
        project._id == project_id
    );
    if(currProjectIdx!=-1) 
      updProjects[currProjectIdx].public = true;
    updateProjects(updProjects);
  }

  const private_project = async (e) => {
    e.preventDefault();
    const updProjects = [...projects];
    const project_id = id;
    await fetch(`http://${apiAddress}/project/private_project`, {
        method: 'POST',
        headers: {
          //'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({project_id})
        //body: formData.toString()
      })
      .then(async response => await response.json())
      .then(data => {
        console.log("Progetto privatizzato!");
    });
    const currProjectIdx = updProjects.findIndex(
      (project) =>
        project._id == project_id
    );
    if(currProjectIdx!=-1) 
      updProjects[currProjectIdx].public = false;
    updateProjects(updProjects);
  }

  const get_task_image = async (currentImageId, task_id) => {
    try {
      const project_id = id;

      const response = await fetch(`http://${apiAddress}/task/get_task_image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project_id, task_id, currentImageId })
      });
    
      if (!response.ok) {
        throw new Error("Error on images retrieval");
      }
    
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error("Error fetching image:", error);
      throw error; // Rethrow the error for handling elsewhere, if needed
    } 
  }

  useEffect(() => {
    if(thumbnail!=""){
      setImgThumbnail("data:image/jpeg;base64,"+thumbnail);  
    }
  }, [])


    return (
      <Link className="card-link" to={`/projects/${id}`}   
      style={{textDecoration: "none", color: "inherit"}}>
        { isExportMenuActive && 
        <div id="overlay" onClick={(e) => e.preventDefault()}> 
          <ExportProjectDataPage 
            onClick={(e) => e.stopPropagation()}
            getProjectAnnotations={get_project_annotations}
            getTaskImage={get_task_image}
            onExportCancel={(e)=> {e.preventDefault(); setExportMenuState(false)}}
            projectData={projectData}
            initProjectData={()=>setProjectData([])}
          />
        </div>}
        <div className="project-card">
            <img className="card-thumbnail" src={imgThumbnail} style={{height: "100%", backgroundSize: "cover", objectFit: "cover"}}>
            </img>
            <div className="card-info">
              <div className="card-info-upper">
                <div className="project-name-menu">
                  <div className="project-name">
                    {title}
                    <img src={isPublic ? publicImg:privateImg} width="25px"></img>
                  </div>
                </div>
                <ProjectCardDropdown index={id} title={title} 
                  creator={creator}
                  onDelete={onDelete} 
                  isPublic={isPublic}
                  onPublish={publish_project} 
                  onPrivate={private_project}
                  onExportStart={(e)=> {e.preventDefault(); setExportMenuState(true)}}/>
    
                <div className="project-creator-name">{creator}</div>
                <div className="project-task-counter">{completed_tasks}/{total_tasks}</div>
                <div className="project-op-error"></div>
              </div>
              <div className="card-info-lower">
                <div className="project-annotation-counter"> 
                  <div className="ok-annotations-counter">{ok_annotations}</div>
                  <div className="missing-annotations-counter">{missing_annotations}</div>
                </div>
                <p className="card-divisor"></p>
                <div className="project-creation-date">{creation_date}</div> 
              </div>
            </div>
        </div>
        </Link>
      );
  };