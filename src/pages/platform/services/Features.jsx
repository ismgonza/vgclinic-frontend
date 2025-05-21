// src/pages/platform/services/Features.jsx - Update to use the FeatureForm component
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import featuresService from '../../../services/features.service';
import FeatureForm from '../../../components/platform/services/FeatureForm';
import FeaturesList from '../../../components/platform/services/FeaturesList';

const Features = () => {
  const { t } = useTranslation();
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [featureToDelete, setFeatureToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const data = await featuresService.getFeatures();
      setFeatures(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching features:', err);
      setError(t('common.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleAddClick = () => {
    setCurrentFeature(null);
    setShowForm(true);
  };

  const handleEditClick = (feature) => {
    setCurrentFeature(feature);
    setShowForm(true);
  };

  const handleDeleteClick = (feature) => {
    setFeatureToDelete(feature);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await featuresService.deleteFeature(featureToDelete.id);
      setFeatures(features.filter(f => f.id !== featureToDelete.id));
      setShowDeleteModal(false);
      setFeatureToDelete(null);
      setSuccessMessage(t('features.featureDeleted'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting feature:', err);
      setError(t('common.errorDeleting'));
    }
  };

  const handleFormSave = async (featureData) => {
    try {
      if (currentFeature) {
        // Update existing feature
        await featuresService.updateFeature(currentFeature.id, featureData);
      } else {
        // Create new feature
        await featuresService.createFeature(featureData);
      }
      
      await fetchFeatures();
      setShowForm(false);
      setSuccessMessage(currentFeature 
        ? t('features.featureUpdated') 
        : t('features.featureCreated'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving feature:', err);
      setError(t('common.errorSaving'));
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="h3">{t('features.title')}</h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/platform/services">{t('services.title')}</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {t('features.title')}
              </li>
            </ol>
          </nav>
          <p className="text-muted">{t('features.description')}</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={handleAddClick}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            {t('features.addFeature')}
          </Button>
        </Col>
      </Row>

      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <span>{t('features.title')}</span>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary" />
              <p className="mt-3">{t('common.loading')}...</p>
            </div>
          ) : (
            <FeaturesList 
              features={features} 
              onEdit={handleEditClick} 
              onDelete={handleDeleteClick}
            />
          )}
        </Card.Body>
      </Card>
      
      {/* Feature Form Modal */}
      <FeatureForm
        show={showForm}
        feature={currentFeature}
        onSave={handleFormSave}
        onClose={handleFormClose}
      />
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('common.delete')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('features.confirmDelete')}
          {featureToDelete && (
            <p className="mt-2 fw-bold">{featureToDelete.name}</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            {t('common.confirm')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Features;