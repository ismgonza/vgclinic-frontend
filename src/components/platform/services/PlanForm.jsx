// src/components/platform/services/PlanForm.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const PlanForm = ({ show, plan, services, features, onSave, onClose }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    plan_type: 'account',
    services: [],
    features: [],
    base_price: 0,
    billing_period: 'monthly',
    max_users: 5,
    max_locations: 1,
    ui_order: 0,
    is_active: true
  });

  const PLAN_TYPE_OPTIONS = [
    { value: 'account', label: t('plans.planTypes.account') },
    { value: 'user', label: t('plans.planTypes.user') }
  ];

  const BILLING_PERIOD_OPTIONS = [
    { value: 'monthly', label: t('plans.billingPeriods.monthly') },
    { value: 'quarterly', label: t('plans.billingPeriods.quarterly') },
    { value: 'biannual', label: t('plans.billingPeriods.biannual') },
    { value: 'annual', label: t('plans.billingPeriods.annual') }
  ];

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || '',
        code: plan.code || '',
        description: plan.description || '',
        plan_type: plan.plan_type || 'account',
        services: plan.services || [],
        features: plan.features || [],
        base_price: plan.base_price || 0,
        billing_period: plan.billing_period || 'monthly',
        max_users: plan.max_users || 5,
        max_locations: plan.max_locations || 1,
        ui_order: plan.ui_order || 0,
        is_active: plan.is_active !== undefined ? plan.is_active : true
      });
    }
  }, [plan]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleServicesChange = (e) => {
    const options = [...e.target.selectedOptions];
    const values = options.map(option => parseInt(option.value));
    setFormData(prev => ({
      ...prev,
      services: values
    }));
  };

  const handleFeaturesChange = (e) => {
    const options = [...e.target.selectedOptions];
    const values = options.map(option => parseInt(option.value));
    setFormData(prev => ({
      ...prev,
      features: values
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            {plan ? t('plans.editPlan') : t('plans.newPlan')}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>{t('plans.name')}</Form.Label>
            <Form.Control
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>{t('plans.code')}</Form.Label>
            <Form.Control
              name="code"
              type="text"
              value={formData.code}
              onChange={handleChange}
              required
            />
            <Form.Text className="text-muted">
              {t('plans.codeHelp')}
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>{t('plans.description')}</Form.Label>
            <Form.Control
              name="description"
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>{t('plans.planType')}</Form.Label>
            <Form.Select 
              name="plan_type"
              value={formData.plan_type}
              onChange={handleChange}
              required
            >
              {PLAN_TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('plans.services')}</Form.Label>
                <Form.Select 
                  name="services"
                  multiple
                  value={formData.services}
                  onChange={handleServicesChange}
                  style={{ height: '150px' }}
                >
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  {t('plans.servicesHelp')}
                </Form.Text>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('plans.additionalFeatures')}</Form.Label>
                <Form.Select 
                  name="features"
                  multiple
                  value={formData.features}
                  onChange={handleFeaturesChange}
                  style={{ height: '150px' }}
                >
                  {features.map((feature) => (
                    <option key={feature.id} value={feature.id}>
                      {feature.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  {t('plans.featuresHelp')}
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('plans.price')}</Form.Label>
                <Form.Control
                  name="base_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.base_price}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('plans.billingPeriod')}</Form.Label>
                <Form.Select 
                  name="billing_period"
                  value={formData.billing_period}
                  onChange={handleChange}
                  required
                >
                  {BILLING_PERIOD_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('plans.maxUsers')}</Form.Label>
                <Form.Control
                  name="max_users"
                  type="number"
                  min="1"
                  value={formData.max_users}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('plans.maxLocations')}</Form.Label>
                <Form.Control
                  name="max_locations"
                  type="number"
                  min="1"
                  value={formData.max_locations}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>{t('plans.uiOrder')}</Form.Label>
            <Form.Control
              name="ui_order"
              type="number"
              value={formData.ui_order}
              onChange={handleChange}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Check
              name="is_active"
              type="checkbox"
              id="is-active-checkbox"
              label={t('plans.active')}
              checked={formData.is_active}
              onChange={handleChange}
            />
          </Form.Group>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary">
            {t('common.save')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PlanForm;