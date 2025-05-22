// src/services/patients.service.js
import api from './api';

class PatientsService {
  async getPatients(params = {}, headers = {}) {
    try {
      const response = await api.get('/clinic/patients/patients/', { 
        params,
        headers 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getPatient(id, headers = {}) {
    try {
      const response = await api.get(`/clinic/patients/patients/${id}/`, {
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createPatient(patientData, headers = {}) {
    try {
      const response = await api.post('/clinic/patients/patients/', patientData, {
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updatePatient(id, patientData, headers = {}) {
    try {
      const response = await api.put(`/clinic/patients/patients/${id}/`, patientData, {
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deletePatient(id, headers = {}) {
    try {
      await api.delete(`/clinic/patients/patients/${id}/`, {
        headers
      });
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Additional methods for patient-related functionality
  async getPatientMedicalHistory(patientId, headers = {}) {
    try {
      const response = await api.get(`/clinic/patients/patients/${patientId}/medical_history/`, {
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async addPatientPhone(patientId, phoneData, headers = {}) {
    try {
      const response = await api.post(`/clinic/patients/patients/${patientId}/add_phone/`, phoneData, {
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async addEmergencyContact(patientId, contactData, headers = {}) {
    try {
      const response = await api.post(`/clinic/patients/patients/${patientId}/add_emergency_contact/`, contactData, {
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  async addMedicalHistory(patientId, medicalHistoryData, headers = {}) {
    try {
      // There are two ways to add a medical history depending on the API endpoint structure
      // Option 1: Using the patient account endpoint
      if (medicalHistoryData.patient_account) {
        const response = await api.post(
          `/clinic/patients/patient-accounts/${medicalHistoryData.patient_account}/add_medical_history/`, 
          medicalHistoryData,
          { headers }
        );
        return response.data;
      } 
      // Option 2: Directly to the medical histories endpoint
      else {
        const response = await api.post('/clinic/patients/medical-histories/', medicalHistoryData, {
          headers
        });
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  }
  
  async getMedicalHistory(historyId, headers = {}) {
    try {
      const response = await api.get(`/clinic/patients/medical-histories/${historyId}/`, {
        headers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new PatientsService();