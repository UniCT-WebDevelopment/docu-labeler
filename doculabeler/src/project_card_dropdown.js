import { PublishConfirm } from "./publish_confirm";
import { DeleteConfirm } from "./delete_confirm";
import { PrivateConfirm } from "./private_confirm";
import {useState} from "react";

const ProjectCardDropdown = (params) => {
  const [confirmPublishWarning, setConfirmPublishWarning] = useState(false);
  const [confirmPrivateWarning, setConfirmPrivateWarning] = useState(false);
  const [confirmDeleteWarning, setConfirmDeleteWarning] = useState(false);

  const onProjectDelete = (e) => {
    e.preventDefault();
    params.onDelete();
  }
  const tryPublish = (e) => {
    e.preventDefault();
    setConfirmPublishWarning(true);
  }

  const tryPrivate = (e) => {
    e.preventDefault();
    setConfirmPrivateWarning(true);
  }
  const tryDelete = (e) => {
    e.preventDefault();
    setConfirmDeleteWarning(true);
  }
  const username = localStorage.getItem("username")
  console.log("Creatore", params.creator, "username", username);
  return (
    <div className="dropdown" onClick={params.onClick}>
      {confirmPublishWarning && 
      <PublishConfirm 
      onPublish={(e) => {params.onPublish(e); setConfirmPublishWarning(false);}} 
      onCancelPublish={()=>setConfirmPublishWarning(false)}/>
      }
      {confirmDeleteWarning && 
      <DeleteConfirm 
      onDelete={onProjectDelete} 
      onCancelDelete={()=>setConfirmDeleteWarning(false)}/>
      }
      {confirmPrivateWarning && 
      <PrivateConfirm
      onPrivate={(e)=> {params.onPrivate(e); setConfirmPrivateWarning(false);}}
      onCancelPrivate={()=>setConfirmPrivateWarning(false)}/>
      }
      <button className="project-menu-button"></button>
      {!confirmPublishWarning &&
       !confirmDeleteWarning && 
      <div className="dropdown-content">
        <a href="#" onClick={params.onExportStart}>Export</a>
        {!params.isPublic && <a href="#" onClick={tryPublish}>Publish</a>}
        {params.isPublic && params.creator==username && <a href="#" onClick={tryPrivate}>Private</a>}
        {params.creator==username && <a href="#" onClick={tryDelete}>Delete</a>}
      </div>
      }
    </div>
  )
};


export default ProjectCardDropdown
