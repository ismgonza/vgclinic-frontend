// src/services/roles.service.js
import api from './api';

class RolesService {
  // Get all available roles from backend
  async getRoles() {
    try {
      const response = await api.get('/accounts/roles/');
      return response.data;
    } catch (error) {
      // Fallback to hardcoded roles if API fails
      console.warn('Failed to fetch roles from API, using fallback:', error);
      return {
        roles: [
          { code: 'adm', display: 'Administrator', color: '#dc3545' },
          { code: 'doc', display: 'Doctor', color: '#0d6efd' },
          { code: 'ast', display: 'Assistant', color: '#0dcaf0' },
          { code: 'rdo', display: 'Read Only', color: '#6c757d' },
          { code: 'cus', display: 'Custom', color: '#ffc107' }
        ]
      };
    }
  }

  // Get role display name with translation fallback
  getRoleDisplay(roleCode, t = null) {
    if (t) {
      // Try to get translation first
      const translationKey = `roles.${roleCode}`;
      const translated = t(translationKey, { defaultValue: null });
      if (translated && translated !== translationKey) {
        return translated;
      }
    }
    
    // Fallback mapping
    const roleNames = {
      'adm': 'Administrator',
      'doc': 'Doctor',
      'ast': 'Assistant',
      'rdo': 'Read Only',
      'cus': 'Custom'
    };
    
    return roleNames[roleCode] || roleCode;
  }

  // Get Bootstrap badge class for role
  getRoleBadgeClass(roleCode) {
    const badgeClasses = {
      'adm': 'bg-danger',
      'doc': 'bg-primary',
      'ast': 'bg-info',
      'rdo': 'bg-secondary',
      'cus': 'bg-warning'
    };
    
    return badgeClasses[roleCode] || 'bg-secondary';
  }

  // Check if role is custom
  isCustomRole(roleCode) {
    return roleCode === 'cus';
  }
}

export default new RolesService();