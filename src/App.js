// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/api';
import { AccountProvider } from './context/AccountContext';

// Pages
import LoginPage from './pages/LoginPage';
import LocationsListPage from './pages/locations/LocationsListPage';
import LocationCreatePage from './pages/locations/LocationCreatePage';
import LocationEditPage from './pages/locations/LocationEditPage';
import LocationDetailPage from './pages/locations/LocationDetailPage';
import RoomCreatePage from './pages/locations/RoomCreatePage';
import RoomEditPage from './pages/locations/RoomEditPage';
import StaffListPage from './pages/staff/StaffListPage';
import StaffDetailPage from './pages/staff/StaffDetailPage';
import StaffCreatePage from './pages/staff/StaffCreatePage';
import StaffEditPage from './pages/staff/StaffEditPage';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Protected route component
const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Dashboard placeholder
const Dashboard = () => (
  <MainLayout>
    <h1>Dashboard</h1>
    <p>Welcome to VG Clinic management system.</p>
  </MainLayout>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes (outside of AccountProvider) */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* All protected routes wrapped in AccountProvider */}
        <Route path="/*" element={
          <ProtectedRoute>
            <AccountProvider>
              <Routes>
                {/* Dashboard route */}
                <Route path="/" element={<Dashboard />} />
                
                {/* Location routes */}
                <Route path="/locations" element={<LocationsListPage />} />
                <Route path="/locations/create" element={<LocationCreatePage />} />
                <Route path="/locations/edit/:id" element={<LocationEditPage />} />
                <Route path="/locations/:id" element={<LocationDetailPage />} />
                <Route path="/locations/:id/rooms/create" element={<RoomCreatePage />} />
                <Route path="/locations/:id/rooms/edit/:roomId" element={<RoomEditPage />} />

                {/* Staff routes */}
                <Route path="/staff" element={<StaffListPage />} />
                <Route path="/staff/create" element={<StaffCreatePage />} />
                <Route path="/staff/edit/:id" element={<StaffEditPage />} />
                <Route path="/staff/:id" element={<StaffDetailPage />} />

                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AccountProvider>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;