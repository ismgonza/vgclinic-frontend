import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Layout from './Layout/Layout';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  
  if (loading) {
    // Show loading spinner or placeholder while checking auth
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }
  
  // Wrap with layout and render children if authenticated
  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;