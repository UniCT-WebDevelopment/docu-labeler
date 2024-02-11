const bcrypt = require("bcrypt");
const User = require('./schemas/User')

async function loginUser(res, username, password) {
    try {
        // Find the user by username using Mongoose
        const existingUser = await User.findOne({ username });
    
        if (!existingUser) {
          res.status(400).json({ message: 'Username is not valid' });
          return false;
        }
    
        // Compare the password using bcrypt
        const passwordMatch = await bcrypt.compare(password, existingUser.password);
    
        if (!passwordMatch) {
          res.status(401).json({ message: 'Invalid credentials' });
          return false;
        }
    
        return true;

    } catch(error) {
        console.error("Error", error);
        res.status(500).json({ message: 'Login failed' });
        return false;
    }
}



module.exports = {
    loginUser
}