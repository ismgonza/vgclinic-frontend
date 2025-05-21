// src/pages/platform/services/Plans.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import plansService from '../../../services/plans.service';
import servicesService from '../../../services/services.service';
import featuresService from '../../../services/features.service';
import PlanForm from '../../../components/platform/services/PlanForm';
import PlansList from '../../../components/platform/services/PlansList';

const Plans = () => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState([]);
  const [services, setServices] = useState([]);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansData, servicesData, featuresData] = await Promise.all([
        plansService.getPlans(),
        servicesService.getServices(),
        featuresService.getFeatures()
      ]);
      setPlans(plansData);
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
    setCurrentPlan(null);
    setShowForm(true);
  };

  const handleEditClick = (plan) => {
    setCurrentPlan(plan);
    setShowForm(true);
  };

  const handleDeleteClick = (plan) => {
    setPlanToDelete(plan);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await plansService.deletePlan(planToDelete.id);
      setPlans(plans.filter(p => p.id !== planToDelete.id));
      setShowDeleteModal(false);
      setPlanToDelete(null);
      setSuccessMessage(t('plans.planDeleted'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting plan:', err);
      setError(t('common.errorDeleting'));
    }
  };

  const handleFormSave = async (planData) => {
    try {
      if (currentPlan) {
        // Update existing plan
        await plansService.updatePlan(currentPlan.id, planData);
      } else {
        // Create new plan
        await plansService.createPlan(planData);
      }
      
      await fetchData();
      setShowForm(false);
      setSuccessMessage(currentPlan 
        ? t('plans.planUpdated') 
        : t('plans.planCreated'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving plan:', err);
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
          <h1 className="h3">{t('plans.title')}</h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/platform/services">{t('services.title')}</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {t('plans.title')}
              </li>
            </ol>
          </nav>
          <p className="text-muted">{t('plans.description')}</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={handleAddClick}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            {t('plans.addPlan')}
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
            <span>{t('plans.title')}</span>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary" />
              <p className="mt-3">{t('common.loading')}...</p>
            </div>
          ) : (
            <PlansList 
              plans={plans} 
              onEdit={handleEditClick} 
              onDelete={handleDeleteClick}
            />
          )}
        </Card.Body>
      </Card>
      
      {/* Plan Form Modal */}
      <PlanForm
        show={showForm}
        plan={currentPlan}
        services={services}
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
          {t('plans.confirmDelete')}
          {planToDelete && (
            <p className="mt-2 fw-bold">{planToDelete.name}</p>
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

export default Plans;