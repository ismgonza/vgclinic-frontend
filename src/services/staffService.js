// src/services/staffService.js
import { api } from './api';

const staffService = {
  getStaffMembers: async (accountId) => {
    const params = accountId ? { account_id: accountId } : {};
    const response = await api.get('clinic/staff/members/', { params });
    return response.data;
  },

  getStaffMember: async (id) => {
    const response = await api.get(`clinic/staff/members/${id}/`);
    return response.data;
  },

  createStaffMember: async (staffData) => {
    // For creating a new staff, we need to pass user info differently
    const formattedData = {
      // User data
      user_data: {
        email: staffData.email,
        first_name: staffData.first_name,
        last_name: staffData.last_name,
        password: staffData.password,
      },
      // Account info
      account: staffData.account,
      // Staff profile info
      job_title: staffData.job_title,
      staff_role: staffData.staff_role,
      license_number: staffData.license_number,
      phone: staffData.phone,
      is_active: staffData.is_active,
      can_book_appointments: staffData.can_book_appointments,
      appointment_color: staffData.appointment_color,
      specialties: staffData.specialties,
    };
    
    const response = await api.post('clinic/staff/members/', formattedData);
    return response.data;
  },

  updateStaffMember: async (id, staffData) => {
    const response = await api.put(`clinic/staff/members/${id}/`, staffData);
    return response.data;
  },

  deleteStaffMember: async (id) => {
    await api.delete(`clinic/staff/members/${id}/`);
    return true;
  },

  getStaffLocations: async (staffId) => {
    const params = staffId ? { staff_id: staffId } : {};
    const response = await api.get('clinic/staff/locations/', { params });
    return response.data;
  },

  addStaffLocation: async (locationData) => {
    const response = await api.post('clinic/staff/locations/', locationData);
    return response.data;
  },

  updateStaffLocation: async (id, locationData) => {
    const response = await api.put(`clinic/staff/locations/${id}/`, locationData);
    return response.data;
  },

  deleteStaffLocation: async (id) => {
    await api.delete(`clinic/staff/locations/${id}/`);
    return true;
  },

  getAvailabilitySchedules: async (staffId, locationId) => {
    const params = {};
    if (staffId) params.staff_id = staffId;
    if (locationId) params.location_id = locationId;
    
    const response = await api.get('clinic/staff/schedules/', { params });
    return response.data;
  },

  createSchedule: async (scheduleData) => {
    const response = await api.post('clinic/staff/schedules/', scheduleData);
    return response.data;
  },

  updateSchedule: async (id, scheduleData) => {
    const response = await api.put(`clinic/staff/schedules/${id}/`, scheduleData);
    return response.data;
  },

  deleteSchedule: async (id) => {
    await api.delete(`clinic/staff/schedules/${id}/`);
    return true;
  },

  getStaffSpecialties: async (accountId) => {
    const params = accountId ? { account_id: accountId } : {};
    const response = await api.get('clinic/staff/specialties/', { params });
    return response.data;
  }
};

export default staffService;