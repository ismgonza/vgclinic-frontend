// src/pages/platform/services/ServicesList.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import servicesService from '../../../services/services.service';

const ServicesList = () => {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await servicesService.getServices();
      setServices(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(t('common.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
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
      
      await fetchServices();
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

  const handleFormCancel = () => {
    setShowForm(false);
  };

  return (
    <Container fluid className="py-4">
      {showForm ? (
        <div>
          <Button 
            variant="outline-secondary" 
            className="mb-3"
            onClick={handleFormCancel}
          >
            {t('services.back')}
          </Button>
          <Card>
            <Card.Header>
              {currentService ? t('services.editService') : t('services.newService')}
            </Card.Header>
            <Card.Body>
              {/* This would be your ServiceForm component - for now we're just showing a placeholder */}
              <p>Service form will go here</p>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={handleFormCancel}>
                  {t('common.cancel')}
                </Button>
                <Button variant="primary" onClick={() => handleFormSave({name: 'Sample Service', code: 'sample_service'})}>
                  {t('common.save')}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      ) : (
        <>
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
                <div>
                  {/* Add filter/search controls here in the future */}
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" variant="primary" />
                  <p className="mt-3">{t('common.loading')}...</p>
                </div>
              ) : services.length === 0 ? (
                <Alert variant="info">{t('services.noServices')}</Alert>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>{t('services.name')}</th>
                      <th>{t('services.code')}</th>
                      <th>{t('services.features')}</th>
                      <th>{t('services.status')}</th>
                      <th>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map(service => (
                      <tr key={service.id}>
                        <td>{service.name}</td>
                        <td>{service.code}</td>
                        <td>
                          {service.features_list && service.features_list.map(feature => (
                            <span 
                              key={feature.id}
                              className="badge bg-secondary me-1 mb-1"
                            >
                              {feature.name}
                            </span>
                          ))}
                        </td>
                        <td>
                          <Badge bg={service.is_active ? 'success' : 'secondary'}>
                            {service.is_active ? t('common.active') : t('common.inactive')}
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            className="me-1"
                            title={t('common.edit')}
                            onClick={() => handleEditClick(service)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            title={t('common.delete')}
                            onClick={() => handleDeleteClick(service)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
          
          {/* Delete Confirmation Modal */}
          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>{t('services.delete')}</Modal.Title>
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
        </>
      )}
    </Container>
  );
};

export default ServicesList;