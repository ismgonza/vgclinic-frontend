// src/pages/platform/services/ServicesList.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import servicesService from '../../../services/services.service';
import featuresService from '../../../services/features.service';
import ServiceForm from '../../../components/platform/services/ServiceForm';
import ServicesTable from '../../../components/platform/services/ServicesTable';

const ServicesList = () => {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [servicesData, featuresData] = await Promise.all([
        servicesService.getServices(),
        featuresService.getFeatures()
      ]);
      setServices(servicesData);
      setFeatures(featuresData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(t('common.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClick = () => {
    setCurrentService(null);
    setShowForm(true);
  };

  const handleEditClick = (service) => {
    setCurrentService(service);
    setShowForm(true);
  };

  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await servicesService.deleteService(serviceToDelete.id);
      setServices(services.filter(s => s.id !== serviceToDelete.id));
      setShowDeleteModal(false);
      setServiceToDelete(null);
      setSuccessMessage(t('services.serviceDeleted'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting service:', err);
      setError(t('common.errorDeleting'));
    }
  };

  const handleFormSave = async (serviceData) => {
    try {
      if (currentService) {
        // Update existing service
        await servicesService.updateService(currentService.id, serviceData);
      } else {
        // Create new service
        await servicesService.createService(serviceData);
      }
      
      await fetchData();
      setShowForm(false);
      setSuccessMessage(currentService 
        ? t('services.serviceUpdated') 
        : t('services.serviceCreated'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving service:', err);
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
          <h1 className="h3">{t('services.servicesTitle')}</h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/platform/services">{t('services.title')}</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {t('services.servicesTitle')}
              </li>
            </ol>
          </nav>
          <p className="text-muted">{t('services.serviceDescription')}</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={handleAddClick}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            {t('services.addService')}
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
            <span>{t('services.servicesTitle')}</span>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary" />
              <p className="mt-3">{t('common.loading')}...</p>
            </div>
          ) : (
            <ServicesTable 
              services={services} 
              onEdit={handleEditClick} 
              onDelete={handleDeleteClick}
            />
          )}
        </Card.Body>
      </Card>
      
      {/* Service Form Modal */}
      <ServiceForm
        show={showForm}
        service={currentService}
        features={features}
        onSave={handleFormSave}
        onClose={handleFormClose}
      />
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('common.delete')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('services.confirmDelete')}
          {serviceToDelete && (
            <p className="mt-2 fw-bold">{serviceToDelete.name}</p>
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

export default ServicesList;