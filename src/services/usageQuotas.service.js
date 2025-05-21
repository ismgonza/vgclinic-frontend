// src/services/usageQuotas.service.js
import api from './api';

class UsageQuotasService {
  async getUsageQuotas(contractId = null) {
    try {
      let url = '/contracts/quotas/';
      if (contractId) {
        url += `?contract=${contractId}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getUsageQuota(id) {
    try {
      const response = await api.get(`/contracts/quotas/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createUsageQuota(quotaData) {
    try {
      const response = await api.post('/contracts/quotas/', quotaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateUsageQuota(id, quotaData) {
    try {
      const response = await api.put(`/contracts/quotas/${id}/`, quotaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteUsageQuota(id) {
    try {
      await api.delete(`/contracts/quotas/${id}/`);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async updateUsage(id, usage) {
    try {
      const response = await api.post(`/contracts/quotas/${id}/update_usage/`, { usage });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async incrementUsage(id, amount = 1) {
    try {
      const response = await api.post(`/contracts/quotas/${id}/increment_usage/`, { amount });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new UsageQuotasService();