// src/components/platform/AccountForm.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import accountsService from '../../services/accounts.service';

const AccountForm = ({ account, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    account_name: '',
    account_email: '',
    account_phone: '',
    account_address: '',
    account_website: '',
    account_status: 'pending',
    is_platform_account: true
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (account) {
      setFormData({
        account_name: account.account_name || '',
        account_email: account.account_email || '',
        account_phone: account.account_phone || '',
        account_address: account.account_address || '',
        account_website: account.account_website || '',
        account_status: account.account_status || 'pending',
        is_platform_account: account.is_platform_account !== undefined ? account.is_platform_account : true
      });
    }
  }, [account]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.account_name) newErrors.account_name = t('validation.required');
    if (!formData.account_email) newErrors.account_email = t('validation.required');
    if (!/\S+@\S+\.\S+/.test(formData.account_email)) newErrors.account_email = t('validation.invalidEmail');
    if (!formData.account_phone) newErrors.account_phone = t('validation.required');
    if (!formData.account_address) newErrors.account_address = t('validation.required');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (account) {
        await accountsService.updateAccount(account.account_id, formData);
      } else {
        await accountsService.createAccount(formData);
      }
      
      if (onSave) onSave();
    } catch (err) {
      console.error('Error saving account:', err);
      setError(err.response?.data?.detail || t('common.errorSaving'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        {account ? t('accounts.editAccount') : t('accounts.newAccount')}
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>{t('accounts.accountName')}</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                name="account_name"
                value={formData.account_name}
                onChange={handleChange}
                isInvalid={!!errors.account_name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.account_name}
              </Form.Control.Feedback>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>{t('accounts.email')}</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="email"
                name="account_email"
                value={formData.account_email}
                onChange={handleChange}
                isInvalid={!!errors.account_email}
              />
              <Form.Control.Feedback type="invalid">
                {errors.account_email}
              </Form.Control.Feedback>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>{t('accounts.phone')}</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                name="account_phone"
                value={formData.account_phone}
                onChange={handleChange}
                isInvalid={!!errors.account_phone}
              />
              <Form.Control.Feedback type="invalid">
                {errors.account_phone}
              </Form.Control.Feedback>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>{t('accounts.website')}</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="url"
                name="account_website"
                value={formData.account_website}
                onChange={handleChange}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>{t('accounts.address')}</Form.Label>
            <Col sm={9}>
              <Form.Control
                as="textarea"
                rows={3}
                name="account_address"
                value={formData.account_address}
                onChange={handleChange}
                isInvalid={!!errors.account_address}
              />
              <Form.Control.Feedback type="invalid">
                {errors.account_address}
              </Form.Control.Feedback>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>{t('accounts.status')}</Form.Label>
            <Col sm={9}>
              <Form.Select
                name="account_status"
                value={formData.account_status}
                onChange={handleChange}
              >
                <option value="pending">{t('accounts.statusPending')}</option>
                <option value="active">{t('accounts.statusActive')}</option>
                <option value="suspended">{t('accounts.statusSuspended')}</option>
              </Form.Select>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Col sm={{ span: 9, offset: 3 }}>
              <Form.Check
                type="checkbox"
                id="is_platform_account"
                name="is_platform_account"
                label={t('accounts.isPlatformAccount')}
                checked={formData.is_platform_account}
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

export default AccountForm;