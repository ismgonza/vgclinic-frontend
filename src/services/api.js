// src/services/api.js
import axios from 'axios';

// Use environment variable for API URL - with fallback for browser compatibility
const API_URL = (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 'http://localhost:8000/api/';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token AND account context
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

    // ADD ACCOUNT CONTEXT - Get selected account ID
    const selectedAccountId = localStorage.getItem('selectedAccountId');
    if (selectedAccountId) {
      config.headers['X-Account-Context'] = selectedAccountId;
      console.log(`API Request with Account Context: ${selectedAccountId}`);
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