import api from './api';

class ContractsService {
  async getContracts() {
    try {
      const response = await api.get('/contracts/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getContract(contractNumber) {
    try {
      const response = await api.get(`/contracts/${contractNumber}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createContract(contractData) {
    try {
      console.log("Creating contract with data:", contractData);
      
      // Clean up the data
      const dataToSend = { ...contractData };
      
      // Ensure proper data types
      if (dataToSend.plan) {
        dataToSend.plan = parseInt(dataToSend.plan);
      }
      
      if (dataToSend.user) {
        dataToSend.user = parseInt(dataToSend.user);
      }
      
      // Remove empty optional fields
      if (dataToSend.price_override === '') {
        dataToSend.price_override = null;
      }
      
      if (dataToSend.end_date === '') {
        dataToSend.end_date = null;
      }
      
      console.log("Cleaned data to send:", dataToSend);
      
      const response = await api.post('/contracts/', dataToSend);
      console.log("Contract created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Contract creation error:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      throw error;
    }
  }

  async updateContract(contractNumber, contractData) {
    try {
      // Clean up the data similar to create
      const dataToSend = { ...contractData };
      
      if (dataToSend.plan) {
        dataToSend.plan = parseInt(dataToSend.plan);
      }
      
      if (dataToSend.user) {
        dataToSend.user = parseInt(dataToSend.user);
      }
      
      if (dataToSend.price_override === '') {
        dataToSend.price_override = null;
      }
      
      if (dataToSend.end_date === '') {
        dataToSend.end_date = null;
      }
      
      const response = await api.put(`/contracts/${contractNumber}/`, dataToSend);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteContract(contractNumber) {
    try {
      await api.delete(`/contracts/${contractNumber}/`);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async cancelContract(contractNumber, reason) {
    try {
      const response = await api.post(`/contracts/${contractNumber}/cancel/`, { reason });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async renewContract(contractNumber) {
    try {
      const response = await api.post(`/contracts/${contractNumber}/renew/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new ContractsService();