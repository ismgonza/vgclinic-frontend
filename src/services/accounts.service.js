// src/services/accounts.service.js
import api from './api';

class AccountsService {
  async getAccounts() {
    try {
      // Update this URL to match your Django URL structure
      const response = await api.get('/accounts/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAccount(id) {
    try {
      // Update this URL to match your Django URL structure
      const response = await api.get(`/accounts/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update all other methods the same way
  async createAccount(accountData) {
    try {
      const response = await api.post('/accounts/', accountData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateAccount(id, accountData) {
    try {
      const response = await api.put(`/accounts/${id}/`, accountData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteAccount(id) {
    try {
      await api.delete(`/accounts/${id}/`);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default new AccountsService();