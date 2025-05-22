// src/services/catalog.service.js
import api from './api';

class CatalogService {
  // Specialties
  async getSpecialties(headers = {}) {
    try {
      const response = await api.get('/clinic/catalog/specialties/', { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getSpecialty(id, headers = {}) {
    try {
      const response = await api.get(`/clinic/catalog/specialties/${id}/`, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createSpecialty(specialtyData, headers = {}) {
    try {
      const response = await api.post('/clinic/catalog/specialties/', specialtyData, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateSpecialty(id, specialtyData, headers = {}) {
    try {
      const response = await api.put(`/clinic/catalog/specialties/${id}/`, specialtyData, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteSpecialty(id, headers = {}) {
    try {
      await api.delete(`/clinic/catalog/specialties/${id}/`, { headers });
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Catalog Items
  async getCatalogItems(specialtyId = null, headers = {}) {
    try {
      let url = '/clinic/catalog/catalog-items/';
      if (specialtyId) {
        url += `?specialty=${specialtyId}`;
      }
      const response = await api.get(url, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getCatalogItem(id, headers = {}) {
    try {
      const response = await api.get(`/clinic/catalog/catalog-items/${id}/`, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createCatalogItem(itemData, headers = {}) {
    try {
      const response = await api.post('/clinic/catalog/catalog-items/', itemData, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateCatalogItem(id, itemData, headers = {}) {
    try {
      const response = await api.put(`/clinic/catalog/catalog-items/${id}/`, itemData, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteCatalogItem(id, headers = {}) {
    try {
      await api.delete(`/clinic/catalog/catalog-items/${id}/`, { headers });
      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default new CatalogService();