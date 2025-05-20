// src/components/StaffRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Layout from './Layout/Layout';

const StaffRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);
  
  if (loading) {
    // Show loading spinner or placeholder while checking auth
    return <div>Loading...</div>;
  }
  
  if (!currentUser || !currentUser.is_staff) {
    // Redirect to dashboard if not staff
    return <Navigate to="/dashboard" />;
  }
  
  // Wrap with layout and render children if authenticated and staff
  return <Layout>{children}</Layout>;
};

export default StaffRoute;