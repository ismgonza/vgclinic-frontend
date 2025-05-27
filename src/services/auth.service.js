// src/services/auth.service.js
import api from './api';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

// Use environment variable for API URL - with fallback for browser compatibility
const API_BASE = (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 'http://localhost:8000/api/';

class AuthService {
  async login(email, password) {
    try {
      // Use axios directly to avoid interceptors during login
      const response = await axios.post(`${API_BASE}token/`, {
        email: email,
        password: password,
      });
      
      if (response.data.access) {
        const token = response.data.access;
        
        // Store tokens in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', response.data.refresh);
        
        // Set the Authorization header for all future API calls
        this.setAuthHeader(token);
        
        // Decode token to get user info
        const decoded = jwtDecode(token);
        
        // Create a user object with the token payload
        const user = {
          id: decoded.user_id,
          email: decoded.email,
          first_name: decoded.first_name, 
          last_name: decoded.last_name,
          is_staff: decoded.is_staff,
          is_superuser: decoded.is_superuser
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        console.log("Login successful. Token set:", token.substring(0, 15) + "...");
        return user;
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  logout() {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Clear Authorization header
    this.clearAuthHeader();
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userStr && token) {
      console.log("Current user found with token:", token.substring(0, 15) + "...");
      // Always refresh the token in the headers
      this.setAuthHeader(token);
      return JSON.parse(userStr);
    }
    return null;
  }

  isAuthenticated() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Set the token in the header every time authentication is checked
    this.setAuthHeader(token);
    console.log("isAuthenticated checked, token set:", token.substring(0, 15) + "...");
    
    try {
      // Check if token is expired
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp < currentTime) {
        // Token is expired
        console.log("Token is expired, trying to refresh");
        this.refreshToken();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  }
  
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.error("No refresh token available");
        return false;
      }

      // Use axios directly to avoid interceptors during token refresh
      const response = await axios.post(`${API_BASE}token/refresh/`, {
        refresh: refreshToken,
      });

      if (response.data.access) {
        const newToken = response.data.access;
        localStorage.setItem('token', newToken);
        
        // Set the new token in the headers
        this.setAuthHeader(newToken);
        console.log("Token refreshed successfully:", newToken.substring(0, 15) + "...");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error refreshing token:", error);
      this.logout();
      return false;
    }
  }

  // Helper method to safely set auth header
  setAuthHeader(token) {
    try {
      if (api && api.defaults && api.defaults.headers) {
        if (!api.defaults.headers.common) {
          api.defaults.headers.common = {};
        }
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error setting auth header:", error);
    }
  }

  // Helper method to safely clear auth header
  clearAuthHeader() {
    try {
      if (api && api.defaults && api.defaults.headers && api.defaults.headers.common) {
        delete api.defaults.headers.common['Authorization'];
      }
    } catch (error) {
      console.error("Error clearing auth header:", error);
    }
  }
}

export default new AuthService();