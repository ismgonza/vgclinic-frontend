// src/hooks/usePermissions.js - FIXED to use my-permissions endpoint
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

      // FIXED: Use the new my-permissions endpoint
      const userPermData = await PermissionsService.getMyPermissions();
      
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

  // UPDATED: Patient-specific permission checks
  const canViewPatientsList = () => hasPermission('view_patients_list');
  const canViewPatientsDetail = () => hasPermission('view_patients_detail');
  const canViewPatientsHistory = () => hasPermission('view_patients_history');
  const canManagePatientsBasic = () => hasPermission('manage_patients_basic');
  const canManagePatientsHistory = () => hasPermission('manage_patients_history');
  
  // NEW: Treatment-specific permission checks with granular permissions
  const canViewTreatmentsList = () => hasPermission('view_treatments_list');
  const canViewTreatmentsDetail = () => hasPermission('view_treatments_detail');
  const canViewTreatmentsAssigned = () => hasPermission('view_treatments_assigned');
  const canCreateTreatments = () => hasPermission('create_treatments');
  const canEditTreatments = () => hasPermission('edit_treatments');
  
  // Treatment History permissions
  const canViewTreatmentHistoryList = () => hasPermission('view_treatment_history_list');
  const canViewTreatmentHistoryDetail = () => hasPermission('view_treatment_history_detail');
  const canCreateTreatmentHistory = () => hasPermission('create_treatment_history');
  const canEditTreatmentHistory = () => hasPermission('edit_treatment_history');
  
  // Treatment Notes permissions
  const canViewTreatmentNotesList = () => hasPermission('view_treatment_notes_list');
  const canViewTreatmentNotesDetail = () => hasPermission('view_treatment_notes_detail');
  const canCreateTreatmentNotes = () => hasPermission('create_treatment_notes');
  const canEditTreatmentNotes = () => hasPermission('edit_treatment_notes');
  
  // Helper: Can view any treatments (either all or assigned)
  const canViewAnyTreatments = () => canViewTreatmentsList() || canViewTreatmentsAssigned();
  
  // NEW: Location-specific permission checks
  const canViewLocationsList = () => hasPermission('view_locations_list');
  const canViewLocationsDetail = () => hasPermission('view_locations_detail');
  const canManageLocations = () => hasPermission('manage_locations');
  const canViewRoomsList = () => hasPermission('view_rooms_list');
  const canViewRoomsDetail = () => hasPermission('view_rooms_detail');
  const canManageRooms = () => hasPermission('manage_rooms');
  
  // NEW: Catalog-specific permission checks
  const canViewSpecialtiesList = () => hasPermission('view_specialties_list');
  const canViewSpecialtiesDetail = () => hasPermission('view_specialties_detail');
  const canManageSpecialties = () => hasPermission('manage_specialties');
  const canViewProceduresList = () => hasPermission('view_procedures_list');
  const canViewProceduresDetail = () => hasPermission('view_procedures_detail');
  const canManageProcedures = () => hasPermission('manage_procedures');
  
  // UPDATED: Team-specific permission checks with granular permissions
  const canViewTeamMembersList = () => hasPermission('view_team_members_list');
  const canViewTeamMembersDetail = () => hasPermission('view_team_members_detail');
  const canManageTeamMembers = () => hasPermission('manage_team_members');
  const canViewInvitationsList = () => hasPermission('view_invitations_list');
  const canViewInvitationsDetail = () => hasPermission('view_invitations_detail');
  const canManageInvitations = () => hasPermission('manage_invitations');
  const canViewPermissionsList = () => hasPermission('view_permissions_list');
  const canViewPermissionsDetail = () => hasPermission('view_permissions_detail');
  const canManagePermissions = () => hasPermission('manage_permissions');

  // UPDATED: Appointment-specific permission checks
  const canViewAppointmentsList = () => hasPermission('view_appointments_list');
  const canViewAppointmentsDetail = () => hasPermission('view_appointments_detail');
  const canViewAppointmentsAssigned = () => hasPermission('view_appointments_assigned');
  const canManageAppointments = () => hasPermission('manage_appointments');
  const canManageSchedule = () => hasPermission('manage_schedule');

  // UPDATED: Billing-specific permission checks
  const canViewBillingList = () => hasPermission('view_billing_list');
  const canViewBillingDetail = () => hasPermission('view_billing_detail');
  const canManageBilling = () => hasPermission('manage_billing');
  const canViewFinancialReports = () => hasPermission('view_financial_reports');
  const canManagePricing = () => hasPermission('manage_pricing');

  // UPDATED: Report-specific permission checks
  const canViewReportsList = () => hasPermission('view_reports_list');
  const canViewReportsDetail = () => hasPermission('view_reports_detail');
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
    canViewPatientsList,
    canViewPatientsDetail,
    canViewPatientsHistory,
    canManagePatientsBasic,
    canManagePatientsHistory,
    
    // Treatment permissions (granular)
    canViewTreatmentsList,
    canViewTreatmentsDetail,
    canViewTreatmentsAssigned,
    canCreateTreatments,
    canEditTreatments,
    canViewAnyTreatments, // Helper function
    
    // Treatment History permissions
    canViewTreatmentHistoryList,
    canViewTreatmentHistoryDetail,
    canCreateTreatmentHistory,
    canEditTreatmentHistory,
    
    // Treatment Notes permissions
    canViewTreatmentNotesList,
    canViewTreatmentNotesDetail,
    canCreateTreatmentNotes,
    canEditTreatmentNotes,
    
    // Location permissions
    canViewLocationsList,
    canViewLocationsDetail,
    canManageLocations,
    canViewRoomsList,
    canViewRoomsDetail,
    canManageRooms,
    
    // Catalog permissions
    canViewSpecialtiesList,
    canViewSpecialtiesDetail,
    canManageSpecialties,
    canViewProceduresList,
    canViewProceduresDetail,
    canManageProcedures,
    
    // Team permissions (granular)
    canViewTeamMembersList,
    canViewTeamMembersDetail,
    canManageTeamMembers,
    canViewInvitationsList,
    canViewInvitationsDetail,
    canManageInvitations,
    canViewPermissionsList,
    canViewPermissionsDetail,
    canManagePermissions,

    // Appointment permissions
    canViewAppointmentsList,
    canViewAppointmentsDetail,
    canViewAppointmentsAssigned,
    canManageAppointments,
    canManageSchedule,

    // Billing permissions
    canViewBillingList,
    canViewBillingDetail,
    canManageBilling,
    canViewFinancialReports,
    canManagePricing,

    // Report permissions
    canViewReportsList,
    canViewReportsDetail,
    canViewAnalytics,
    canExportReports,
    
    // Utility
    refreshPermissions: fetchUserPermissions
  };
};