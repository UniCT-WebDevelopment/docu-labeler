import {NavBar} from './navbar'
import { ProjectCardContainer } from './project_card_container';
import './project.css'
import { useState, useEffect } from 'react';
import load_icon from "./img/loader.png"

const apiAddress = process.env.REACT_APP_.DOCULABELER_API_ADDRESS;

export var currPublicProjects = []
export async function fetchPublicProjects() {
    const formData = new URLSearchParams();
    formData.append('username', localStorage.getItem("username"));
    await fetch(`http://${apiAddress}/project/get_public_projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          "Access-Control-Allow-Origin": "http://172.23.192.1:8080",
        },
      })
      .then(async response => await response.json())
      .then(data => {
        currPublicProjects = data.projects_list;
        console.log("Ecco i progetti recuperati!", currPublicProjects);
    })
};

export const PublicProjectsPage = () => {

    const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [publicProjects, setPublicProjects] = useState([]);
    const [guestMode, setGuestMode] = useState([])

    useEffect(() => {
        if(localStorage.getItem("username")==="") {
            console.log("Logged in as guest");
            setGuestMode(true);
        }
    })

    useEffect(() => {
        fetchPublicProjects()
        .then((data) => {
            setPublicProjects(currPublicProjects);
            setIsLoading(false);
        })
        .catch((error) => {
            console.error("Error fetching public projects", error);
            setIsLoading(false);
        })
    }, [])


    const handleProjectCreation = () => {
        const projectName = document.querySelector(".input-container input").value;
        const errorMessage = document.querySelector("#project-name-error");
        const labelsList = document.querySelectorAll("#create-project-label-container .create-project-label");

        const labelsObjList = []
        for(let label of labelsList) {
            let computed_style = getComputedStyle(label);
            let label_name = label.innerText;
            let label_color = computed_style.getPropertyValue("border-color");
            labelsObjList.push({label_name:label_name, label_color:label_color});
        }


        let isNameValid = true;
    
        if(projectName.length>32) {
            errorMessage.innerHTML ="<b>Error!</b> The project name's length exceeds the limit of 32.";
            isNameValid = false;
        } else if(projectName.length==0) { 
            errorMessage.innerHTML ="<b>Error!</b> Project's name cannot be an empty string";
            isNameValid = false;
        } 
    
        if(isNameValid) {
            let username = localStorage.getItem("username")
            setIsLoading(true);
            setIsCreateFormVisible(false);
            fetch(`http://${apiAddress}/project/create_project`, {
                method: 'POST',
                headers: {
                    //'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username, projectName, labelsObjList})
                //body: formData.toString()
            })
            .then(response => response.json())
            .then(data => {
                fetchPublicProjects()
                    .then((data)=> {
                        setPublicProjects(currPublicProjects);
                    })
                    .catch((error) => {
                        console.log("Error fetching user projects", error);
                    })
                    .finally((e) => {
                        setIsLoading(false);
                    })
            });
        }
    }
    
    return (
        <div id="p-page-container">
            <NavBar onProjectCreation={handleProjectCreation}
            setIsCreateFormVisible={() => setIsCreateFormVisible(true)}
            setIsCreateFormHidden ={() => setIsCreateFormVisible(false)}
            hasCreateButton={!guestMode}
            isCreateFormVisible={isCreateFormVisible}/>
            {isLoading ? (
                <div id="loading-div"><img id="loading-icon" src={load_icon}/></div>
            ) : (
                <ProjectCardContainer projects_list={publicProjects} 
                 onProjectCreation={handleProjectCreation}/>
            )}
        </div>
    )
}