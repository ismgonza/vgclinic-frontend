// src/pages/clinic/Patients.jsx - FIXED with proper permission enforcement
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faEye, faUserInjured } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { AccountContext } from '../../contexts/AccountContext';
import { usePermissions } from '../../hooks/usePermissions';
import patientsService from '../../services/patients.service';
import PatientForm from '../../components/clinic/PatientForm';
import PermissionGuard from '../../components/PermissionGuard';

const Patients = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { selectedAccount } = useContext(AccountContext);
  
  // ADDED: Permission hooks
  const { 
    canViewPatientsList,
    canViewPatientsDetail,
    canManagePatientsBasic,
    loading: permissionsLoading 
  } = usePermissions();
  
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
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
      if (err.response?.status === 403) {
        setError(t('permissions.insufficientPermissions') || 'Access denied. You need "view_patients_list" permission to view patients.');
      } else {
        setError(t('patients.errorLoading'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    if (!selectedAccount) {
      setError(t('patients.selectAccountFirst') || 'Please select a clinic first');
      return;
    }
    
    // ADDED: Permission check before allowing create
    if (!canManagePatientsBasic()) {
      setError(t('permissions.insufficientPermissions') || 'Access denied. You need "manage_patients_basic" permission to create patients.');
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
    
    // ADDED: Permission check before allowing edit
    if (!canManagePatientsBasic()) {
      setError(t('permissions.insufficientPermissions') || 'Access denied. You need "manage_patients_basic" permission to edit patients.');
      return;
    }
    
    setCurrentPatient(patient);
    setShowForm(true);
  };

  const handleViewClick = (patient) => {
    navigate(`/clinic/patients/${patient.id}`);
  };

  // REMOVED: All delete functionality as requested

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
      if (err.response?.status === 403) {
        setError(t('permissions.insufficientPermissions') || 'Access denied');
      } else {
        setError(t('patients.errorSaving'));
      }
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

  // Show loading while permissions are being checked
  if (permissionsLoading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary" />
          <p className="mt-3">{t('common.loading')}...</p>
        </div>
      </Container>
    );
  }

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

  // ADDED: Permission guard for the entire patients section
  if (!canViewPatientsList()) {
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
              <p>{t('patients.permissions.noAccess')}</p>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }
  
  return (
    <Container fluid className="py-4">
        {/* If the form is shown, render it with permission guard */}
        {showForm && (
          <PermissionGuard 
            permission="manage_patients_basic"
            fallback={
              <Alert variant="danger">
                <p>{t('permissions.insufficientPermissions')}</p>
                <Button variant="outline-primary" onClick={handleFormCancel}>
                  {t('common.back')}
                </Button>
              </Alert>
            }
          >
            <Button 
              variant="outline-secondary" 
              className="mb-3"
              onClick={handleFormCancel}
            >
              {t('common.back')}
            </Button>
            
            <PatientForm
              patient={currentPatient}
              onSave={handleFormSave}
              onCancel={handleFormCancel}
            />
          </PermissionGuard>
        )}

        {/* Otherwise, show the patients list */}
        {!showForm && (
          <>
            <Row className="mb-4">
              <Col>
                <h1 className="h3">{t('patients.title')}</h1>
                <p className="text-muted">{t('patients.description')}</p>
                {/* <small className="text-muted">
                  {t('patients.currentClinic')}: <strong>{selectedAccount.account_name}</strong>
                </small> */}
              </Col>
              <Col xs="auto">
                {/* ADDED: Permission guard for Add Patient button */}
                <PermissionGuard permission="manage_patients_basic">
                  <Button variant="primary" onClick={handleAddClick}>
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    {t('patients.newPatient')}
                  </Button>
                </PermissionGuard>
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
                        <th>{t('common.name')}</th>
                        <th>{t('patients.idNumber')}</th>
                        <th>{t('patients.gender')}</th>
                        <th>{t('patients.birthDate')}</th>
                        <th>{t('common.email')}</th>
                        <th>{t('locations.province')}</th>
                        {(canViewPatientsDetail() || canManagePatientsBasic()) && (
                          <th>{t('common.actions')}</th>
                        )}
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
                            {(canViewPatientsDetail() || canManagePatientsBasic()) ? (
                              <>
                                {canViewPatientsDetail() && (
                                  <Button 
                                    variant="outline-info" 
                                    size="sm" 
                                    className="me-1"
                                    title={t('common.view')}
                                    onClick={() => handleViewClick(patient)}
                                  >
                                    <FontAwesomeIcon icon={faEye} />
                                  </Button>
                                )}
                                
                                {canManagePatientsBasic() && (
                                  <Button 
                                    variant="outline-secondary" 
                                    size="sm" 
                                    className="me-1"
                                    title={t('common.edit')}
                                    onClick={() => handleEditClick(patient)}
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </Button>
                                )}
                              </>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </>
        )}
      </Container>
    // </PermissionGuard>
  );
};

export default Patients;