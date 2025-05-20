import api from './api';
import jwtDecode from 'jwt-decode';

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
        const user = jwtDecode(response.data.access);
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