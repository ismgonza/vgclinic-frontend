// src/services/locations.service.js
import api from './api';

class LocationsService {
  // Branches
  async getBranches(headers = {}) {
    try {
      const response = await api.get('/clinic/locations/branches/', { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getBranch(id, headers = {}) {
    try {
      const response = await api.get(`/clinic/locations/branches/${id}/`, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createBranch(branchData, headers = {}) {
    try {
      const response = await api.post('/clinic/locations/branches/', branchData, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateBranch(id, branchData, headers = {}) {
    try {
      const response = await api.put(`/clinic/locations/branches/${id}/`, branchData, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteBranch(id, headers = {}) {
    try {
      await api.delete(`/clinic/locations/branches/${id}/`, { headers });
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Rooms
  async getRooms(branchId = null, headers = {}) {
    try {
      let url = '/clinic/locations/rooms/';
      if (branchId) {
        url += `?branch=${branchId}`;
      }
      const response = await api.get(url, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getRoom(id, headers = {}) {
    try {
      const response = await api.get(`/clinic/locations/rooms/${id}/`, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createRoom(roomData, headers = {}) {
    try {
      const response = await api.post('/clinic/locations/rooms/', roomData, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateRoom(id, roomData, headers = {}) {
    try {
      const response = await api.put(`/clinic/locations/rooms/${id}/`, roomData, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteRoom(id, headers = {}) {
    try {
      await api.delete(`/clinic/locations/rooms/${id}/`, { headers });
      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default new LocationsService();