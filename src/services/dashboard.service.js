// src/services/dashboard.service.js
import api from './api';

class DashboardService {
  async getDashboardStats() {
    try {
      const response = await api.get('/api/clinic/dashboard/stats/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getRecentPatients() {
    try {
      const response = await api.get('/api/clinic/patients/patients/?ordering=-admission_date&limit=3');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getUpcomingAppointments() {
    try {
      const response = await api.get('/api/clinic/treatments/treatments/?status=SCHEDULED&ordering=scheduled_date&limit=3');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new DashboardService();