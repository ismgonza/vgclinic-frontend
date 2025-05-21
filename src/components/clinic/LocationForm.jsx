import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import locationsService from '../../services/locations.service';
import accountsService from '../../services/accounts.service';
import CostaRicaGeoSelector from '../common/CostaRicaGeoSelector';

const LocationForm = ({ location, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    account: '',
    name: '',
    email: '',
    phone: '',
    province: '',
    canton: '',
    district: '',
    address: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch accounts for dropdown
    const fetchAccounts = async () => {
      try {
        const data = await accountsService.getAccounts();
        setAccounts(data);
      } catch (err) {
        console.error('Error fetching accounts:', err);
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (location) {
      setFormData({
        account: location.account || '',
        name: location.name || '',
        email: location.email || '',
        phone: location.phone || '',
        province: location.province || '',
        canton: location.canton || '',
        district: location.district || '',
        address: location.address || '',
        is_active: location.is_active !== undefined ? location.is_active : true
      });
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleGeoChange = (geoData) => {
    setFormData({
      ...formData,
      ...geoData
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.account) newErrors.account = t('validation.required');
    if (!formData.name) newErrors.name = t('validation.required');
    if (!formData.email) newErrors.email = t('validation.required');
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t('validation.invalidEmail');
    if (!formData.phone) newErrors.phone = t('validation.required');
    if (!formData.province) newErrors.province = t('validation.required');
    if (!formData.canton) newErrors.canton = t('validation.required');
    if (!formData.district) newErrors.district = t('validation.required');
    if (!formData.address) newErrors.address = t('validation.required');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (location) {
        await locationsService.updateBranch(location.id, formData);
      } else {
        await locationsService.createBranch(formData);
      }
      
      if (onSave) onSave();
    } catch (err) {
      console.error('Error saving location:', err);
      setError(err.response?.data?.detail || t('common.errorSaving'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        {location ? t('locations.editLocation') : t('locations.newLocation')}
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>{t('accounts.accountName')}</Form.Label>
            <Col sm={9}>
              <Form.Select
                name="account"
                value={formData.account}
                onChange={handleChange}
                isInvalid={!!errors.account}
              >
                <option value="">{t('accounts.selectAccount')}</option>
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
            <Form.Label column sm={3}>{t('locations.locationName')}</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>{t('locations.email')}</Form.Label>
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
            <Form.Label column sm={3}>{t('locations.phone')}</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                isInvalid={!!errors.phone}
              />
              <Form.Control.Feedback type="invalid">
                {errors.phone}
              </Form.Control.Feedback>
            </Col>
          </Form.Group>

          <CostaRicaGeoSelector
            formData={{
              province: formData.province,
              canton: formData.canton,
              district: formData.district
            }}
            onChange={handleGeoChange}
            errors={errors}
            required={true}
          />

          <Form.Group className="mb-3">
            <Form.Label>{t('locations.address')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="address"
              value={formData.address}
              onChange={handleChange}
              isInvalid={!!errors.address}
            />
            <Form.Control.Feedback type="invalid">
              {errors.address}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="is_active"
              name="is_active"
              label={t('locations.active')}
              checked={formData.is_active}
              onChange={handleChange}
            />
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

export default LocationForm;