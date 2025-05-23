import api from './api';

class DashboardService {
  // Get dashboard stats - now account-aware for regular users
  async getDashboardStats(headers = {}) {
    try {
      const response = await api.get('/clinic/dashboard/stats/', {
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get recent patients for current account
  async getRecentPatients(headers = {}) {
    try {
      const response = await api.get('/clinic/patients/patients/', {
        params: { ordering: '-admission_date', limit: 5 },
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get upcoming appointments for current account
  async getUpcomingAppointments(headers = {}) {
    try {
      const response = await api.get('/clinic/treatments/treatments/', {
        params: { 
          status: 'SCHEDULED', 
          ordering: 'scheduled_date', 
          limit: 5 
        },
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Staff-only: Get accounts list (no account context needed)
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