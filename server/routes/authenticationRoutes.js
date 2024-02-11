const express = require('express');
const router = express.Router();
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const authController = require("../authenticationController")
const middleware = require('../middleware'); // Import any required middleware
const config = require("../config");


router.post("/login", middleware.validateLogin, async (req, res) => {
    const validationErrors = validationResult(req);
    console.log("Chiamato endpoint /login");

    if (!validationErrors.isEmpty()) {
        return res.status(422).json({ errors: validationErrors.array() });
    }

    const { username, password } = req.body;

    try {
        const loginSuccess = await authController.loginUser(res, username, password);

        if (loginSuccess) {
            const data = {
                time: Date(),
                username: username,
            };

            const token = jwt.sign(data, config.JWT_SECRET_KEY, { expiresIn: '4h' }); // Set a proper expiration time.

            await res.cookie("username", username); // Use secure and HttpOnly flags.
            return res.status(200).json({ message: "User logged in successfully", jwt: token });
        } 
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/guest_login', async (req, res) => {
    try {
      // Create a payload for the guest user.
      const guestPayload = {
        time: Date(),
        username: "guest",
      };
  
      // Generate a guest JWT.
      const guestToken = jwt.sign(guestPayload, config.GUEST_JWT_SECRET_KEY, {
        expiresIn: '4h', // Set an appropriate expiration time.
      });
  
      // Set the guest JWT as a cookie (or however you prefer to handle it).  
      return res.status(200).json({ message: 'Guest user logged in successfully', jwt: guestToken });
    } catch (error) {
      console.error('Guest login error:', error);
      return res.status(500).json({ message: 'Internal server error'});
    }
  });

router.post("/verify_jwt", async (req, res) => {
    const { token } = req.body;
    console.log("Chiamato endpoint /verify_jwt")
    let isJwtValid = false;
    jwt.verify(token, config.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            // Token is invalid (e.g., expired)
            console.log('Token is invalid');
        } else {
            // Token is valid, and the payload is in 'decoded'
            console.log('Token is valid:', decoded);
            isJwtValid = true;
        }
    });
    jwt.verify(token, config.GUEST_JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            // Token is invalid (e.g., expired)
            console.log('Token is invalid');
        } else {
            // Token is valid, and the payload is in 'decoded'
            console.log('Token is valid:', decoded);
            isJwtValid = true;
        }
    });
    if(isJwtValid) 
        return res.status(200).json({"message": "Token is valid"});
    else
        return res.status(400).json({"message": "Token is invalid"})
})

module.exports = router;