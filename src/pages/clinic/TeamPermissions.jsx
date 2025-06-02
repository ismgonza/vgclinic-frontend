// src/pages/clinic/TeamPermissions.jsx - UPDATED WITH CUSTOM ROLE SUPPORT
import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AccountContext } from '../../contexts/AccountContext';
import PermissionsService from '../../services/permissions.service';

const TeamPermissions = () => {
  const { t } = useTranslation();
  const { selectedAccount } = useContext(AccountContext);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [categories, setCategories] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingPermissions, setEditingPermissions] = useState([]);
  const [roleBasedPermissions, setRoleBasedPermissions] = useState([]);
  const [individualPermissions, setIndividualPermissions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load available permissions and users permissions simultaneously
      const [permissionsData, usersData] = await Promise.all([
        PermissionsService.getAvailablePermissions(),
        PermissionsService.getUsersPermissions()
      ]);

      setAvailablePermissions(permissionsData.permissions || []);
      setCategories(permissionsData.categories || {});
      setUsers(usersData.users || []);
    } catch (error) {
      console.error('Error loading permissions data:', error);
      setError(t('teamPermissions.errors.loadData'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditPermissions = async (user) => {
    try {
      setSelectedUser(user);
      
      // Get detailed user permissions including role vs individual breakdown
      const userDetails = await PermissionsService.getUserPermissions(user.user_id);
      
      // Separate role-based from individual permissions
      const rolePerms = userDetails.role_permissions || [];
      const individualPerms = userDetails.individual_permissions || [];
      
      setRoleBasedPermissions(rolePerms);
      setIndividualPermissions(individualPerms);
      setEditingPermissions([...userDetails.permissions]);
      setShowModal(true);
    } catch (error) {
      console.error('Error loading user details:', error);
      // Fallback to current method if detailed API fails
      setSelectedUser(user);
      setRoleBasedPermissions([]);
      setIndividualPermissions([...user.permissions]);
      setEditingPermissions([...user.permissions]);
      setShowModal(true);
    }
  };

  const handlePermissionToggle = (permissionKey) => {
    if (editingPermissions.includes(permissionKey)) {
      setEditingPermissions(editingPermissions.filter(p => p !== permissionKey));
    } else {
      setEditingPermissions([...editingPermissions, permissionKey]);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedUser || !selectedAccount) return;

    try {
      setSaving(true);
      await PermissionsService.updateUserPermissions(
        selectedUser.user_id,
        editingPermissions,
        `Updated by admin on ${new Date().toLocaleString()}`,
        selectedAccount.account_id
      );

      // Refresh data
      await loadData();
      
      setShowModal(false);
      setSelectedUser(null);
      setEditingPermissions([]);
      setRoleBasedPermissions([]);
      setIndividualPermissions([]);
    } catch (error) {
      console.error('Error saving permissions:', error);
      setError(t('teamPermissions.errors.savePermissions'));
    } finally {
      setSaving(false);
    }
  };

  const getPermissionsByCategory = () => {
    return PermissionsService.groupPermissionsByCategory(availablePermissions, categories);
  };

  const getPermissionDisplay = (permissionKey) => {
    // First try to get translation
    const translationKey = `permissions.${permissionKey}`;
    const translated = t(translationKey, { defaultValue: null });
    
    // If translation exists, use it
    if (translated && translated !== translationKey) {
      return translated;
    }
    
    // Fallback to API display value
    const permission = availablePermissions.find(p => p.key === permissionKey);
    return permission ? permission.display : permissionKey;
  };

  const getPermissionSource = (permissionKey) => {
    if (roleBasedPermissions.includes(permissionKey)) {
      return 'role';
    } else if (individualPermissions.includes(permissionKey)) {
      return 'individual';
    }
    return 'none';
  };

  // NEW: Get role display with proper Custom role handling
  const getRoleDisplay = (user) => {
    // Handle custom role display
    if (user.role === 'cus') {
      return t('roles.cus', 'Custom');
    }
    return user.role_display;
  };

  // NEW: Get role badge color based on role
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'adm': return 'bg-danger';
      case 'doc': return 'bg-primary';
      case 'ast': return 'bg-info';
      case 'rdo': return 'bg-secondary';
      case 'cus': return 'bg-warning'; // Custom role gets warning color
      default: return 'bg-secondary';
    }
  };

  // NEW: Calculate permission summary for table with Custom role consideration
  const getPermissionSummary = (user) => {
    if (user.is_owner) {
      return { total: availablePermissions.length, individual: 0, role: availablePermissions.length };
    }
    
    // For Custom roles, all permissions are individual (no role-based defaults)
    if (user.role === 'cus') {
      return { 
        total: user.permissions.length, 
        individual: user.permissions.length, 
        role: 0 
      };
    }
    
    const individualCount = user.permission_details?.filter(p => !p.granted_by_role)?.length || 0;
    const roleCount = user.permissions.length - individualCount;
    
    return { 
      total: user.permissions.length, 
      individual: individualCount, 
      role: roleCount 
    };
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <button className="btn btn-outline-danger" onClick={loadData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">{t('teamPermissions.title')}</h2>
            <button className="btn btn-outline-secondary" onClick={loadData}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              {t('common.refresh')}
            </button>
          </div>

          {/* UPDATED: Legend for permission types with Custom role info */}
          <div className="alert alert-info mb-4">
            <div className="d-flex align-items-center flex-wrap gap-3">
              <strong>{t('teamPermissions.legend.title')}:</strong>
              <div className="d-flex align-items-center">
                <span className="badge bg-info me-2">{t('common.role')}</span>
                <small>{t('teamPermissions.legend.role')}</small>
              </div>
              <div className="d-flex align-items-center">
                <span className="badge bg-warning me-2">Individual</span>
                <small>{t('teamPermissions.legend.individual')}</small>
              </div>
              <div className="d-flex align-items-center">
                <span className="badge bg-success me-2">{t('common.owner')}</span>
                <small>{t('teamPermissions.legend.owner')}</small>
              </div>
              <div className="d-flex align-items-center">
                <span className="badge bg-warning me-2">{t('common.custom')}</span>
                <small>{t('teamPermissions.legend.custom', 'Custom roles have no default permissions')}</small>
              </div>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="alert alert-info">
              <h5>{t('teamPermissions.noMembers.title')}</h5>
              <p>{t('teamPermissions.noMembers.description')}</p>
            </div>
          ) : (
            <div className="card">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>{t('teamPermissions.table.member')}</th>
                        <th>{t('common.role')}</th>
                        <th>{t('common.status')}</th>
                        <th>{t('teamPermissions.table.permissionsCount')}</th>
                        <th>{t('common.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => {
                        const permSummary = getPermissionSummary(user);
                        return (
                          <tr key={user.user_id}>
                            <td>
                              <div>
                                <strong>{user.user_details.full_name}</strong>
                                <br />
                                <small className="text-muted">{user.user_details.email}</small>
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${getRoleBadgeColor(user.role)}`}>
                                {getRoleDisplay(user)}
                              </span>
                              {user.role === 'cus' && (
                                <small className="d-block text-muted mt-1">
                                  {t('teamPermissions.customRoleNote', 'All permissions individually assigned')}
                                </small>
                              )}
                            </td>
                            <td>
                              {user.is_owner ? (
                                <span className="badge bg-success">{t('common.owner')}</span>
                              ) : (
                                <span className="badge bg-secondary">{t('common.member')}</span>
                              )}
                            </td>
                            <td>
                              {user.is_owner ? (
                                <span className="text-success">
                                  <i className="bi bi-check-circle me-1"></i>
                                  {t('teamPermissions.allPermissions')}
                                </span>
                              ) : (
                                <div>
                                  <div>{permSummary.total} {t('teamPermissions.of')} {availablePermissions.length}</div>
                                  {(permSummary.role > 0 || permSummary.individual > 0) && (
                                    <small className="text-muted">
                                      {permSummary.role > 0 && (
                                        <span>
                                          <span className="badge bg-info me-1">Role</span>
                                          {permSummary.role}
                                        </span>
                                      )}
                                      {permSummary.individual > 0 && (
                                        <span className={permSummary.role > 0 ? "ms-2" : ""}>
                                          <span className="badge bg-warning me-1">Individual</span>
                                          {permSummary.individual}
                                        </span>
                                      )}
                                    </small>
                                  )}
                                </div>
                              )}
                            </td>
                            <td>
                              {!user.is_owner && (
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleEditPermissions(user)}
                                >
                                  <i className="bi bi-gear me-1"></i>
                                  {t('teamPermissions.manage')}
                                </button>
                              )}
                              {user.is_owner && (
                                <small className="text-muted">{t('teamPermissions.ownerCannotEdit')}</small>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Permission Management Modal */}
      {showModal && selectedUser && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {t('teamPermissions.modal.title')} - {selectedUser.user_details.full_name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <p className="text-muted">
                    {t('teamPermissions.modal.description')}
                  </p>
                  <div className="alert alert-light">
                    <strong>{t('teamPermissions.modal.currentRole', 'Current Role')}:</strong> 
                    <span className={`badge ${getRoleBadgeColor(selectedUser.role)} ms-2`}>
                      {getRoleDisplay(selectedUser)}
                    </span>
                    <br />
                    <small className="text-muted mt-1 d-block">
                      {selectedUser.role === 'cus' 
                        ? t('teamPermissions.modal.customRoleNote', 'Custom roles have no default permissions. All permissions must be individually assigned.')
                        : t('teamPermissions.modal.roleNote', 'Role-based permissions are automatically inherited. Individual permissions can override or add to role permissions.')
                      }
                    </small>
                  </div>
                </div>

                {Object.entries(getPermissionsByCategory()).map(([categoryKey, category]) => (
                  <div key={categoryKey} className="mb-4">
                    <h6 className="text-primary border-bottom pb-2">
                      {category.name}
                    </h6>
                    <div className="row">
                      {category.permissions.map(permission => {
                        const isChecked = editingPermissions.includes(permission.key);
                        const source = getPermissionSource(permission.key);
                        const isFromRole = roleBasedPermissions.includes(permission.key);
                        
                        return (
                          <div key={permission.key} className="col-md-6 mb-2">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`perm-${permission.key}`}
                                checked={isChecked}
                                onChange={() => handlePermissionToggle(permission.key)}
                              />
                              <label 
                                className="form-check-label d-flex align-items-center justify-content-between" 
                                htmlFor={`perm-${permission.key}`}
                              >
                                <span>{getPermissionDisplay(permission.key)}</span>
                                <div>
                                  {isFromRole && selectedUser.role !== 'cus' && (
                                    <span className="badge bg-info ms-2">
                                      {t('teamPermissions.legend.role', 'Role')}
                                    </span>
                                  )}
                                  {source === 'individual' && (
                                    <span className="badge bg-warning ms-2">
                                      {t('teamPermissions.legend.individual', 'Individual')}
                                    </span>
                                  )}
                                </div>
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="mt-4 p-3 bg-light rounded">
                  <h6>{t('teamPermissions.quickActions.title')}</h6>
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => setEditingPermissions(availablePermissions.map(p => p.key))}
                    >
                      {t('teamPermissions.quickActions.selectAll')}
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        // Keep role-based permissions, clear only individual ones
                        // For Custom roles, clear everything since they have no role-based permissions
                        if (selectedUser.role === 'cus') {
                          setEditingPermissions([]);
                        } else {
                          setEditingPermissions([...roleBasedPermissions]);
                        }
                      }}
                    >
                      {selectedUser.role === 'cus' 
                        ? t('teamPermissions.quickActions.clearAll', 'Clear All')
                        : t('teamPermissions.quickActions.clearIndividual', 'Clear Individual')
                      }
                    </button>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        const viewPermissions = availablePermissions
                          .filter(p => p.key.startsWith('view_'))
                          .map(p => p.key);
                        if (selectedUser.role === 'cus') {
                          setEditingPermissions(viewPermissions);
                        } else {
                          setEditingPermissions([...roleBasedPermissions, ...viewPermissions]);
                        }
                      }}
                    >
                      {selectedUser.role === 'cus'
                        ? t('teamPermissions.quickActions.setViewOnly', 'Set View Only')
                        : t('teamPermissions.quickActions.addViewOnly', 'Add View Only')
                      }
                    </button>
                  </div>
                  <small className="text-muted d-block mt-2">
                    {selectedUser.role === 'cus'
                      ? t('teamPermissions.quickActions.customNote', 'Note: Custom roles start with no permissions.')
                      : t('teamPermissions.quickActions.note', 'Note: Role-based permissions cannot be removed individually.')
                    }
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  {t('common.cancel')}
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSavePermissions}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      {t('common.saving')}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check me-1"></i>
                      {t('common.saveChanges')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPermissions;