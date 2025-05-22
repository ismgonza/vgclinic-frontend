// src/services/treatments.service.js
import api from './api';

class TreatmentsService {
  async getTreatments(params = {}) {
    try {
      const response = await api.get('/clinic/treatments/treatments/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getTreatment(id) {
    try {
      const response = await api.get(`/clinic/treatments/treatments/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createTreatment(treatmentData) {
    try {
      const response = await api.post('/clinic/treatments/treatments/', treatmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateTreatment(id, treatmentData) {
    try {
      const response = await api.put(`/clinic/treatments/treatments/${id}/`, treatmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteTreatment(id) {
    try {
      await api.delete(`/clinic/treatments/treatments/${id}/`);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Quick status update
  async updateTreatmentStatus(id, status) {
    try {
      const response = await api.patch(`/clinic/treatments/treatments/${id}/`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Complete treatment action
  async completeTreatment(id) {
    try {
      const response = await api.post(`/clinic/treatments/treatments/${id}/complete/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Cancel treatment action  
  async cancelTreatment(id) {
    try {
      const response = await api.post(`/clinic/treatments/treatments/${id}/cancel/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getFormOptions() {
    try {
      const response = await api.get('/clinic/treatments/treatments/form_options/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Add note to treatment
  async addTreatmentNote(treatmentId, noteData) {
    try {
      const response = await api.post(`/clinic/treatments/treatments/${treatmentId}/add_note/`, noteData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get treatment notes
  async getTreatmentNotes(treatmentId) {
    try {
      const response = await api.get(`/clinic/treatments/treatment-notes/?treatment=${treatmentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new TreatmentsService();