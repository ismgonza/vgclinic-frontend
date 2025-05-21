// src/services/features.service.js
import api from './api';

class FeaturesService {
  async getFeatures() {
    try {
      const response = await api.get('/services/features/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getFeature(id) {
    try {
      const response = await api.get(`/services/features/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createFeature(featureData) {
    try {
      const response = await api.post('/services/features/', featureData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateFeature(id, featureData) {
    try {
      const response = await api.put(`/services/features/${id}/`, featureData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteFeature(id) {
    try {
      await api.delete(`/services/features/${id}/`);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default new FeaturesService();