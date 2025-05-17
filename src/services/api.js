// src/services/api.js
import axios from 'axios';

// Create an instance of axios with default config
const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If the error is 401 Unauthorized and we haven't already tried to refresh
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post('http://localhost:8000/api/auth/token/refresh/', {
          refresh: refreshToken,
        });
        
        // Save the new tokens
        localStorage.setItem('token', response.data.access);
        
        // Update the original request with the new token
        originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
        return axios(originalRequest);
      } catch (err) {
        // If refreshing fails, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// Authentication services
const authService = {
  login: async (email, password) => {
    const response = await api.post('auth/token/', { email, password });
    localStorage.setItem('token', response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);
    
    // Dispatch an event that authentication state has changed
    window.dispatchEvent(new Event('auth-change'));
    
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    // Dispatch an event that authentication state has changed
    window.dispatchEvent(new Event('auth-change'));
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.get('auth/users/me/');
      return response.data;
    } catch (error) {
      return null;
    }
  },
  
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  }
};

export { api, authService };