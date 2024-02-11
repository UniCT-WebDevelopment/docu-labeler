import placeholder from './img/thumb_placeholder.jpg';
import TaskCardDropdown from './task_card_dropdown';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ExportTaskDataPage } from './export_task_data';

const apiAddress = process.env.REACT_APP_.DOCULABELER_API_ADDRESS;

export const TaskCard = (params) => {

  const [isExportMenuActive, setExportMenuState] = useState(false)
  const [taskData, setTaskData] = useState({})
  const [taskImages, setTaskImages] = useState([])
  let thumbnail = "data:image/jpeg;base64,"+params.thumbnail;
  let task_info = params.task_info;
  const project_id = task_info.project_id;
  const task_id = task_info._id;

  const get_task_annotations = async () => {
      console.log("GET TASK ANNOTATIONS")
      await fetch(`http://${apiAddress}/annotation/get_task_annotations_export`, {
        method: 'POST',
        headers: {
          //'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({project_id, task_id})
        //body: formData.toString()
      })
      .then(async response => await response.json())
      .then(data => {
        setTaskData(data);
    });
}

const get_task_images = async () => {
  let images = [];
  let total_images = 0;
  console.log("Richiesto numero di immagini per il task");
  await fetch(`http://${apiAddress}/task/get_task_images_len`, {
      method: 'POST',
      headers: {
          //'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({project_id, task_id})
      //body: formData.toString()
  })
  .then(async response => await response.json())
  .then(data => {
      total_images = data.task_images;
  })
  .then(async ()=> {
    console.log("Numero immagini", total_images);
    for(let i = 0; i<total_images; i++) {
      const currentImageId = i.toString();
      console.log("Richiesta immagine task numero", i);
      await fetch(`http://${apiAddress}/task/get_task_image`, {
          method: 'POST',
          headers: {
              //'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({project_id, task_id, currentImageId})
          //body: formData.toString()
      })
      .then((response) => {
          if(!response.ok) {
              throw new Error("Error on images retrieval");
          }
          return response.blob();
      })
      .then((blob) => {
          const imageUrl = URL.createObjectURL(blob);
          images.push(imageUrl);
      });
  }
  });
  console.log("Totale immagini!", total_images);
  setTaskImages(images);
  
}
  const get_task_image = async (currentImageId) => {
    try {
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

  return(
    <div className="project-task-card">
      {isExportMenuActive && <div id="overlay"></div>}
      <div>
        <img className="task-card-thumbnail" src={thumbnail}></img>
        <div className="task-card-base-info">
          <div className="task-title"> {task_info.title} </div>
          <div>
            <div className="task-creator"> <b>Creator:</b> {task_info.creator} </div>
            <div className="task-update"> <b>Last Update:</b> {task_info.last_update_date} </div>
          </div>
        </div>
      </div>
      <div className="project-task-left-side">
        <TaskCardDropdown onDelete={params.onDelete} onExportStart={()=> setExportMenuState(true)}/>
        <Link to={`/projects/${task_info.project_id}/${task_info._id}`}>
        <button className="project-task-open-button"> Open </button>
        </Link>
      </div>
      {isExportMenuActive && <ExportTaskDataPage 
      getTaskAnnotations={get_task_annotations} 
      getTaskImages={get_task_images} 
      taskData={taskData} 
      onExportCancel={()=>setExportMenuState(false)}
      getTaskImage={get_task_image}/>}
    </div>
  )
}