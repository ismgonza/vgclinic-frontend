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

  // NEW: Get current user's profile with additional details
  async getMyProfile() {
    try {
      const response = await api.get('/users/users/me/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // NEW: Update current user's profile
  async updateMyProfile(userData) {
    try {
      const response = await api.patch('/users/users/update_profile/', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // NEW: Change password
  async changePassword(passwordData) {
    try {
      const response = await api.post('/users/users/change_password/', passwordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // NEW: Get user's team memberships (specialties and roles)
  async getMyTeamMemberships() {
    try {
      const response = await api.get('/users/users/my_memberships/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new UsersService();