// src/components/platform/UserForm.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import usersService from '../../services/users.service';

const UserForm = ({ user, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    id_type: '01',
    id_number: '',
    password: '',
    confirmPassword: '',
    is_active: true,
    is_staff: false,
    is_superuser: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        id_type: user.id_type || '01',
        id_number: user.id_number || '',
        password: '',
        confirmPassword: '',
        is_active: user.is_active !== undefined ? user.is_active : true,
        is_staff: user.is_staff || false,
        is_superuser: user.is_superuser || false
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.email) newErrors.email = t('validation.required');
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t('validation.invalidEmail');
    if (!formData.first_name) newErrors.first_name = t('validation.required');
    if (!formData.last_name) newErrors.last_name = t('validation.required');
    if (!formData.id_number) newErrors.id_number = t('validation.required');
    
    // ID validation based on type
    if (formData.id_type === '01' && !/^\d{9}$/.test(formData.id_number)) {
      newErrors.id_number = t('users.invalidCedula');
    } else if (formData.id_type === '02' && !/^\d{11,12}$/.test(formData.id_number)) {
      newErrors.id_number = t('users.invalidDimex');
    }
    
    // Password validation - only required for new users
    if (!user) {
      if (!formData.password) {
        newErrors.password = t('validation.required');
      } else if (formData.password.length < 8) {
        newErrors.password = t('validation.passwordLength');
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = t('validation.required');
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t('validation.passwordMatch');
      }
    } else if (formData.password) {
      // If editing and password provided, check password strength and match
      if (formData.password.length < 8) {
        newErrors.password = t('validation.passwordLength');
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t('validation.passwordMatch');
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Prepare data for API - remove confirmPassword which is not needed for API
    const apiData = { ...formData };
    delete apiData.confirmPassword;
    
    // Only send password if it has a value
    if (!apiData.password) {
      delete apiData.password;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      if (user) {
        await usersService.updateUser(user.id, apiData);
      } else {
        await usersService.createUser(apiData);
      }
      
      if (onSave) onSave();
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.response?.data?.detail || t('common.errorSaving'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        {user ? t('users.editUser') : t('users.newUser')}
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>{t('users.email')}</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>{t('users.firstName')}</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                isInvalid={!!errors.first_name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.first_name}
              </Form.Control.Feedback>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>{t('users.lastName')}</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                isInvalid={!!errors.last_name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.last_name}
              </Form.Control.Feedback>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>{t('users.idType')}</Form.Label>
            <Col sm={9}>
              <Form.Select
                name="id_type"
                value={formData.id_type}
                onChange={handleChange}
              >
                <option value="01">{t('users.idTypeCedula')}</option>
                <option value="02">{t('users.idTypeDimex')}</option>
              </Form.Select>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>{t('users.idNumber')}</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                name="id_number"
                value={formData.id_number}
                onChange={handleChange}
                isInvalid={!!errors.id_number}
              />
              <Form.Control.Feedback type="invalid">
                {errors.id_number}
              </Form.Control.Feedback>
              <Form.Text muted>
                {formData.id_type === '01' 
                  ? t('users.cedulaHelp') 
                  : t('users.dimexHelp')}
              </Form.Text>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>{t('users.password')}</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                isInvalid={!!errors.password}
                placeholder={user ? t('users.leaveBlankNoChange') : ''}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>{t('users.confirmPassword')}</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                isInvalid={!!errors.confirmPassword}
              />
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword}
              </Form.Control.Feedback>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Col sm={{ span: 9, offset: 3 }}>
              <Form.Check
                type="checkbox"
                id="is_active"
                name="is_active"
                label={t('users.isActive')}
                checked={formData.is_active}
                onChange={handleChange}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Col sm={{ span: 9, offset: 3 }}>
              <Form.Check
                type="checkbox"
                id="is_staff"
                name="is_staff"
                label={t('users.isStaff')}
                checked={formData.is_staff}
                onChange={handleChange}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Col sm={{ span: 9, offset: 3 }}>
              <Form.Check
                type="checkbox"
                id="is_superuser"
                name="is_superuser"
                label={t('users.isSuperuser')}
                checked={formData.is_superuser}
                onChange={handleChange}
              />
            </Col>
          </Form.Group>

          <Row className="mt-4">
            <Col className="d-flex justify-content-end">
              <Button 
                variant="secondary" 
                onClick={onCancel} 
                className="me-2"
                disabled={loading}
              >
                {t('common.cancel')}
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? t('common.saving') : t('common.save')}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default UserForm;