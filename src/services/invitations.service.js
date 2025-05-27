// src/services/invitations.service.js
import api from './api';
import axios from 'axios';

class InvitationsService {
  // Create a public API instance without auth interceptors
  createPublicApi() {
    const API_BASE = (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 'http://localhost:8000/api/';
    return axios.create({
      baseURL: API_BASE,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  // Get invitations list
  async getInvitations(params = {}, headers = {}) {
    try {
      const response = await api.get('/accounts/invitations/', {
        params,
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Send invitation
  async sendInvitation(invitationData, headers = {}) {
    try {
      const response = await api.post('/accounts/invitations/', invitationData, {
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Resend invitation
  async resendInvitation(invitationId, headers = {}) {
    try {
      const response = await api.post(`/accounts/invitations/${invitationId}/resend/`, {}, {
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Revoke invitation
  async revokeInvitation(invitationId, headers = {}) {
    try {
      const response = await api.patch(`/accounts/invitations/${invitationId}/revoke/`, {}, {
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Validate invitation token (no auth required) - use clean axios instance
  async validateToken(token) {
    try {
      const publicApi = this.createPublicApi();
      const response = await publicApi.get(`/accounts/accept-invitation/${token}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Accept invitation (no auth required) - use clean axios instance  
  async acceptInvitation(acceptanceData) {
    try {
      const publicApi = this.createPublicApi();
      const response = await publicApi.post('/accounts/accept-invitation/', acceptanceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new InvitationsService();