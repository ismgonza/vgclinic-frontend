// src/components/platform/services/FeatureForm.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const FeatureForm = ({ show, feature, onSave, onClose }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: 'core',
    is_active: true,
    icon: '',
    ui_order: 0
  });

  const CATEGORY_OPTIONS = [
    { value: 'core', label: t('features.categories.core') },
    { value: 'analytics', label: t('features.categories.analytics') },
    { value: 'billing', label: t('features.categories.billing') },
    { value: 'appointments', label: t('features.categories.appointments') },
    { value: 'communications', label: t('features.categories.communications') }
  ];

  useEffect(() => {
    if (feature) {
      setFormData({
        name: feature.name || '',
        code: feature.code || '',
        description: feature.description || '',
        category: feature.category || 'core',
        is_active: feature.is_active !== undefined ? feature.is_active : true,
        icon: feature.icon || '',
        ui_order: feature.ui_order || 0
      });
    }
  }, [feature]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
            {feature ? t('features.editFeature') : t('features.newFeature')}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>{t('features.name')}</Form.Label>
            <Form.Control
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>{t('features.code')}</Form.Label>
            <Form.Control
              name="code"
              type="text"
              value={formData.code}
              onChange={handleChange}
              required
            />
            <Form.Text className="text-muted">
              {t('features.codeHelp')}
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>{t('features.description')}</Form.Label>
            <Form.Control
              name="description"
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>{t('features.category')}</Form.Label>
            <Form.Select 
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {CATEGORY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>{t('features.icon')}</Form.Label>
            <Form.Control
              name="icon"
              type="text"
              value={formData.icon}
              onChange={handleChange}
            />
            <Form.Text className="text-muted">
              {t('features.iconHelp')}
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>{t('features.uiOrder')}</Form.Label>
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
              label={t('features.active')}
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

export default FeatureForm;