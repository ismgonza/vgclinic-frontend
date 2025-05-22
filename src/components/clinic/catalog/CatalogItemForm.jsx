// src/components/clinic/catalog/CatalogItemForm.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import accountsService from '../../../services/accounts.service';
import catalogService from '../../../services/catalog.service';

const CatalogItemForm = ({ item, onSave, onCancel, specialtyId = null }) => {
  const { t } = useTranslation();
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

  useEffect(() => {
    // Fetch accounts and specialties for dropdowns
    const fetchData = async () => {
      try {
        const [accountsData, specialtiesData] = await Promise.all([
          accountsService.getAccounts(),
          catalogService.getSpecialties()
        ]);
        setAccounts(accountsData);
        setSpecialties(specialtiesData);
        
        // If specialtyId is provided, find the corresponding specialty and set the account
        if (specialtyId && !item) {
          const selectedSpecialty = specialtiesData.find(s => s.id == specialtyId);
          if (selectedSpecialty) {
            setFormData(prev => ({
              ...prev,
              specialty: specialtyId,
              account: selectedSpecialty.account
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching form data:', err);
      }
    };
    fetchData();
  }, [specialtyId]);

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

  // When specialty changes, update the account if necessary
  useEffect(() => {
    if (formData.specialty && !formData.account) {
      const selectedSpecialty = specialties.find(s => s.id == formData.specialty);
      if (selectedSpecialty) {
        setFormData(prev => ({
          ...prev,
          account: selectedSpecialty.account
        }));
      }
    }
  }, [formData.specialty, specialties]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : 
              name === 'price' ? parseFloat(value) : value
    });
    
    // If specialty is changed, update the account accordingly
    if (name === 'specialty' && value) {
      const selectedSpecialty = specialties.find(s => s.id == value);
      if (selectedSpecialty) {
        setFormData(prev => ({
          ...prev,
          specialty: value,
          account: selectedSpecialty.account
        }));
      }
    }
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

  // Helper to filter specialties by account
  const filteredSpecialties = formData.account 
    ? specialties.filter(s => s.account === formData.account) 
    : specialties;

  return (
    <Card>
      <Card.Header>
        {item ? t('catalog.editItem') : t('catalog.newItem')}
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>{t('catalog.account')}</Form.Label>
            <Col sm={9}>
              <Form.Select
                name="account"
                value={formData.account}
                onChange={handleChange}
                isInvalid={!!errors.account}
                required
                disabled={!!specialtyId} // Disable if specialty is pre-selected
              >
                <option value="">{t('catalog.selectAccount')}</option>
                {accounts.map(account => (
                  <option key={account.account_id} value={account.account_id}>
                    {account.account_name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.account}
              </Form.Control.Feedback>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>{t('catalog.specialty')}</Form.Label>
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
                {filteredSpecialties.map(specialty => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.specialty}
              </Form.Control.Feedback>
            </Col>
          </Form.Group>

          {/* Rest of the form remains the same */}
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
            <Form.Label column sm={3}>{t('catalog.name')}</Form.Label>
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
                label={t('catalog.active')}
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