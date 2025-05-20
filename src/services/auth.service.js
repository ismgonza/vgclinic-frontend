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
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        
        // Decode token to get user info
        const decoded = jwtDecode(response.data.access);
        console.log('Decoded token:', decoded); // Debug log
        
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
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token available');

      const response = await api.post('token/refresh/', {
        refresh: refreshToken,
      });

      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        return true;
      }
      return false;
    } catch (error) {
      this.logout();
      return false;
    }
  }
}

export default new AuthService();