// src/pages/Profile.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/AuthContext';
import usersService from '../services/users.service';
import permissionsService from '../services/permissions.service';

const Profile = () => {
  const { t } = useTranslation();
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [teamMemberships, setTeamMemberships] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      // Load profile data
      const profile = await usersService.getMyProfile();
      setProfileData(profile);
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
      });

      // Load team memberships for clinic users
      if (!profile.is_staff) {
        try {
          const memberships = await usersService.getMyTeamMemberships();
          setTeamMemberships(memberships);
        } catch (err) {
          console.warn('Could not load team memberships:', err);
          setTeamMemberships([]);
        }
      }

      // Load user permissions
      try {
        const permissions = await permissionsService.getMyPermissions();
        setUserPermissions(permissions);
      } catch (err) {
        console.warn('Could not load permissions:', err);
        setUserPermissions([]);
      }

    } catch (err) {
      setError(t('profile.updateError'));
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Use the new profile update endpoint
      const updatedProfile = await usersService.updateMyProfile(formData);
      setProfileData(updatedProfile);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(t('profile.updateError'));
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError(t('validation.passwordMatch'));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await usersService.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      
      setSuccess(true);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setShowChangePassword(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(t('profile.passwordError'));
      console.error('Error changing password:', err);
    } finally {
      setSaving(false);
    }
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      'adm': t('roles.adm'),
      'doc': t('roles.doc'),
      'ast': t('roles.ast'),
      'rdo': t('roles.rdo'),
      'cus': t('roles.cus'),
    };
    return roleMap[role] || role;
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">{t('common.loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">{t('profile.title')}</h2>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success" role="alert">
              {t('profile.updateSuccess')}
            </div>
          )}

          {/* Personal Information */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">{t('profile.personalInfo')}</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="first_name" className="form-label">
                      {t('users.firstName')} <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="last_name" className="form-label">
                      {t('users.lastName')} <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">
                      {t('common.email')} <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={profileData?.email || ''}
                      disabled
                    />
                    <small className="form-text text-muted">
                      {t('profile.contactSupportEmail')}
                    </small>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="phone" className="form-label">
                      {t('common.phone')}
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
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
              </form>
            </div>
          </div>

          {/* Account Information */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">{t('profile.accountInfo')}</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">{t('profile.userType')}</label>
                  <div className="form-control-plaintext">
                    {profileData?.is_staff ? t('profile.platformAdmin') : t('profile.clinicUser')}
                  </div>
                </div>
                {profileData?.is_staff && (
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t('profile.adminLevel')}</label>
                    <div className="form-control-plaintext">
                      {profileData?.is_superuser ? t('profile.superuser') : t('profile.staff')}
                    </div>
                  </div>
                )}
              </div>

              {/* Show role and specialties for clinic users */}
              {!profileData?.is_staff && teamMemberships.length > 0 && (
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t('profile.currentRole')}</label>
                    <div className="form-control-plaintext">
                      {teamMemberships.map(membership => (
                        <span key={membership.account_id} className="badge bg-primary me-2">
                          {getRoleDisplay(membership.role)} at {membership.account_name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t('profile.assignedSpecialties')}</label>
                    <div className="form-control-plaintext">
                      {teamMemberships.some(m => m.specialty_name) ? (
                        teamMemberships.map(membership => 
                          membership.specialty_name && (
                            <span key={`${membership.account_id}-${membership.specialty_name}`} className="badge bg-info me-2">
                              {membership.specialty_name}
                            </span>
                          )
                        )
                      ) : (
                        <span className="text-muted">{t('profile.noSpecialties')}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="row">
                <div className="col-12">
                  <button
                    type="button"
                    className="btn btn-outline-info me-3"
                    onClick={() => setShowPermissionsModal(true)}
                  >
                    <i className="bi bi-shield-check me-2"></i>
                    {t('profile.viewPermissions')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowChangePassword(!showChangePassword)}
                  >
                    <i className="bi bi-key me-2"></i>
                    {t('profile.changePassword')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Section */}
          {showChangePassword && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">{t('profile.changePassword')}</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handlePasswordSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="current_password" className="form-label">
                        {t('profile.currentPassword')} <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="current_password"
                        name="current_password"
                        value={passwordData.current_password}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="new_password" className="form-label">
                        {t('profile.newPassword')} <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="new_password"
                        name="new_password"
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        required
                        minLength="8"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="confirm_password" className="form-label">
                        {t('profile.confirmNewPassword')} <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="confirm_password"
                        name="confirm_password"
                        value={passwordData.confirm_password}
                        onChange={handlePasswordChange}
                        required
                        minLength="8"
                      />
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowChangePassword(false)}
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          {t('common.saving')}
                        </>
                      ) : (
                        t('profile.changePassword')
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Permissions Modal */}
          {showPermissionsModal && (
            <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{t('profile.permissionsModal')}</h5>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setShowPermissionsModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {userPermissions.permissions && userPermissions.permissions.length > 0 ? (
                      <div className="row">
                        {userPermissions.permissions.map((permission, index) => (
                          <div key={index} className="col-md-6 mb-2">
                            <div className="d-flex align-items-center">
                              <i className="bi bi-check-circle text-success me-2"></i>
                              <span>{t(`permissions.${permission}`, permission)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted">No tienes permisos asignados aún.</p>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowPermissionsModal(false)}
                    >
                      {t('common.close')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;