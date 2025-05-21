// src/App.jsx - Back to simpler structure
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/platform/Accounts';
import Users from './pages/platform/Users';
import Services from './pages/platform/services/Services';
import Features from './pages/platform/services/Features';
import Plans from './pages/platform/services/Plans';
import ServicesList from './pages/platform/services/ServicesList';
import Contracts from './pages/platform/Contracts';
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
          
          {/* Users route */}
          <Route path="/platform/users" element={
            <ProtectedRoute>
              <StaffRouteCheck>
                <Users />
              </StaffRouteCheck>
            </ProtectedRoute>
          } />
          
          {/* Services routes */}
          <Route path="/platform/services" element={
            <ProtectedRoute>
              <StaffRouteCheck>
                <Services />
              </StaffRouteCheck>
            </ProtectedRoute>
          } />
          
          <Route path="/platform/services/services" element={
            <ProtectedRoute>
              <StaffRouteCheck>
                <ServicesList />
              </StaffRouteCheck>
            </ProtectedRoute>
          } />
          
          <Route path="/platform/services/features" element={
            <ProtectedRoute>
              <StaffRouteCheck>
                <Features />
              </StaffRouteCheck>
            </ProtectedRoute>
          } />
          
          <Route path="/platform/services/plans" element={
            <ProtectedRoute>
              <StaffRouteCheck>
                <Plans />
              </StaffRouteCheck>
            </ProtectedRoute>
          } />

          <Route path="/platform/contracts" element={
            <ProtectedRoute>
              <StaffRouteCheck>
                <Contracts />
              </StaffRouteCheck>
            </ProtectedRoute>
          } />
          
          {/* Redirect root to dashboard or login */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          {/* 404 route */}
          <Route path="*" element={
            <div className="text-center mt-5">
              <h1>404 - Page Not Found</h1>
              <p>The page you're looking for doesn't exist.</p>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;