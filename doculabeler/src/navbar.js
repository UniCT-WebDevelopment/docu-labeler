import logo from "./img/label_noborder.png"
import { useEffect, useState } from "react";
import { CreateProjectPage } from "./create_project";
import { param } from "express-validator";
import { useNavigate } from "react-router-dom";
import { UserDropDown } from "./user_dropdown";



let user_init = "#"
export const NavBar = (params) => {
    let navigate = useNavigate();

    useEffect(()=> {
        if(localStorage.getItem("username")!=="")
            user_init = localStorage.getItem("username")[0].toUpperCase();
    },[])

    const [isUserDropdownActive, setUserDropdown] = useState(false)

    let isCreateFormVisible = params.isCreateFormVisible;
    

    //const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);

    const hasCreateButton = params.hasCreateButton;

    const startCreate = params.setIsCreateFormVisible;

    const endCreate = params.setIsCreateFormHidden;

    const goToProjects = () => {
        navigate("/projects");
    }

    const goToPublicProjects = () => {
        navigate("/projects/public");
    }

    return (
        <div id="navbar-container">
            <div id="navbar-left">
                <img src={logo} width="35px"></img>
                <h2>DocuLabeler</h2>
                <h4 className="navbar-path" onClick={goToProjects}>My Projects</h4>
                <h4 className="navbar-path" onClick={goToPublicProjects}>Public Projects</h4>
            </div>
            <div id="navbar-right">
                {hasCreateButton && <button id="create-button" onClick={startCreate}> Create </button>}
                <button onClick={() => {setUserDropdown(!isUserDropdownActive)}} id="user-button">{user_init}
                    {isUserDropdownActive && <UserDropDown/>}
                </button>
            </div>
            {isCreateFormVisible && <CreateProjectPage onEndCreate={endCreate} 
                                    onCreate={params.onProjectCreation}/>}
        </div>
    );
  };