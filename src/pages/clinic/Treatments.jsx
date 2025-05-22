// src/pages/clinic/Treatments.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import treatmentsService from '../../services/treatments.service';
import TreatmentFilters from '../../components/clinic/TreatmentFilters';
import TreatmentsList from '../../components/clinic/TreatmentsList';

const Treatments = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  
  // State
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Filters state (we'll expand this in the next step)
  const [filters, setFilters] = useState({
    patient: '',
    status: [],
    doctor: [],
    branch: '',
    date_from: '',
    date_to: ''
  });

  // Parse URL parameters for filters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const newFilters = { ...filters };
    
    // Parse URL parameters
    if (urlParams.get('patient')) newFilters.patient = urlParams.get('patient');
    if (urlParams.get('status')) newFilters.status = urlParams.get('status').split(',');
    if (urlParams.get('doctor')) newFilters.doctor = urlParams.get('doctor').split(',');
    if (urlParams.get('branch')) newFilters.branch = urlParams.get('branch');
    if (urlParams.get('date_from')) newFilters.date_from = urlParams.get('date_from');
    if (urlParams.get('date_to')) newFilters.date_to = urlParams.get('date_to');
    
    setFilters(newFilters);
  }, [location.search]);

  // Fetch treatments
  useEffect(() => {
    fetchTreatments();
  }, [filters]);

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare API parameters
      const params = {};
      if (filters.patient) params.patient = filters.patient;
      if (filters.status.length > 0) params.status = filters.status.join(',');
      if (filters.doctor.length > 0) params.doctor = filters.doctor.join(',');
      if (filters.branch) params.branch = filters.branch;
      if (filters.date_from) params.start_date = filters.date_from;
      if (filters.date_to) params.end_date = filters.date_to;
      
      const data = await treatmentsService.getTreatments(params);
      setTreatments(data.results || data);
    } catch (err) {
      console.error('Error fetching treatments:', err);
      setError(t('treatments.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleNewTreatment = () => {
    // We'll implement this later
    navigate('/clinic/treatments/new');
  };

  const handleFiltersChange = (newFilters) => {
    // Update URL with new filters
    const params = new URLSearchParams();
    
    if (newFilters.patient) params.set('patient', newFilters.patient);
    if (newFilters.status && newFilters.status.length > 0) params.set('status', newFilters.status.join(','));
    if (newFilters.doctor && newFilters.doctor.length > 0) params.set('doctor', newFilters.doctor.join(','));
    if (newFilters.branch) params.set('branch', newFilters.branch);
    if (newFilters.date_from) params.set('date_from', newFilters.date_from);
    if (newFilters.date_to) params.set('date_to', newFilters.date_to);
    
    // Update URL without causing page reload
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', newUrl);
    
    // Update filters state
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      patient: '',
      status: [],
      doctor: [],
      branch: '',
      date_from: '',
      date_to: ''
    };
    
    // Clear URL parameters
    window.history.pushState({}, '', window.location.pathname);
    
    // Update filters state
    setFilters(clearedFilters);
  };

  const handleStatusChange = async (treatmentId, newStatus) => {
    try {
      await treatmentsService.updateTreatmentStatus(treatmentId, newStatus);
      
      // Update local state
      setTreatments(treatments.map(treatment => 
        treatment.id === treatmentId 
          ? { ...treatment, status: newStatus }
          : treatment
      ));
      
      setSuccessMessage(t('treatments.messages.statusUpdated'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating treatment status:', err);
      setError(t('treatments.errorUpdatingStatus'));
    }
  };

  const handleViewTreatment = (treatment) => {
    navigate(`/clinic/treatments/${treatment.id}`);
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="h3">{t('treatments.title')}</h1>
          <p className="text-muted">{t('treatments.description')}</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={handleNewTreatment}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            {t('treatments.newTreatment')}
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

      {/* Filters Section */}
      <Card className="mb-4">
        <Card.Header>
          <h6 className="mb-0">{t('treatments.searchFilters')}</h6>
        </Card.Header>
        <Card.Body>
          <TreatmentFilters 
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
        </Card.Body>
      </Card>

      {/* Treatments Table */}
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <span>{t('treatments.treatmentsList')}</span>
            <small className="text-muted">
              {loading ? t('common.loading') : `${treatments.length} ${t('treatments.totalTreatments')}`}
            </small>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <TreatmentsList
            treatments={treatments}
            onStatusChange={handleStatusChange}
            onViewTreatment={handleViewTreatment}
            loading={loading}
          />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Treatments;