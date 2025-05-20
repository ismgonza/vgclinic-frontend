// src/services/api.js
import axios from 'axios';

// Define base URL for API requests
const API_URL = 'http://localhost:8000/api/';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to get token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Add a request interceptor to include auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors (token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Use a direct axios call, not the intercepted api instance
          const response = await axios.post(`${API_URL}token/refresh/`, {
            refresh: refreshToken,
          });
          
          if (response.data.access) {
            const newToken = response.data.access;
            localStorage.setItem('token', newToken);
            
            // Update the original request with the new token
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            
            // Return the original request with new token
            return axios(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        // Redirect to login if refresh fails
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;