// src/components/PermissionGuard.jsx
import React from 'react';
import { Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '../hooks/usePermissions';

const PermissionGuard = ({ 
  permission, 
  permissions, 
  requireAll = false,
  fallback,
  children 
}) => {
  const { t } = useTranslation();
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  // Show loading state
  if (loading) {
    return (
      <div className="text-center py-3">
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Check permissions
  let hasAccess = false;

  if (permission) {
    // Single permission check
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    // Multiple permissions check
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else {
    // No permissions specified - allow access
    hasAccess = true;
  }

  // If no access, show fallback or default denied message
  if (!hasAccess) {
    if (fallback) {
      return fallback;
    }

    // Just return null to hide the component completely
    return null;
    
    // Return message warning
    // return (
    //   <Alert variant="warning" className="text-center">
    //     <h5>{t('permissions.accessDenied')}</h5>
    //     <p>{t('permissions.insufficientPermissions')}</p>
    //     {permission && (
    //       <small className="text-muted">
    //         {t('permissions.requiredPermission')}: {t(`permissions.${permission}`, permission)}
    //       </small>
    //     )}
    //   </Alert>
    // );
  }

  // Has access - render children
  return children;
};

// Higher-order component version
export const withPermission = (Component, permission, permissions, requireAll = false) => {
  return (props) => (
    <PermissionGuard 
      permission={permission} 
      permissions={permissions}
      requireAll={requireAll}
    >
      <Component {...props} />
    </PermissionGuard>
  );
};

export default PermissionGuard;