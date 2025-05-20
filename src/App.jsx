// src/App.jsx (updated with platform routes)
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import StaffRoute from './components/StaffRoute'; // We'll create this next
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/platform/Accounts';
import Users from './pages/platform/Users';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Component to check if route requires staff permission
const StaffRouteCheck = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  
  if (!currentUser || !currentUser.is_staff) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes - no layout */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes - for all authenticated users */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Platform administration routes - staff only */}
          <Route path="/platform/accounts" element={
            <ProtectedRoute>
              <StaffRouteCheck>
                <Accounts />
              </StaffRouteCheck>
            </ProtectedRoute>
          } />
          
          {/* Add Users route */}
          <Route path="/platform/users" element={
            <ProtectedRoute>
              <StaffRouteCheck>
                <Users />
              </StaffRouteCheck>
            </ProtectedRoute>
          } />
          
          {/* Redirect root to dashboard or login */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          {/* 404 route */}
          <Route path="*" element={
            <Layout>
              <div className="text-center mt-5">
                <h1>404 - Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
              </div>
            </Layout>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;