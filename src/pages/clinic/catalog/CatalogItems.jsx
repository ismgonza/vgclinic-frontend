// src/pages/clinic/catalog/CatalogItems.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import catalogService from '../../../services/catalog.service';
import CatalogItemForm from '../../../components/clinic/catalog/CatalogItemForm';
import CatalogItemsList from '../../../components/clinic/catalog/CatalogItemsList';

const CatalogItems = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const specialtyId = queryParams.get('specialty');
  
  const [items, setItems] = useState([]);
  const [specialty, setSpecialty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, [specialtyId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch items (filtered by specialty if specialtyId is provided)
      const itemsData = await catalogService.getCatalogItems(specialtyId);
      setItems(itemsData);
      
      // If specialtyId is provided, fetch the specialty details
      if (specialtyId) {
        const specialtyData = await catalogService.getSpecialty(specialtyId);
        setSpecialty(specialtyData);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching catalog items:', err);
      setError(t('common.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setCurrentItem(null);
    setShowForm(true);
  };

  const handleEditClick = (item) => {
    setCurrentItem(item);
    setShowForm(true);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await catalogService.deleteCatalogItem(itemToDelete.id);
      setItems(items.filter(i => i.id !== itemToDelete.id));
      setShowDeleteModal(false);
      setItemToDelete(null);
      setSuccessMessage(t('catalog.itemDeleted'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting catalog item:', err);
      setError(t('common.errorDeleting'));
    }
  };

  const handleFormSave = async (formData) => {
    try {
      if (currentItem) {
        await catalogService.updateCatalogItem(currentItem.id, formData);
      } else {
        await catalogService.createCatalogItem(formData);
      }
      
      await fetchData();
      setShowForm(false);
      setSuccessMessage(currentItem 
        ? t('catalog.itemUpdated') 
        : t('catalog.itemCreated'));
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
          <CatalogItemForm 
            item={currentItem} 
            onSave={handleFormSave}
            onCancel={handleFormCancel}
            specialtyId={specialtyId}
          />
        </div>
      ) : (
        <>
          <Row className="mb-4">
            <Col>
              <h1 className="h3">
                {specialty 
                  ? `${t('catalog.itemsTitle')} - ${specialty.name}`
                  : t('catalog.itemsTitle')
                }
              </h1>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/clinic/catalog">{t('catalog.title')}</Link>
                  </li>
                  {specialty && (
                    <li className="breadcrumb-item">
                      <Link to="/clinic/catalog/specialties">{t('catalog.specialtiesTitle')}</Link>
                    </li>
                  )}
                  <li className="breadcrumb-item active" aria-current="page">
                    {specialty 
                      ? specialty.name
                      : t('catalog.itemsTitle')
                    }
                  </li>
                </ol>
              </nav>
              <p className="text-muted">{t('catalog.itemsDescription')}</p>
            </Col>
            <Col xs="auto">
              {specialty && (
                <Button 
                  variant="outline-secondary" 
                  className="me-2"
                  as={Link}
                  to="/clinic/catalog/specialties"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                  {t('catalog.back')}
                </Button>
              )}
              <Button variant="primary" onClick={handleAddClick}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                {t('catalog.addItem')}
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
                <span>{t('catalog.itemsTitle')}</span>
              </div>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" variant="primary" />
                  <p className="mt-3">{t('common.loading')}...</p>
                </div>
              ) : (
                <CatalogItemsList
                  items={items}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              )}
            </Card.Body>
          </Card>
          
          {/* Delete Confirmation Modal */}
          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>{t('catalog.deleteItem')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {t('catalog.confirmDelete')}
              {itemToDelete && (
                <p className="mt-2 fw-bold">{itemToDelete.name}</p>
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

export default CatalogItems;