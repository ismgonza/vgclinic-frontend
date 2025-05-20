// src/services/dashboard.service.js - update this file
import api from './api';

class DashboardService {
  async getDashboardStats() {
    try {
      const response = await api.get('/clinic/dashboard/stats/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getRecentPatients() {
    try {
      const response = await api.get('/clinic/patients/patients/?ordering=-admission_date&limit=3');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getUpcomingAppointments() {
    try {
      const response = await api.get('/clinic/treatments/treatments/?status=SCHEDULED&ordering=scheduled_date&limit=3');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  async getAccountsList() {
    try {
      const response = await api.get('/platform/accounts/list/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new DashboardService();