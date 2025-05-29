// src/utils/roleUtils.js - CORRECT JavaScript version
import { useTranslation } from 'react-i18next';

// Role definitions - keeping your existing structure
export const ROLES = {
  ADM: 'adm',
  DOC: 'doc', 
  AST: 'ast',
  RDO: 'rdo',
  CUS: 'cus'  // Custom role added
};

// Role display names (fallback if translations not available)
export const ROLE_NAMES = {
  [ROLES.ADM]: 'Administrator',
  [ROLES.DOC]: 'Doctor',
  [ROLES.AST]: 'Assistant', 
  [ROLES.RDO]: 'Read Only',
  [ROLES.CUS]: 'Custom'  // Custom role added
};

// Role badge colors for consistent UI
export const ROLE_COLORS = {
  [ROLES.ADM]: 'bg-danger',
  [ROLES.DOC]: 'bg-primary',
  [ROLES.AST]: 'bg-info',
  [ROLES.RDO]: 'bg-secondary',
  [ROLES.CUS]: 'bg-warning'  // Custom role added
};

// Get role display name with translation support
export const getRoleDisplay = (roleCode, t = null) => {
  if (t) {
    // Try to get translation first
    const translationKey = `roles.${roleCode}`;
    const translated = t(translationKey, { defaultValue: null });
    if (translated && translated !== translationKey) {
      return translated;
    }
  }
  
  // Fallback to hardcoded names
  return ROLE_NAMES[roleCode] || roleCode;
};

// Get role badge color class
export const getRoleBadgeColor = (roleCode) => {
  return ROLE_COLORS[roleCode] || 'bg-secondary';
};

// Check if role is custom
export const isCustomRole = (roleCode) => {
  return roleCode === ROLES.CUS;
};

// Get all available roles for dropdowns
export const getAllRoles = (t = null) => {
  return Object.entries(ROLES).map(([key, value]) => ({
    value: value,
    label: getRoleDisplay(value, t),
    color: getRoleBadgeColor(value)
  }));
};

// Hook for using roles with translations
export const useRoles = () => {
  const { t } = useTranslation();
  
  return {
    ROLES,
    ROLE_NAMES,
    ROLE_COLORS,
    getRoleDisplay: (roleCode) => getRoleDisplay(roleCode, t),
    getRoleBadgeColor,
    isCustomRole,
    getAllRoles: () => getAllRoles(t)
  };
};

export default {
  ROLES,
  ROLE_NAMES, 
  ROLE_COLORS,
  getRoleDisplay,
  getRoleBadgeColor,
  isCustomRole,
  getAllRoles,
  useRoles
};