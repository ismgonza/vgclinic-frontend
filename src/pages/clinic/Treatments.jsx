// src/pages/clinic/Treatments.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { AccountContext } from '../../contexts/AccountContext';
import treatmentsService from '../../services/treatments.service';
import TreatmentFilters from '../../components/clinic/TreatmentFilters';
import TreatmentsList from '../../components/clinic/TreatmentsList';

const Treatments = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedAccount } = useContext(AccountContext);
  
  // State
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Filters state - Added specialty filter
  const [filters, setFilters] = useState({
    patient: '',
    specialty: [], // Added specialty filter
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
    
    // Parse URL parameters - Added specialty parsing
    if (urlParams.get('patient')) newFilters.patient = urlParams.get('patient');
    if (urlParams.get('specialty')) newFilters.specialty = urlParams.get('specialty').split(',');
    if (urlParams.get('status')) newFilters.status = urlParams.get('status').split(',');
    if (urlParams.get('doctor')) newFilters.doctor = urlParams.get('doctor').split(',');
    if (urlParams.get('branch')) newFilters.branch = urlParams.get('branch');
    if (urlParams.get('date_from')) newFilters.date_from = urlParams.get('date_from');
    if (urlParams.get('date_to')) newFilters.date_to = urlParams.get('date_to');
    
    setFilters(newFilters);
  }, [location.search]);

  useEffect(() => {
    if (selectedAccount) {
      console.log('Account changed, refetching treatments for:', selectedAccount.account_name);
      fetchTreatments();
    }
  }, [selectedAccount]);

  // Fetch treatments
  useEffect(() => {
    fetchTreatments();
  }, [filters]);

  const fetchTreatments = async () => {
    if (!selectedAccount) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Set account context for API calls
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      // Prepare API parameters - Added specialty parameter
      const params = {};
      if (filters.patient) params.patient = filters.patient;
      if (filters.specialty && filters.specialty.length > 0) params.specialty = filters.specialty.join(',');
      if (filters.status && filters.status.length > 0) params.status = filters.status.join(',');
      if (filters.doctor && filters.doctor.length > 0) params.doctor = filters.doctor.join(',');
      if (filters.branch) params.location = filters.branch; // NOTE: using 'location' instead of 'branch'
      if (filters.date_from) params.start_date = filters.date_from;
      if (filters.date_to) params.end_date = filters.date_to;
      
      console.log('Fetching treatments with params:', params);
      console.log('Account headers:', accountHeaders);
        
      const data = await treatmentsService.getTreatments(params, accountHeaders);
      setTreatments(data.results || data);
      
      console.log('Fetched treatments:', data.results?.length || data.length);
    } catch (err) {
      console.error('Error fetching treatments:', err);
      setError(t('treatments.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleNewTreatment = () => {
    navigate('/clinic/treatments/new');
  };

  const handleFiltersChange = (newFilters) => {
    console.log('Filters changed:', newFilters);
    
    // Update URL with new filters - Added specialty to URL params
    const params = new URLSearchParams();
    
    if (newFilters.patient) params.set('patient', newFilters.patient);
    if (newFilters.specialty && newFilters.specialty.length > 0) params.set('specialty', newFilters.specialty.join(','));
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
      specialty: [], // Added specialty to clear filters
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
    if (!selectedAccount) return;

    try {
      // Set account context for API calls
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      await treatmentsService.updateTreatmentStatus(treatmentId, newStatus, accountHeaders);
      
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

  // Show message if no account selected
  if (!selectedAccount) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-4 text-muted">
          <p>Please select a clinic first to view treatments</p>
        </div>
      </Container>
    );
  }

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