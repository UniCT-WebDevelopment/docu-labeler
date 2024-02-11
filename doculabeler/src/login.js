import React, { useState } from 'react'; // Import useState if you're managing form input state
import { useNavigate } from 'react-router-dom'; // Import useHistory for redirection

import './login.css';
import load_icon from "./img/loader.png"

const apiAddress = process.env.REACT_APP_.DOCULABELER_API_ADDRESS;


const LoginComponent = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const [isLoading, setIsLoading] = useState(false);


    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const loginErrorMessage = document.getElementById("login-error-message");
        try {
            // Use formData.username and formData.password to send to the server
            const requestBody = {
                username: formData.username,
                password: formData.password,
            };
    
            const response = await fetch(`http://${apiAddress}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Use JSON content type.
                },
                body: JSON.stringify(requestBody), // Convert the request body to JSON.
            });
            const data = await response.json();
            if (response.ok) {
                console.log("OK!!");
                console.log(data);
                localStorage.setItem('jwt', data.jwt);
                localStorage.setItem('username', formData.username);
                setIsLoading(false);
                navigate("/projects");
            } else {
                setIsLoading(false);
                console.log("KO!", data);
                loginErrorMessage.innerText = data.message;
            }
        } catch (error) {
            setIsLoading(false);
            console.log("ERRORE!!");
        }
    };

    const handleGuestLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const loginErrorMessage = document.getElementById("login-error-message");
        try {
            // Use formData.username and formData.password to send to the server
            const response = await fetch(`http://${apiAddress}/auth/guest_login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Use JSON content type.
                },
            });
            const data = await response.json();
            if (response.ok) {
                console.log("OK!!");
                console.log(data);
                localStorage.setItem('jwt', data.jwt);
                localStorage.setItem('username', "");
                setIsLoading(false);
                navigate("/projects/public");
            } else {
                setIsLoading(false);
                console.log("KO!", data);
                loginErrorMessage.innerText = data.message;
            }
        } catch (error) {
            setIsLoading(false);
            console.log("ERRORE!!");
        }
    };

    return (
        <div id="login-component">
            {isLoading && <div id="overlay"> <div id="loading-div"><img id="loading-icon" src={load_icon}/> </div></div>}
            <h1 id="title">DocuLabeler</h1>
            <hr id="register-linebreak"></hr>
            <form id="login-form" onSubmit={handleLoginSubmit} method="post"> 
                <div id="login-username-header">Username</div>
                <input id="login-username" name="username" placeholder="" type="text" 
                onChange={(e) =>
                    setFormData({...formData, username: e.target.value})}>
                </input>
                <div>Password</div>
                <input id="login-password" name="password" placeholder="" type="password"
                onChange={(e) =>
                    setFormData({...formData, password: e.target.value})}>
                </input>
                <div id="login-error-message"></div>
                <input id="login-submit" type="submit" value="Log in"/> 
                <div id="login-footer">
                    <div>New user? <a href="/register" id="register-link" >Register now!</a> </div>
                    <div onClick={handleGuestLoginSubmit} id="enter-as-guest">Log in as a guest</div>    
                </div>
            </form>
        </div>
    )
}


  


export default LoginComponent;