// src/services/locations.service.js
import api from './api';

class LocationsService {
  // Branches
  async getBranches() {
    try {
      const response = await api.get('/clinic/locations/branches/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getBranch(id) {
    try {
      const response = await api.get(`/clinic/locations/branches/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createBranch(branchData) {
    try {
      const response = await api.post('/clinic/locations/branches/', branchData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateBranch(id, branchData) {
    try {
      const response = await api.put(`/clinic/locations/branches/${id}/`, branchData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteBranch(id) {
    try {
      await api.delete(`/clinic/locations/branches/${id}/`);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Rooms
  async getRooms(branchId = null) {
    try {
      let url = '/clinic/locations/rooms/';
      if (branchId) {
        url += `?branch=${branchId}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getRoom(id) {
    try {
      const response = await api.get(`/clinic/locations/rooms/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createRoom(roomData) {
    try {
      const response = await api.post('/clinic/locations/rooms/', roomData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateRoom(id, roomData) {
    try {
      const response = await api.put(`/clinic/locations/rooms/${id}/`, roomData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteRoom(id) {
    try {
      await api.delete(`/clinic/locations/rooms/${id}/`);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default new LocationsService();