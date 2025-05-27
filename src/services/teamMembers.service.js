// src/services/teamMembers.service.js
import api from './api';

class TeamMembersService {
  // Get team members for an account
  async getTeamMembers(params = {}, headers = {}) {
    try {
      const response = await api.get('/accounts/members/', {
        params,
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get single team member
  async getTeamMember(id, headers = {}) {
    try {
      const response = await api.get(`/accounts/members/${id}/`, {
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update team member (role, specialty, etc.)
  async updateTeamMember(id, memberData, headers = {}) {
    try {
      const response = await api.patch(`/accounts/members/${id}/`, memberData, {
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Remove team member from account
  async removeTeamMember(id, headers = {}) {
    try {
      const response = await api.delete(`/accounts/members/${id}/`, {
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Deactivate team member (soft delete)
  async deactivateTeamMember(id, headers = {}) {
    try {
      const response = await api.patch(`/accounts/members/${id}/deactivate/`, {}, {
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Reactivate team member
  async reactivateTeamMember(id, headers = {}) {
    try {
      const response = await api.patch(`/accounts/members/${id}/reactivate/`, {}, {
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new TeamMembersService();