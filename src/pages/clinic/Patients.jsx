// src/pages/clinic/Patients.jsx - Updated version
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faEye, faUserInjured, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { AccountContext } from '../../contexts/AccountContext';
import patientsService from '../../services/patients.service';
import PatientForm from '../../components/clinic/PatientForm';

const Patients = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { selectedAccount } = useContext(AccountContext);
  
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Reload patients when account changes
  useEffect(() => {
    if (selectedAccount) {
      fetchPatients();
    } else {
      // Clear patients if no account selected
      setPatients([]);
      setLoading(false);
    }
  }, [selectedAccount]);

  useEffect(() => {
    if (location.state?.editMode && location.state?.editPatient) {
      setCurrentPatient(location.state.editPatient);
      setShowForm(true);
      navigate('/clinic/patients', { replace: true });
    }
  }, [location.state]);

  const fetchPatients = async () => {
    if (!selectedAccount) return;
    
    try {
      setLoading(true);
      
      // Set account context for API calls
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      const data = await patientsService.getPatients({}, accountHeaders);
      setPatients(data.results || data);
      setError(null);
      
      console.log('Loaded patients for account:', selectedAccount.account_name);
      console.log('Patients count:', (data.results || data).length);
      
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(t('patients.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    if (!selectedAccount) {
      setError(t('patients.selectAccountFirst') || 'Please select a clinic first');
      return;
    }
    setCurrentPatient(null);
    setShowForm(true);
  };

  const handleEditClick = (patient) => {
    if (!selectedAccount) {
      setError(t('patients.selectAccountFirst') || 'Please select a clinic first');
      return;
    }
    setCurrentPatient(patient);
    setShowForm(true);
  };

  const handleViewClick = (patient) => {
    navigate(`/clinic/patients/${patient.id}`);
  };

  const handleDeleteClick = (patient) => {
    if (!selectedAccount) {
      setError(t('patients.selectAccountFirst') || 'Please select a clinic first');
      return;
    }
    setPatientToDelete(patient);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAccount) return;
    
    try {
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      await patientsService.deletePatient(patientToDelete.id, accountHeaders);
      setPatients(patients.filter(p => p.id !== patientToDelete.id));
      setShowDeleteModal(false);
      setPatientToDelete(null);
      setSuccessMessage(t('patients.deleteSuccess'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting patient:', err);
      setError(t('patients.errorDeleting'));
    }
  };

  const handleFormSave = async (patientData) => {
    if (!selectedAccount) {
      throw new Error(t('patients.selectAccountFirst') || 'Please select a clinic first');
    }
    
    try {
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      if (currentPatient) {
        // Update patient
        await patientsService.updatePatient(currentPatient.id, patientData, accountHeaders);
        setSuccessMessage(t('patients.updateSuccess'));
      } else {
        // Create new patient
        await patientsService.createPatient(patientData, accountHeaders);
        setSuccessMessage(t('patients.createSuccess'));
      }
      
      // Refresh patients list
      await fetchPatients();
      setShowForm(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving patient:', err);
      setError(t('patients.errorSaving'));
      throw err; // Re-throw to let the form component handle it
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setCurrentPatient(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Show message if no account selected
  if (!selectedAccount) {
    return (
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <h1 className="h3">{t('patients.title')}</h1>
            <p className="text-muted">{t('patients.description')}</p>
          </Col>
        </Row>
        
        <Card>
          <Card.Body>
            <div className="text-center py-4 text-muted">
              <FontAwesomeIcon icon={faUserInjured} size="3x" className="mb-3" />
              <p>{t('patients.selectAccountFirst') || 'Please select a clinic first to view patients'}</p>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // If the form is shown, render it
  if (showForm) {
    return (
      <Container fluid className="py-4">
        <Button 
          variant="outline-secondary" 
          className="mb-3"
          onClick={handleFormCancel}
        >
          {t('patients.back')}
        </Button>
        
        <PatientForm
          patient={currentPatient}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      </Container>
    );
  }

  // Otherwise, show the patients list
  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="h3">{t('patients.title')}</h1>
          <p className="text-muted">{t('patients.description')}</p>
          <small className="text-muted">
            {t('patients.currentClinic')}: <strong>{selectedAccount.account_name}</strong>
          </small>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={handleAddClick}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            {t('patients.newPatient')}
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
            <span>{t('patients.patientsList')}</span>
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
          ) : patients.length === 0 ? (
            <Alert variant="info">{t('patients.noPatients')}</Alert>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>{t('patients.name')}</th>
                  <th>{t('patients.idNumber')}</th>
                  <th>{t('patients.gender')}</th>
                  <th>{t('patients.birthDate')}</th>
                  <th>{t('patients.email')}</th>
                  <th>{t('patients.province')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(patient => (
                  <tr key={patient.id}>
                    <td>{patient.full_name || `${patient.first_name} ${patient.last_name1} ${patient.last_name2}`}</td>
                    <td>
                      <Badge bg={patient.is_foreign ? "warning" : "info"}>
                        {patient.id_number}
                      </Badge>
                    </td>
                    <td>{patient.gender === 'M' ? t('patients.male') : 
                         patient.gender === 'F' ? t('patients.female') : 
                         t('patients.other')}</td>
                    <td>{formatDate(patient.birth_date)}</td>
                    <td>
                      {patient.email && (
                        <a href={`mailto:${patient.email}`} className="text-decoration-none">
                          {patient.email}
                        </a>
                      )}
                    </td>
                    <td>{patient.province}</td>
                    <td>
                      <Button 
                        variant="outline-info" 
                        size="sm" 
                        className="me-1"
                        title={t('common.view')}
                        onClick={() => handleViewClick(patient)}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        className="me-1"
                        title={t('common.edit')}
                        onClick={() => handleEditClick(patient)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        title={t('common.delete')}
                        onClick={() => handleDeleteClick(patient)}
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
          <Modal.Title>{t('patients.delete')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('patients.confirmDelete')}
          {patientToDelete && (
            <p className="mt-2 fw-bold">{patientToDelete.full_name || `${patientToDelete.first_name} ${patientToDelete.last_name1} ${patientToDelete.last_name2}`}</p>
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

export default Patients;