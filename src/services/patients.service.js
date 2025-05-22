// src/services/patients.service.js
import api from './api';

class PatientsService {
  async getPatients(params = {}) {
    try {
      const response = await api.get('/clinic/patients/patients/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getPatient(id) {
    try {
      const response = await api.get(`/clinic/patients/patients/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createPatient(patientData) {
    try {
      const response = await api.post('/clinic/patients/patients/', patientData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updatePatient(id, patientData) {
    try {
      const response = await api.put(`/clinic/patients/patients/${id}/`, patientData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deletePatient(id) {
    try {
      await api.delete(`/clinic/patients/patients/${id}/`);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Additional methods for patient-related functionality
  async getPatientMedicalHistory(patientId) {
    try {
      const response = await api.get(`/clinic/patients/patients/${patientId}/medical_history/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async addPatientPhone(patientId, phoneData) {
    try {
      const response = await api.post(`/clinic/patients/patients/${patientId}/add_phone/`, phoneData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async addEmergencyContact(patientId, contactData) {
    try {
      const response = await api.post(`/clinic/patients/patients/${patientId}/add_emergency_contact/`, contactData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getPatientMedicalHistory(patientId) {
    try {
      const response = await api.get(`/clinic/patients/patients/${patientId}/medical_history/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  async addMedicalHistory(patientId, medicalHistoryData) {
    try {
      // There are two ways to add a medical history depending on the API endpoint structure
      // Option 1: Using the patient account endpoint
      if (medicalHistoryData.patient_account) {
        const response = await api.post(
          `/clinic/patients/patient-accounts/${medicalHistoryData.patient_account}/add_medical_history/`, 
          medicalHistoryData
        );
        return response.data;
      } 
      // Option 2: Directly to the medical histories endpoint
      else {
        const response = await api.post('/clinic/patients/medical-histories/', medicalHistoryData);
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  }
  
  async getMedicalHistory(historyId) {
    try {
      const response = await api.get(`/clinic/patients/medical-histories/${historyId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new PatientsService();