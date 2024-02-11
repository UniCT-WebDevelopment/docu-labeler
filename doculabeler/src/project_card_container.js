import { ProjectCard } from "./project_card";
import {useState, useEffect} from 'react';
import whiteBox from "./img/box_white.png";
import notLogged from "./img/not_logged.png";

const apiAddress = process.env.REACT_APP_.DOCULABELER_API_ADDRESS;

export const ProjectCardContainer = (params) => {

    const [requestsQueue, setRequestsQueue] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [projects, setProjects] = useState(params.projects_list);

    const guestMode = params.guestMode;

    async function deleteProject(project_id, user_id) {
      const formData = new URLSearchParams();
      formData.append('project_id', project_id);
      formData.append('user_id', user_id);
      const response = await fetch(`http://${apiAddress}/project/delete_project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          "Access-Control-Allow-Origin": "http://172.23.192.1:8080",
        },
        body: formData.toString()
      })

      if (response.status === 200) {
        const data = await response.json();
        console.log("Project deleted:", data);
        const updatedProjects = projects.filter((project) => project._id !== project_id);
        setProjects(updatedProjects);
      } else if (response.status === 404) {
        console.error("Project not found.");
      } else if (response.status === 401) {
        console.error("Unauthorized. User is not the owner.");
      } else if (response.status === 500) {
        console.error("Internal server error.");
      } else {
        console.error("Unhandled status code:", response.status);
      }
    } 

    const sendRequest = async (requestFunction) => {
      try {
          console.log(requestFunction)
          await requestFunction();
      } catch (error) {
          // Handle errors here
          console.error('Request error:', error);
      }
    };

    const enqueueRequest = (requestFunction) => {
        setRequestsQueue((prevQueue) => [...prevQueue, requestFunction]);
    };

    useEffect(() => {
      // Process requests in the queue when not already processing
      if (!isProcessing && requestsQueue.length > 0) {

        setIsProcessing(true);
  
        // Dequeue the next request and send it to the server
        const nextRequest = requestsQueue.shift();
        console.log("Processo richiesta in coda", nextRequest)

        sendRequest(nextRequest)
          .then(() => {
            // Request completed successfully
            setIsProcessing(false);
          })
          .catch((error) => {
            // Handle errors here
            setIsProcessing(false);
          });
      }
    }, [requestsQueue, isProcessing]);

    const enqueueHandleDelete = (project_id, user_id) => {
      return () => {
        deleteProject(project_id, user_id);
      };
    };
    return (
        <div className="project-card-container">
          {projects.length > 0 ?
            projects.map((project, index) => (
              <ProjectCard key={index} title={project.title} id={project._id} creator={project.creator} 
                completed_tasks={project.completed_tasks} total_tasks={project.total_tasks} 
                ok_annotations={project.ok_annotations} missing_annotations={project.missing_annotations}
                creation_date={project.creation_date}
                thumbnail={project.thumbnail}
                isPublic={project.public}
                projects={projects}
                updateProjects={setProjects}
                onDelete={() => enqueueRequest(enqueueHandleDelete(project._id, project.user_id))}
                />
          )) :
          <div id="empty-project-list-container">
            <img src={guestMode ? notLogged:whiteBox} width="10%" className="prevent-select"/>  
            <div id="empty-project-txt" className="prevent-select"> {guestMode ? "You're not logged in" : "Nothing to see here"} </div>
            <div id="empty-project-subtxt" className="prevent-select"> 
              {guestMode ? "Create an account to set up your personal projects" : 
              <span
                dangerouslySetInnerHTML={{
                __html: 'Click on <b>Create</b> to set up your first project',}}
              />} 
            </div>
          </div>}
        </div>
    );
};