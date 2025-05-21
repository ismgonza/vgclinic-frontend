// src/components/ProtectedRoute.jsx
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
  
  // Just return children directly, since Layout is already included in each component 
  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;