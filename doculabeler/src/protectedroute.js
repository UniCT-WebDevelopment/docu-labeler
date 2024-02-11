import React from 'react';
import { Navigate } from 'react-router-dom';

const apiAddress = process.env.REACT_APP_.DOCULABELER_API_ADDRESS;

const ProtectedRoute = ({ children }) => {
  // Check if the user is authenticated (e.g., JWT exists)
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  async function checkAuthentication() {
    if (!localStorage.getItem('jwt')) return false;
    const currFormData = new URLSearchParams();
    currFormData.append('token', localStorage.getItem('jwt'));
    const response = await fetch(`http://${apiAddress}/auth/verify_jwt`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: currFormData.toString(),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  }

  React.useEffect(() => {
    checkAuthentication().then((result) => {
      setIsAuthenticated(result);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div> loading </div>
    )
  }
  if (isAuthenticated) {
    // User is authenticated, allow access to the child components
    return children;
  } else {
    // User is not authenticated, redirect to a login page or show an unauthorized message
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute