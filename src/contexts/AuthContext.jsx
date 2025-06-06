// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to safely set auth header
  const setAuthHeader = (token) => {
    try {
      if (api && api.defaults && api.defaults.headers) {
        if (!api.defaults.headers.common) {
          api.defaults.headers.common = {};
        }
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error setting auth header in context:", error);
    }
  };

  // Helper function to safely clear auth header
  const clearAuthHeader = () => {
    try {
      if (api && api.defaults && api.defaults.headers && api.defaults.headers.common) {
        delete api.defaults.headers.common['Authorization'];
      }
    } catch (error) {
      console.error("Error clearing auth header in context:", error);
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    const user = authService.getCurrentUser();
    
    if (user) {
      // Make sure the token is set in API headers
      const token = localStorage.getItem('token');
      if (token) {
        setAuthHeader(token);
      }
      
      setCurrentUser(user);
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const user = await authService.login(email, password);
      setCurrentUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    // Clear Authorization header
    clearAuthHeader();
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    isAuthenticated: () => authService.isAuthenticated(), // Fix: Call as method
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};