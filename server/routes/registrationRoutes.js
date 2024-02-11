const express = require('express');
const router = express.Router();
const { validationResult} = require("express-validator");
const registrationController = require("../registrationController")
const middleware = require('../middleware');


router.post("/register", middleware.validateRegister, (req, res)=> {
    const validation_error = validationResult(req)
    console.log("Richiesta di registrazione avvenuta");
    if (!validation_error.isEmpty()) {
        console.log(validation_error.array());
        return res.status(422).json({
            target: "list",
            message: validation_error.array()});
    }
    else {
        console.log("Body richiesta: ", req.body);
        let username=req.body.username;
        let password=req.body.password;  
        let password_confirm = req.body.password_confirm
        if(password!=password_confirm) {
            return res.status(400).json({
                target: "password",
                message: "Le password non corrispondono"
            });
        }
        registrationController.registerUser(res, username, password);   

        //res.send(`Utente registrato! Username: ${username} Password: ${password}`);
    }
});

module.exports = router;