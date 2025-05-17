import { api } from './api';

const locationService = {
  getLocations: async (accountId) => {
    const params = accountId ? { account_id: accountId } : {};
    const response = await api.get('clinic/locations/locations/', { params });
    return response.data;
  },

  getLocation: async (id) => {
    const response = await api.get(`clinic/locations/locations/${id}/`);
    return response.data;
  },

  createLocation: async (locationData) => {
    const response = await api.post('clinic/locations/locations/', locationData);
    return response.data;
  },

  updateLocation: async (id, locationData) => {
    const response = await api.put(`clinic/locations/locations/${id}/`, locationData);
    return response.data;
  },

  deleteLocation: async (id) => {
    await api.delete(`clinic/locations/locations/${id}/`);
    return true;
  },

  getRooms: async (locationId) => {
    const params = locationId ? { location_id: locationId } : {};
    const response = await api.get('clinic/locations/rooms/', { params });
    return response.data;
  },

  getRoom: async (id) => {
    const response = await api.get(`clinic/locations/rooms/${id}/`);
    return response.data;
  },

  createRoom: async (roomData) => {
    const response = await api.post('clinic/locations/rooms/', roomData);
    return response.data;
  },

  updateRoom: async (id, roomData) => {
    const response = await api.put(`clinic/locations/rooms/${id}/`, roomData);
    return response.data;
  },

  deleteRoom: async (id) => {
    await api.delete(`clinic/locations/rooms/${id}/`);
    return true;
  }
};

export default locationService;