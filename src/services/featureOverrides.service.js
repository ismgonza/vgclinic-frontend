// src/services/featureOverrides.service.js
import api from './api';

class FeatureOverridesService {
  async getFeatureOverrides(contractId = null) {
    try {
      let url = '/contracts/overrides/';
      if (contractId) {
        url += `?contract=${contractId}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getFeatureOverride(id) {
    try {
      const response = await api.get(`/contracts/overrides/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createFeatureOverride(overrideData) {
    try {
      const response = await api.post('/contracts/overrides/', overrideData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateFeatureOverride(id, overrideData) {
    try {
      const response = await api.put(`/contracts/overrides/${id}/`, overrideData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteFeatureOverride(id) {
    try {
      await api.delete(`/contracts/overrides/${id}/`);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default new FeatureOverridesService();