// src/components/clinic/catalog/CatalogItemForm.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { AccountContext } from '../../../contexts/AccountContext';
import accountsService from '../../../services/accounts.service';
import catalogService from '../../../services/catalog.service';

const CatalogItemForm = ({ item, onSave, onCancel, specialtyId = null }) => {
  const { t } = useTranslation();
  const { selectedAccount } = useContext(AccountContext);
  const [accounts, setAccounts] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [formData, setFormData] = useState({
    account: '',
    specialty: specialtyId || '',
    code: '',
    name: '',
    description: '',
    price: 0,
    is_variable_price: false,
    is_active: true
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load form data when component mounts or account changes
  useEffect(() => {
    if (selectedAccount) {
      fetchData();
    }
  }, [selectedAccount, specialtyId]);

  const fetchData = async () => {
    if (!selectedAccount) return;
    
    try {
      // Set account context for API calls
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      // Fetch specialties for the current account
      const specialtiesData = await catalogService.getSpecialties(accountHeaders);
      setSpecialties(specialtiesData);
      
      // If specialtyId is provided, find the corresponding specialty and set the account
      if (specialtyId && !item) {
        const selectedSpecialty = specialtiesData.find(s => s.id == specialtyId);
        if (selectedSpecialty) {
          setFormData(prev => ({
            ...prev,
            specialty: specialtyId,
            account: selectedAccount.account_id
          }));
        }
      } else if (!item) {
        // Creating new item - auto-select current account
        setFormData(prev => ({
          ...prev,
          account: selectedAccount.account_id
        }));
      }
      
    } catch (err) {
      console.error('Error fetching form data:', err);
    }
  };

  // Initialize form for editing
  useEffect(() => {
    if (item) {
      setFormData({
        account: item.account || '',
        specialty: item.specialty || specialtyId || '',
        code: item.code || '',
        name: item.name || '',
        description: item.description || '',
        price: item.price || 0,
        is_variable_price: item.is_variable_price !== undefined ? item.is_variable_price : false,
        is_active: item.is_active !== undefined ? item.is_active : true
      });
    }
  }, [item, specialtyId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : 
              name === 'price' ? parseFloat(value) : value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.account) newErrors.account = t('validation.required');
    if (!formData.specialty) newErrors.specialty = t('validation.required');
    if (!formData.name) newErrors.name = t('validation.required');
    if (!formData.code) newErrors.code = t('validation.required');
    if (formData.price < 0) newErrors.price = t('validation.positiveNumber');
    
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
      console.error('Error saving catalog item:', err);
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
          {item ? t('catalog.editItem') : t('catalog.newItem')}
        </Card.Header>
        <Card.Body>
          <Alert variant="warning">
            {t('catalog.selectAccountFirst') || 'Please select a clinic first to manage catalog items.'}
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
        {item ? t('catalog.editItem') : t('catalog.newItem')}
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          {/* Hide account selection for editing, show as disabled for creating */}
          {!item && (
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>{t('common.account')}</Form.Label>
              <Col sm={9}>
                <Form.Control
                  type="text"
                  value={selectedAccount.account_name}
                  disabled
                  className="bg-light"
                />
                <Form.Text className="text-muted">
                  {/* {t('catalog.autoSelectedClinic') || 'This catalog item will be created for the currently selected clinic.'} */}
                </Form.Text>
              </Col>
            </Form.Group>
          )}

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>{t('common.specialty')}</Form.Label>
            <Col sm={9}>
              <Form.Select
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                isInvalid={!!errors.specialty}
                required
                disabled={!!specialtyId} // Disable if specialty is pre-selected
              >
                <option value="">{t('catalog.selectSpecialty')}</option>
                {specialties.map(specialty => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.specialty}
              </Form.Control.Feedback>
              {specialtyId && (
                <Form.Text className="text-muted">
                  {t('catalog.preSelectedSpecialty') || 'Specialty is pre-selected based on navigation.'}
                </Form.Text>
              )}
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
            <Form.Label column sm={3}>{t('catalog.price')}</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                name="price"
                value={formData.price}
                onChange={handleChange}
                isInvalid={!!errors.price}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.price}
              </Form.Control.Feedback>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Col sm={{ span: 9, offset: 3 }}>
              <Form.Check
                type="checkbox"
                id="is_variable_price"
                name="is_variable_price"
                label={t('catalog.variablePrice')}
                checked={formData.is_variable_price}
                onChange={handleChange}
              />
              <Form.Text muted>
                {t('catalog.variablePriceHelp')}
              </Form.Text>
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

export default CatalogItemForm;