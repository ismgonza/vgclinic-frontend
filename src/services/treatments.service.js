// src/services/treatments.service.js
import api from './api';

class TreatmentsService {
  async getTreatments(params = {}, headers = {}) {
    try {
      const response = await api.get('/clinic/treatments/treatments/', { 
        params,
        headers 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getTreatment(id, headers = {}) {
    try {
      const response = await api.get(`/clinic/treatments/treatments/${id}/`, {
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createTreatment(treatmentData, headers = {}) {
    try {
      const response = await api.post('/clinic/treatments/treatments/', treatmentData, {
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateTreatment(id, treatmentData, headers = {}) {
    try {
      const response = await api.put(`/clinic/treatments/treatments/${id}/`, treatmentData, {
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteTreatment(id, headers = {}) {
    try {
      await api.delete(`/clinic/treatments/treatments/${id}/`, {
        headers
      });
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Quick status update
  async updateTreatmentStatus(id, status, headers = {}) {
    try {
      const response = await api.patch(`/clinic/treatments/treatments/${id}/`, { status }, {
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Complete treatment action
  async completeTreatment(id, headers = {}) {
    try {
      const response = await api.post(`/clinic/treatments/treatments/${id}/complete/`, {}, {
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Cancel treatment action  
  async cancelTreatment(id, headers = {}) {
    try {
      const response = await api.post(`/clinic/treatments/treatments/${id}/cancel/`, {}, {
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get user role information in selected account
  async getUserRoleInfo(headers = {}) {
    try {
      const response = await api.get('/clinic/treatments/treatments/user_role_info/', {
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Updated form options with specialty filtering
  async getFormOptions(headers = {}, specialtyId = null) {
    try {
      const params = {};
      if (specialtyId) {
        params.specialty_id = specialtyId;
      }
      
      const response = await api.get('/clinic/treatments/treatments/form_options/', {
        headers,
        params
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Add note to treatment
  async addTreatmentNote(treatmentId, noteData, headers = {}) {
    try {
      const response = await api.post(`/clinic/treatments/treatments/${treatmentId}/add_note/`, noteData, {
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get treatment notes
  async getTreatmentNotes(treatmentId, headers = {}) {
    try {
      const response = await api.get(`/clinic/treatments/treatment-notes/?treatment=${treatmentId}`, {
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update treatment note
  async updateTreatmentNote(noteId, noteData, headers = {}) {
    try {
      const response = await api.put(`/clinic/treatments/treatment-notes/${noteId}/`, noteData, {
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Delete treatment note
  async deleteTreatmentNote(noteId, headers = {}) {
    try {
      await api.delete(`/clinic/treatments/treatment-notes/${noteId}/`, {
        headers
      });
      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default new TreatmentsService();