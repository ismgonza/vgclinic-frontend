// src/services/users.service.js
import api from './api';

class UsersService {
  async getUsers() {
    try {
      const response = await api.get('/users/users/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getUser(id) {
    try {
      const response = await api.get(`/users/users/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createUser(userData) {
    try {
      const response = await api.post('/users/users/', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(id, userData) {
    try {
      const response = await api.put(`/users/users/${id}/`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      await api.delete(`/users/users/${id}/`);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default new UsersService();