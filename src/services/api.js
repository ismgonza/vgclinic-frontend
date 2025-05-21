// src/services/api.js
import axios from 'axios';

// Define base URL for API requests
const API_URL = 'http://localhost:8000/api/';

// Get token from localStorage if available
const token = localStorage.getItem('token');

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  },
});

// Add a request interceptor to include auth token in all requests
api.interceptors.request.use(
  (config) => {
    // Always get the latest token from localStorage for each request
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log(`API Request to ${config.url} with token ${token.substring(0, 15)}...`);
    } else {
      console.warn(`API Request to ${config.url} with NO TOKEN`);
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// For debugging - log every response
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}: Status ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`API Error: ${error.message}`, error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);

export default api;