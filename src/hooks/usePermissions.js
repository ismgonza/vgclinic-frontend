// src/hooks/usePermissions.js - UPDATED VERSION
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { AccountContext } from '../contexts/AccountContext';
import PermissionsService from '../services/permissions.service';

export const usePermissions = () => {
  const { currentUser } = useContext(AuthContext);
  const { selectedAccount } = useContext(AccountContext);
  
  const [userPermissions, setUserPermissions] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [roleDisplay, setRoleDisplay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserPermissions();
  }, [currentUser, selectedAccount]);

  const fetchUserPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentUser || !selectedAccount) {
        setUserPermissions([]);
        setIsOwner(false);
        setUserRole(null);
        setRoleDisplay(null);
        setLoading(false);
        return;
      }

      // Staff/superuser have all permissions
      if (currentUser.is_staff || currentUser.is_superuser) {
        // Get all available permissions from backend
        const availablePermissions = await PermissionsService.getAvailablePermissions();
        const allPermissionKeys = availablePermissions.permissions.map(p => p.key);
        
        setUserPermissions(allPermissionKeys);
        setIsOwner(true);
        setUserRole('staff');
        setRoleDisplay('Staff');
        setLoading(false);
        return;
      }

      // Get user's permissions from the new backend endpoint
      const userPermData = await PermissionsService.getUserPermissions(currentUser.id);
      
      setUserPermissions(userPermData.permissions || []);
      setIsOwner(userPermData.is_owner || false);
      setUserRole(userPermData.role);
      setRoleDisplay(userPermData.role_display);
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      setError(error.message);
      setUserPermissions([]);
      setIsOwner(false);
      setUserRole(null);
      setRoleDisplay(null);
      setLoading(false);
    }
  };

  // Helper functions to check specific permissions
  const hasPermission = (permission) => {
    if (isOwner || currentUser?.is_staff || currentUser?.is_superuser) {
      return true;
    }
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions) => {
    if (isOwner || currentUser?.is_staff || currentUser?.is_superuser) {
      return true;
    }
    return permissions.some(permission => userPermissions.includes(permission));
  };

  const hasAllPermissions = (permissions) => {
    if (isOwner || currentUser?.is_staff || currentUser?.is_superuser) {
      return true;
    }
    return permissions.every(permission => userPermissions.includes(permission));
  };

  // UPDATED: Patient-specific permission checks with correct names
  const canViewPatients = () => hasPermission('view_patients_list');
  const canViewPatientDetail = () => hasPermission('view_patient_detail');
  const canViewPatientHistory = () => hasPermission('view_patient_history');
  const canManagePatientBasic = () => hasPermission('manage_patient_basic');
  const canManagePatientHistory = () => hasPermission('manage_patient_history');
  
  // UPDATED: Treatment-specific permission checks
  const canViewTreatments = () => hasPermission('view_treatments');
  const canViewAllTreatments = () => hasPermission('view_all_treatments');
  const canManageTreatments = () => hasPermission('manage_treatments');
  const canManageTreatmentNotes = () => hasPermission('manage_treatment_notes');
  
  // UPDATED: Team-specific permission checks
  const canViewTeam = () => hasPermission('view_team');
  const canInviteUsers = () => hasPermission('invite_users');
  const canManageUsers = () => hasPermission('manage_users');
  const canRemoveUsers = () => hasPermission('remove_users');
  const canManagePermissions = () => hasPermission('manage_permissions');
  
  // UPDATED: Catalog-specific permission checks
  const canViewCatalog = () => hasPermission('view_catalog');
  const canManageCatalog = () => hasPermission('manage_catalog');
  const canManageLocations = () => hasPermission('manage_locations');
  const canManageProcedures = () => hasPermission('manage_procedures');

  // UPDATED: Appointment-specific permission checks
  const canViewAppointments = () => hasPermission('view_appointments');
  const canViewAllAppointments = () => hasPermission('view_all_appointments');
  const canManageAppointments = () => hasPermission('manage_appointments');
  const canManageSchedule = () => hasPermission('manage_schedule');

  // UPDATED: Billing-specific permission checks
  const canViewBilling = () => hasPermission('view_billing');
  const canManageBilling = () => hasPermission('manage_billing');
  const canViewFinancialReports = () => hasPermission('view_financial_reports');
  const canManagePricing = () => hasPermission('manage_pricing');

  // UPDATED: Report-specific permission checks
  const canViewReports = () => hasPermission('view_reports');
  const canViewAnalytics = () => hasPermission('view_analytics');
  const canExportReports = () => hasPermission('export_reports');

  return {
    // State
    userPermissions,
    isOwner,
    userRole,
    roleDisplay,
    loading,
    error,
    
    // Generic permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Patient permissions
    canViewPatients,
    canViewPatientDetail,
    canViewPatientHistory,
    canManagePatientBasic,
    canManagePatientHistory,
    
    // Treatment permissions
    canViewTreatments,
    canViewAllTreatments,
    canManageTreatments,
    canManageTreatmentNotes,
    
    // Team permissions
    canViewTeam,
    canInviteUsers,
    canManageUsers,
    canRemoveUsers,
    canManagePermissions,
    
    // Catalog permissions
    canViewCatalog,
    canManageCatalog,
    canManageLocations,
    canManageProcedures,

    // Appointment permissions
    canViewAppointments,
    canViewAllAppointments,
    canManageAppointments,
    canManageSchedule,

    // Billing permissions
    canViewBilling,
    canManageBilling,
    canViewFinancialReports,
    canManagePricing,

    // Report permissions
    canViewReports,
    canViewAnalytics,
    canExportReports,
    
    // Utility
    refreshPermissions: fetchUserPermissions
  };
};