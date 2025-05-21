// src/services/services.service.js
import api from './api';

class ServicesService {
  async getServices() {
    try {
      const response = await api.get('/services/services/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getService(id) {
    try {
      const response = await api.get(`/services/services/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createService(serviceData) {
    try {
      const response = await api.post('/services/services/', serviceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateService(id, serviceData) {
    try {
      const response = await api.put(`/services/services/${id}/`, serviceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteService(id) {
    try {
      await api.delete(`/services/services/${id}/`);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default new ServicesService();