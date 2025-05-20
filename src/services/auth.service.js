// src/services/auth.service.js
import api from './api';
import { jwtDecode } from 'jwt-decode';

class AuthService {
  async login(email, password) {
    try {
      const response = await api.post('token/', {
        email: email,
        password: password,
      });
      
      if (response.data.access) {
        const token = response.data.access;
        
        // Store tokens in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', response.data.refresh);
        
        // Set the Authorization header for all future API calls
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
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
        return user;
      }
    } catch (error) {
      throw error;
    }
  }

  logout() {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Clear Authorization header
    delete api.defaults.headers.common['Authorization'];
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      // Make sure the token is set in the API header
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      return JSON.parse(userStr);
    }
    return null;
  }

  isAuthenticated() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Set the token in the header
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    try {
      // Check if token is expired
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp < currentTime) {
        // Token is expired
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new AuthService();