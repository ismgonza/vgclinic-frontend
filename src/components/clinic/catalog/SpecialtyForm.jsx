// src/components/clinic/catalog/SpecialtyForm.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { AccountContext } from '../../../contexts/AccountContext';
import accountsService from '../../../services/accounts.service';

const SpecialtyForm = ({ specialty, onSave, onCancel }) => {
  const { t } = useTranslation();
  const { selectedAccount } = useContext(AccountContext);
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    account: '',
    name: '',
    code: '',
    description: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load accounts only if needed (shouldn't be needed anymore, but keep for backward compatibility)
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await accountsService.getAccounts();
        setAccounts(data);
      } catch (err) {
        console.error('Error fetching accounts:', err);
      }
    };
    
    // Only fetch accounts if we don't have selectedAccount (fallback)
    if (!selectedAccount) {
      fetchAccounts();
    }
  }, [selectedAccount]);

  // Initialize form data
  useEffect(() => {
    if (specialty) {
      // Editing existing specialty
      setFormData({
        account: specialty.account || '',
        name: specialty.name || '',
        code: specialty.code || '',
        description: specialty.description || '',
        is_active: specialty.is_active !== undefined ? specialty.is_active : true
      });
    } else if (selectedAccount) {
      // Creating new specialty - auto-select current account
      setFormData({
        account: selectedAccount.account_id,
        name: '',
        code: '',
        description: '',
        is_active: true
      });
    }
  }, [specialty, selectedAccount]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.account) newErrors.account = t('validation.required');
    if (!formData.name) newErrors.name = t('validation.required');
    if (!formData.code) newErrors.code = t('validation.required');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await onSave(formData);
    } catch (err) {
      console.error('Error saving specialty:', err);
      setError(err.response?.data?.detail || t('common.errorSaving'));
    } finally {
      setLoading(false);
    }
  };

  // Show error if no account selected
  if (!selectedAccount) {
    return (
      <Card>
        <Card.Header>
          {specialty ? t('catalog.editSpecialty') : t('catalog.newSpecialty')}
        </Card.Header>
        <Card.Body>
          <Alert variant="warning">
            {t('catalog.selectAccountFirst') || 'Please select a clinic first to manage specialties.'}
          </Alert>
          <Button variant="secondary" onClick={onCancel}>
            {t('common.back')}
          </Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        {specialty ? t('catalog.editSpecialty') : t('catalog.newSpecialty')}
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          {/* Hide account selection for editing, show as disabled for creating */}
          {!specialty && (
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>{t('common.account')}</Form.Label>
              <Col sm={9}>
                <Form.Control
                  type="text"
                  value={selectedAccount.account_name}
                  disabled
                  className="bg-light"
                />
              </Col>
            </Form.Group>
          )}

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>{t('common.name')}</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                isInvalid={!!errors.name}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>{t('catalog.code')}</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                isInvalid={!!errors.code}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.code}
              </Form.Control.Feedback>
              <Form.Text muted>
                {t('catalog.codeHelp')}
              </Form.Text>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>{t('catalog.description')}</Form.Label>
            <Col sm={9}>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Col sm={{ span: 9, offset: 3 }}>
              <Form.Check
                type="checkbox"
                id="is_active"
                name="is_active"
                label={t('common.active')}
                checked={formData.is_active}
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

export default SpecialtyForm;