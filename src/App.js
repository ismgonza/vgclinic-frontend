// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/api';
import { AccountProvider } from './context/AccountContext';

// Pages
import LoginPage from './pages/LoginPage';
 // -- Location pages
import LocationsListPage from './pages/locations/LocationsListPage';
import LocationCreatePage from './pages/locations/LocationCreatePage';
import LocationEditPage from './pages/locations/LocationEditPage';
import LocationDetailPage from './pages/locations/LocationDetailPage';
import RoomCreatePage from './pages/locations/RoomCreatePage';
import RoomEditPage from './pages/locations/RoomEditPage';
// -- Staff pages
import StaffListPage from './pages/staff/StaffListPage';
import StaffDetailPage from './pages/staff/StaffDetailPage';
import StaffCreatePage from './pages/staff/StaffCreatePage';
import StaffEditPage from './pages/staff/StaffEditPage';
import ScheduleCreatePage from './pages/staff/ScheduleCreatePage';
import ScheduleEditPage from './pages/staff/ScheduleEditPage';
import StaffLocationCreatePage from './pages/staff/StaffLocationCreatePage';
import StaffLocationEditPage from './pages/staff/StaffLocationEditPage';
import InviteStaffForm from './components/staff/InviteStaffForm';
import AcceptInvitePage from './pages/staff/AcceptInvitePage';

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
                <Route path="/staff/:id/locations/add" element={<StaffLocationCreatePage />} />
                <Route path="/staff/:id/locations/edit/:locationId" element={<StaffLocationEditPage />} />
                <Route path="/staff/:id/schedule/add" element={<ScheduleCreatePage />} />
                <Route path="/staff/:id/schedule/edit/:scheduleId" element={<ScheduleEditPage />} />   
                <Route path="/staff/invite" element={<InviteStaffForm />} />
                <Route path="/staff/accept-invite/:token" element={<AcceptInvitePage />} />             

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