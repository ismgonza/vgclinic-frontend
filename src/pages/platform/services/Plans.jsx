// src/pages/platform/services/Plans.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import plansService from '../../../services/plans.service';

const Plans = () => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await plansService.getPlans();
      setPlans(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError(t('common.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
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
      
      await fetchPlans();
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
            {t('plans.back')}
          </Button>
          <Card>
            <Card.Header>
              {currentPlan ? t('plans.editPlan') : t('plans.newPlan')}
            </Card.Header>
            <Card.Body>
              {/* This would be your PlanForm component - for now we're just showing a placeholder */}
              <p>Plan form will go here</p>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={handleFormCancel}>
                  {t('common.cancel')}
                </Button>
                <Button variant="primary" onClick={() => handleFormSave({name: 'Sample Plan', code: 'sample_plan'})}>
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
              ) : plans.length === 0 ? (
                <Alert variant="info">{t('plans.noPlans')}</Alert>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>{t('plans.name')}</th>
                      <th>{t('plans.code')}</th>
                      <th>{t('plans.planType')}</th>
                      <th>{t('plans.price')}</th>
                      <th>{t('plans.billingPeriod')}</th>
                      <th>{t('plans.status')}</th>
                      <th>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map(plan => (
                      <tr key={plan.id}>
                        <td>{plan.name}</td>
                        <td>{plan.code}</td>
                        <td>{t(`plans.planTypes.${plan.plan_type}`)}</td>
                        <td>${plan.base_price}</td>
                        <td>{t(`plans.billingPeriods.${plan.billing_period}`)}</td>
                        <td>
                          <Badge bg={plan.is_active ? 'success' : 'secondary'}>
                            {plan.is_active ? t('common.active') : t('common.inactive')}
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            className="me-1"
                            title={t('common.edit')}
                            onClick={() => handleEditClick(plan)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            title={t('common.delete')}
                            onClick={() => handleDeleteClick(plan)}
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
              <Modal.Title>{t('plans.delete')}</Modal.Title>
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
        </>
      )}
    </Container>
  );
};

export default Plans;