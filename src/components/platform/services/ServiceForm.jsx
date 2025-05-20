// src/components/platform/services/ServiceForm.jsx - Form for creating/editing services

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const ServiceForm = ({ show, service, features, onSave, onClose }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    features: [],
    is_active: true,
    icon: '',
    ui_order: 0
  });

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        code: service.code || '',
        description: service.description || '',
        features: service.features || [],
        is_active: service.is_active !== undefined ? service.is_active : true,
        icon: service.icon || '',
        ui_order: service.ui_order || 0
      });
    }
  }, [service]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
            {service ? t('services.editService') : t('services.newService')}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>{t('services.name')}</Form.Label>
            <Form.Control
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>{t('services.code')}</Form.Label>
            <Form.Control
              name="code"
              type="text"
              value={formData.code}
              onChange={handleChange}
              required
            />
            <Form.Text className="text-muted">
              {t('services.codeHelp')}
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>{t('services.description')}</Form.Label>
            <Form.Control
              name="description"
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>{t('services.features')}</Form.Label>
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
              {t('services.featuresHelp')}
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>{t('services.icon')}</Form.Label>
            <Form.Control
              name="icon"
              type="text"
              value={formData.icon}
              onChange={handleChange}
            />
            <Form.Text className="text-muted">
              {t('services.iconHelp')}
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>{t('services.uiOrder')}</Form.Label>
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
              label={t('services.active')}
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

export default ServiceForm;