import React, { useState } from 'react'; // Import useState if you're managing form input state
import { useNavigate } from 'react-router-dom'; // Import useHistory for redirection
import load_icon from "./img/loader.png"

import './register.css';
const apiAddress = process.env.REACT_APP_.DOCULABELER_API_ADDRESS;

export const RegisterComponent = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const setMessage = (error_target, error_message) => {
        let username_error_el = document.getElementById("register-username-error");
        let password_error_el = document.getElementById("register-password-error");
        if(error_target == "username"){
            username_error_el.innerHTML = error_message;
        }
        else if (error_target == "list"){
            let psw_error_msg = error_message.filter((msg)=>msg.path=="password").map((msg)=>msg.msg).join('\n')
            let usr_error_msg = error_message.filter((msg)=>msg.path=="username").map((msg)=>msg.msg).join('\n')
            console.log(usr_error_msg);
            password_error_el.innerHTML = psw_error_msg;
            username_error_el.innerHTML = usr_error_msg;    
        }
        else {
            password_error_el.innerHTML = error_message;
        }
    }

    const handleLogin = async (username, password) => {
        try {
            // Use formData.username and formData.password to send to the server
            const currFormData = new URLSearchParams();
            currFormData.append('username', username);
            currFormData.append('password', password);
            const response = await fetch(`http://${apiAddress}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: currFormData.toString(),
            });

            if (response.ok) {
                console.log("Login OK!");
                let data = await response.json();
                localStorage.setItem('jwt', data.jwt);
                localStorage.setItem('username', username);
                setIsLoading(false);
                navigate("/projects");
            } else {
                console.log("Login KO!")
            }
        } catch (error) {
            console.log("Login ERRORE!")
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior
        // Retrieve the form data
        const formData = {
            username: e.target.username.value,
            password: e.target.password.value,
            password_confirm: e.target.password_confirm.value,
        };
        try {
          // Make an HTTP POST request to your registration endpoint
          const response = await fetch(`http://${apiAddress}/register`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json', // Set the content type to JSON
            },
            body: JSON.stringify(formData),
          });
          
      
          // Check if the response is successful (status code 200)
          if (response.ok) {
            // Registration was successful, you can redirect to another page or show a success message
            //setMessage("password", "Registration successful!");
            setIsLoading(true);
            await handleLogin(formData.username, formData.password);
          } else {
            // Registration failed, handle the error message from the server response
            const data = await response.json();
            setMessage(data.target, data.message); // Set the error message
          }
          setIsLoading(false);
        } catch (error) {
          console.error("Error during registration:", error);
          setMessage("other", "An error occurred during registration.");
        }
    }



    return (
    <div id="register-component">
        {isLoading && <img id="loading-icon" src={load_icon} width="75px"/>}
        {isLoading && <div id="overlay"></div>} 
        <h1 id="title">DocuLabeler</h1>
        <hr id="register-linebreak"></hr>
        <form id="register-form" onSubmit={handleSubmit}> 
            <div id="register-username-header">Username</div>
            <input id="register-username" name="username" placeholder="" type="text"></input>
            <span id="register-username-error"> </span>
            <div>Password</div>
            <input id="register-password" name="password" placeholder="" type="password"></input>
            <div>Confirm Password</div>
            <input id="register-password-confirm" name="password_confirm" placeholder="" type="password"></input>
            <span id="register-password-error"> </span>
            <input id="register-submit" type="submit" value="Register"/> 
            <div id="register-footer">
                <a href="/login" id="login-link" >Back to login</a>
            </div>
        </form>
    </div>
    )
}
