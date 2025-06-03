// src/App.jsx - Updated with TreatmentDetail route
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { AccountProvider } from './contexts/AccountContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Accounts from './pages/platform/Accounts';
import Users from './pages/platform/Users';
import Services from './pages/platform/services/Services';
import Features from './pages/platform/services/Features';
import Plans from './pages/platform/services/Plans';
import ServicesList from './pages/platform/services/ServicesList';
import Contracts from './pages/platform/Contracts';
import Locations from './pages/clinic/Locations';
import Catalog from './pages/clinic/catalog/Catalog';
import Specialties from './pages/clinic/catalog/Specialties';
import CatalogItems from './pages/clinic/catalog/CatalogItems';
import Patients from './pages/clinic/Patients';
import PatientDetail from './pages/clinic/PatientDetail';
import Treatments from './pages/clinic/Treatments';
import TreatmentDetail from './pages/clinic/TreatmentDetail';
import NewTreatment from './pages/clinic/NewTreatment';
import InvitationAcceptance from './pages/InvitationAcceptance';
import Team from './pages/clinic/Team';
import TeamMembers from './pages/clinic/TeamMembers';
import TeamInvitations from './pages/clinic/TeamInvitations';
import TeamPermissions from './pages/clinic/TeamPermissions';

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
        <AccountProvider>
          <Routes>
            {/* Public routes - no layout */}
            <Route path="/login" element={<Login />} />
            
            <Route path="/accept-invitation/:token" element={<InvitationAcceptance />} />

            {/* Protected routes - for all authenticated users */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Platform administration routes - staff only */}
            <Route path="/platform/accounts" element={<ProtectedRoute><StaffRouteCheck><Accounts /></StaffRouteCheck></ProtectedRoute>} />
            {/* Users route */}
            <Route path="/platform/users" element={<ProtectedRoute><StaffRouteCheck><Users /></StaffRouteCheck></ProtectedRoute>} />
            {/* Services routes */}
            <Route path="/platform/services" element={<ProtectedRoute><StaffRouteCheck><Services /></StaffRouteCheck></ProtectedRoute>} />
            <Route path="/platform/services/services" element={<ProtectedRoute><StaffRouteCheck><ServicesList /></StaffRouteCheck></ProtectedRoute>} />
            <Route path="/platform/services/features" element={<ProtectedRoute><StaffRouteCheck><Features /></StaffRouteCheck></ProtectedRoute>} />
            <Route path="/platform/services/plans" element={<ProtectedRoute><StaffRouteCheck><Plans /></StaffRouteCheck></ProtectedRoute>} />
            <Route path="/platform/contracts" element={<ProtectedRoute><StaffRouteCheck><Contracts /></StaffRouteCheck></ProtectedRoute>} />

            <Route path="/clinic/locations" element={<ProtectedRoute><Locations /></ProtectedRoute>} />
            <Route path="/clinic/catalog" element={<ProtectedRoute><Catalog /></ProtectedRoute>} />
            <Route path="/clinic/catalog/specialties" element={<ProtectedRoute><Specialties /></ProtectedRoute>} />
            <Route path="/clinic/catalog/items" element={<ProtectedRoute><CatalogItems /></ProtectedRoute>} />
            <Route path="/clinic/patients/edit/:id" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
            <Route path="/clinic/patients/:id" element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} />
            <Route path="/clinic/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
            <Route path="/clinic/treatments/:id" element={<ProtectedRoute><TreatmentDetail /></ProtectedRoute>} />
            <Route path="/clinic/treatments" element={<ProtectedRoute><Treatments /></ProtectedRoute>} />
            <Route path="/clinic/treatments/new" element={<ProtectedRoute><NewTreatment /></ProtectedRoute>} />
            <Route path="/clinic/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
            <Route path="/clinic/team/members" element={<ProtectedRoute><TeamMembers /></ProtectedRoute>} />
            <Route path="/clinic/team/invitations" element={<ProtectedRoute><TeamInvitations /></ProtectedRoute>} />
            <Route path="/clinic/team/permissions" element={<ProtectedRoute><TeamPermissions /></ProtectedRoute>} />

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
        </AccountProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;