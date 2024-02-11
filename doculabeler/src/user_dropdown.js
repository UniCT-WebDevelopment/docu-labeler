
import { useNavigate } from "react-router-dom";

export const UserDropDown = () => {
    let navigate = useNavigate();

    // Function to log the user out
    const logout = () => {
        
        // Clear the JWT token and any other stored user data
        localStorage.removeItem('jwt');
        localStorage.removeItem('username');
        
        // You may also want to clear any other user-related state in your app
        
        // Redirect the user to the login page or any other appropriate page
        // For example, if you're using React Router:
        navigate("/login");
    };

    return (
        <div id="user-dropdown">
            <button onClick={logout}> Log Out </button>
        </div>
    )
}