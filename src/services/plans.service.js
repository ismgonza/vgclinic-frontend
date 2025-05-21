// src/services/plans.service.js
import api from './api';

class PlansService {
  async getPlans() {
    try {
      const response = await api.get('/services/plans/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getPlan(id) {
    try {
      const response = await api.get(`/services/plans/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createPlan(planData) {
    try {
      const response = await api.post('/services/plans/', planData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updatePlan(id, planData) {
    try {
      const response = await api.put(`/services/plans/${id}/`, planData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deletePlan(id) {
    try {
      await api.delete(`/services/plans/${id}/`);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default new PlansService();