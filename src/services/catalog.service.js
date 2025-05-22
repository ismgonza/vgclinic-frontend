// src/services/catalog.service.js
import api from './api';

class CatalogService {
  // Specialties
  async getSpecialties() {
    try {
      // Change this URL to match Django's URL structure
      const response = await api.get('/clinic/catalog/specialties/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getSpecialty(id) {
    try {
      const response = await api.get(`/clinic/catalog/specialties/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createSpecialty(specialtyData) {
    try {
      const response = await api.post('/clinic/catalog/specialties/', specialtyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateSpecialty(id, specialtyData) {
    try {
      const response = await api.put(`/clinic/catalog/specialties/${id}/`, specialtyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteSpecialty(id) {
    try {
      await api.delete(`/clinic/catalog/specialties/${id}/`);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Catalog Items
  async getCatalogItems(specialtyId = null) {
    try {
      let url = '/clinic/catalog/catalog-items/';
      if (specialtyId) {
        url += `?specialty=${specialtyId}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getCatalogItem(id) {
    try {
      const response = await api.get(`/clinic/catalog/catalog-items/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createCatalogItem(itemData) {
    try {
      const response = await api.post('/clinic/catalog/catalog-items/', itemData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateCatalogItem(id, itemData) {
    try {
      const response = await api.put(`/clinic/catalog/catalog-items/${id}/`, itemData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteCatalogItem(id) {
    try {
      await api.delete(`/clinic/catalog/catalog-items/${id}/`);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default new CatalogService();