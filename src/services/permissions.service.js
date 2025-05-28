// src/services/permissions.service.js
import api from './api';

const PermissionsService = {
  // Get all available permissions with categories
  getAvailablePermissions: async () => {
    try {
      const response = await api.get('/accounts/permissions/available/');
      return response.data;
    } catch (error) {
      console.error('Error fetching available permissions:', error);
      throw error;
    }
  },

  // Get permissions summary for all users in current account
  getUsersPermissions: async () => {
    try {
      const response = await api.get('/accounts/permissions/users/');
      return response.data;
    } catch (error) {
      console.error('Error fetching users permissions:', error);
      throw error;
    }
  },

  // Get detailed permissions for a specific user
  getUserPermissions: async (userId) => {
    try {
      const response = await api.get(`/accounts/permissions/user/${userId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      throw error;
    }
  },

  // Update permissions for a specific user
  updateUserPermissions: async (userId, permissions, notes = '', accountId = null) => {
    try {
      const payload = {
        user_id: userId,
        permissions: permissions,
        notes: notes
      };
      
      // Add account_id if provided
      if (accountId) {
        payload.account_id = accountId;
      }
      
      console.log('Sending permissions update payload:', payload);
      
      const response = await api.post('/accounts/permissions/update/', payload);
      return response.data;
    } catch (error) {
      console.error('Error updating user permissions:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error response:', error.response);
      throw error;
    }
  },

  // Helper function to check if user has a specific permission
  userHasPermission: (userPermissions, permission) => {
    return userPermissions && userPermissions.includes(permission);
  },

  // Helper function to group permissions by category
  groupPermissionsByCategory: (permissions, categories) => {
    const grouped = {};
    
    // Initialize categories
    Object.keys(categories).forEach(key => {
      grouped[key] = {
        name: categories[key],
        permissions: []
      };
    });

    // Group permissions
    permissions.forEach(permission => {
      const category = permission.category || 'other';
      if (grouped[category]) {
        grouped[category].permissions.push(permission);
      } else {
        // Handle unknown categories
        if (!grouped.other) {
          grouped.other = { name: 'Other', permissions: [] };
        }
        grouped.other.permissions.push(permission);
      }
    });

    // Remove empty categories
    Object.keys(grouped).forEach(key => {
      if (grouped[key].permissions.length === 0) {
        delete grouped[key];
      }
    });

    return grouped;
  }
};

export default PermissionsService;