// src/pages/clinic/catalog/Specialties.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import catalogService from '../../../services/catalog.service';
import SpecialtyForm from '../../../components/clinic/catalog/SpecialtyForm';
import SpecialtiesList from '../../../components/clinic/catalog/SpecialtiesList';

const Specialties = () => {
  const { t } = useTranslation();
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentSpecialty, setCurrentSpecialty] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [specialtyToDelete, setSpecialtyToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      setLoading(true);
      const data = await catalogService.getSpecialties();
      setSpecialties(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching specialties:', err);
      setError(t('common.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setCurrentSpecialty(null);
    setShowForm(true);
  };

  const handleEditClick = (specialty) => {
    setCurrentSpecialty(specialty);
    setShowForm(true);
  };

  const handleDeleteClick = (specialty) => {
    setSpecialtyToDelete(specialty);
    setShowDeleteModal(true);
  };

  const handleManageItemsClick = (specialty) => {
    // Navigate to catalog items page with specialty filter
    window.location.href = `/clinic/catalog/items?specialty=${specialty.id}`;
  };

  const handleDeleteConfirm = async () => {
    try {
      await catalogService.deleteSpecialty(specialtyToDelete.id);
      setSpecialties(specialties.filter(s => s.id !== specialtyToDelete.id));
      setShowDeleteModal(false);
      setSpecialtyToDelete(null);
      setSuccessMessage(t('catalog.specialtyDeleted'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting specialty:', err);
      setError(t('common.errorDeleting'));
    }
  };

  const handleFormSave = async (formData) => {
    try {
      if (currentSpecialty) {
        await catalogService.updateSpecialty(currentSpecialty.id, formData);
      } else {
        await catalogService.createSpecialty(formData);
      }
      
      await fetchSpecialties();
      setShowForm(false);
      setSuccessMessage(currentSpecialty 
        ? t('catalog.specialtyUpdated') 
        : t('catalog.specialtyCreated'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      throw err;
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
            {t('catalog.back')}
          </Button>
          <SpecialtyForm 
            specialty={currentSpecialty} 
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <>
          <Row className="mb-4">
            <Col>
              <h1 className="h3">{t('catalog.specialtiesTitle')}</h1>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/clinic/catalog">{t('catalog.title')}</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    {t('catalog.specialtiesTitle')}
                  </li>
                </ol>
              </nav>
              <p className="text-muted">{t('catalog.specialtiesDescription')}</p>
            </Col>
            <Col xs="auto">
              <Button variant="primary" onClick={handleAddClick}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                {t('catalog.addSpecialty')}
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
                <span>{t('catalog.specialtiesTitle')}</span>
              </div>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" variant="primary" />
                  <p className="mt-3">{t('common.loading')}...</p>
                </div>
              ) : (
                <SpecialtiesList
                  specialties={specialties}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onManageItems={handleManageItemsClick}
                />
              )}
            </Card.Body>
          </Card>
          
          {/* Delete Confirmation Modal */}
          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>{t('catalog.deleteSpecialty')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {t('catalog.confirmDelete')}
              {specialtyToDelete && (
                <p className="mt-2 fw-bold">{specialtyToDelete.name}</p>
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

export default Specialties;