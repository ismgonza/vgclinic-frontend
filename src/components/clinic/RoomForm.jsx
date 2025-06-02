import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const RoomForm = ({ show, room, branchId, onSave, onClose }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    is_active: true,
    is_private: false,
    branch: branchId || ''
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name || '',
        is_active: room.is_active !== undefined ? room.is_active : true,
        is_private: room.is_private || false,
        branch: room.branch || branchId || ''
      });
    } else {
      setFormData(prev => ({
        ...prev,
        branch: branchId || ''
      }));
    }
  }, [room, branchId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = t('validation.required');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setError(null);
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || t('common.errorSaving'));
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            {room ? t('rooms.editRoom') : t('rooms.newRoom')}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form.Group className="mb-3">
            <Form.Label>{t('rooms.roomName')}</Form.Label>
            <Form.Control
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              isInvalid={!!errors.name}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Check
              name="is_active"
              type="checkbox"
              id="is-active-checkbox"
              label={t('common.active')}
              checked={formData.is_active}
              onChange={handleChange}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Check
              name="is_private"
              type="checkbox"
              id="is-private-checkbox"
              label={t('common.private')}
              checked={formData.is_private}
              onChange={handleChange}
            />
            <Form.Text className="text-muted">
              {t('rooms.privateHelp')}
            </Form.Text>
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

export default RoomForm;