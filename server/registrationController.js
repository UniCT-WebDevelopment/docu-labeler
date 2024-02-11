const User = require("./schemas/User")

async function registerUser(res, username, password) {
    try {
        // Check if the username already exists in the database
        const existingUser = await User.findOne({ username });
  
        if (existingUser) {
          return res.status(400).json({
            target: 'username',
            message: 'Username is already in use',
          });
        }
  
        // Create a new user using the User model
        const newUser = new User({ username, password });
  
        // Save the new user to the database
        await newUser.save();
  
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error', error);
        res.status(500).json({
          target: 'password',
          message: 'Registration failed',
        });
    }
}

module.exports = {
    registerUser,
};