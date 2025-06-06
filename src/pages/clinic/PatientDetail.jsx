// src/pages/clinic/PatientDetail.jsx - CLEAN FIXED VERSION
import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Table, Tabs, Tab, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEdit, faPlus, faPhone, faEnvelope, faUser, faMapMarkerAlt, faClipboardList, faStethoscope, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccountContext } from '../../contexts/AccountContext';
import { usePermissions } from '../../hooks/usePermissions';
import patientsService from '../../services/patients.service';
import treatmentsService from '../../services/treatments.service';
import MedicalHistoryForm from '../../components/clinic/MedicalHistoryForm';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { selectedAccount } = useContext(AccountContext);
  
  // Permission hooks
  const { 
    canViewPatientsDetail,
    canViewPatientsHistory,
    canManagePatientsBasic,
    canManagePatientsHistory,
    canViewAnyTreatments,
    canCreateTreatments,
    loading: permissionsLoading
  } = usePermissions();
  
  const [patient, setPatient] = useState(null);
  const [medicalHistories, setMedicalHistories] = useState([]);
  const [patientTreatments, setPatientTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [treatmentsLoading, setTreatmentsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMedicalHistoryForm, setShowMedicalHistoryForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedMedicalHistory, setSelectedMedicalHistory] = useState(null);
  const [showMedicalHistoryDetails, setShowMedicalHistoryDetails] = useState(false);

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch patient details (basic info)
      const patientData = await patientsService.getPatient(id);
      setPatient(patientData);
      
      // Always try to fetch medical histories, let the backend decide permissions
      try {
        const medicalData = await patientsService.getPatientMedicalHistory(id);
        setMedicalHistories(medicalData);
      } catch (historyErr) {
        if (historyErr.response?.status === 403) {
          console.warn('User does not have permission to view medical history');
          setMedicalHistories([]);
        } else {
          console.error('Error fetching medical history:', historyErr);
          setMedicalHistories([]);
        }
      }
      
    } catch (err) {
      console.error('Error fetching patient data:', err);
      if (err.response?.status === 403) {
        setError(t('permissions.insufficientPermissions') || 'Access denied. You need proper permissions to view patient details.');
      } else {
        setError(t('patients.errorLoadingDetails'));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientTreatments = async () => {
    if (!selectedAccount || !patient) return;
    
    // Only fetch treatments if user has permission
    if (!canViewAnyTreatments()) {
      console.warn('User does not have permission to view treatments');
      setPatientTreatments([]);
      return;
    }
    
    try {
      setTreatmentsLoading(true);
      
      const headers = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      // Fetch treatments for this patient
      const params = { patient: patient.id };
      const treatmentsData = await treatmentsService.getTreatments(params, headers);
      setPatientTreatments(treatmentsData.results || treatmentsData);
      
    } catch (err) {
      console.error('Error fetching patient treatments:', err);
      if (err.response?.status === 403) {
        console.warn('User does not have permission to view treatments');
        setPatientTreatments([]);
      }
    } finally {
      setTreatmentsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/clinic/patients');
  };

  const handleEditPatient = () => {
    navigate('/clinic/patients', { 
      state: { 
        editPatient: patient,
        editMode: true 
      } 
    });
  };

  const handleAddMedicalHistory = () => {
    setShowMedicalHistoryForm(true);
  };

  const handleViewMedicalHistory = async (historyId) => {
    try {
      setLoading(true);
      const historyData = await patientsService.getMedicalHistory(historyId);
      setSelectedMedicalHistory(historyData);
      setShowMedicalHistoryDetails(true);
    } catch (err) {
      console.error('Error fetching medical history:', err);
      setError(t('patients.anamnesis.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleMedicalHistorySave = async (historyData) => {
    try {
      const payload = {
        ...historyData,
        patient_account: patient.clinic_memberships[0]?.id
      };
      
      await patientsService.addMedicalHistory(id, payload);
      setSuccessMessage(t('patients.anamnesis.addSuccess'));
      setShowMedicalHistoryForm(false);
      
      fetchPatientData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving medical history:', err);
      setError(t('patients.anamnesis.errorSaving'));
      throw err;
    }
  };

  const handleViewTreatment = (treatment) => {
    navigate(`/clinic/treatments/${treatment.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
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

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary" />
          <p className="mt-3">{t('common.loading')}...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          {error}
          <div className="mt-3">
            <Button variant="outline-primary" onClick={handleBack}>
              {t('common.back')}
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!patient) {
    return (
      <Container fluid className="py-4">
        <Alert variant="warning">
          {t('patients.patientNotFound')}
          <div className="mt-3">
            <Button variant="outline-primary" onClick={handleBack}>
              {t('common.back')}
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  // Check if user can view patient details
  if (!canViewPatientsDetail()) {
    return (
      <Container fluid className="py-4">
        <Card>
          <Card.Body>
            <div className="text-center py-4 text-muted">
              <p>You don't have access to view patient details.</p>
              <Button variant="outline-primary" onClick={handleBack}>
                {t('common.back')}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <Button variant="outline-secondary" onClick={handleBack} className="me-2">
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            {t('common.back')}
          </Button>
          
          {canManagePatientsBasic() && (
            <Button variant="outline-primary" onClick={handleEditPatient}>
              <FontAwesomeIcon icon={faEdit} className="me-2" />
              {t('patients.editPatient')}
            </Button>
          )}
        </Col>
      </Row>

      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
          {successMessage}
        </Alert>
      )}

      <Row className="mb-4">
        <Col lg={4}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faUser} className="me-2" />
                {patient.full_name || `${patient.first_name} ${patient.last_name1} ${patient.last_name2 || ''}`}
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col xs={4} className="fw-bold">{t('patients.idNumber')}</Col>
                <Col xs={8}>
                  <Badge bg={patient.is_foreign ? "warning" : "info"}>
                    {patient.id_number}
                  </Badge>
                  {patient.is_foreign && <span className="ms-2">{t('patients.foreign')}</span>}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col xs={4} className="fw-bold">{t('patients.gender')}</Col>
                <Col xs={8}>
                  {patient.gender === 'M' ? t('patients.male') : 
                   patient.gender === 'F' ? t('patients.female') : 
                   t('patients.other')}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col xs={4} className="fw-bold">{t('patients.birthDate')}</Col>
                <Col xs={8}>{formatDate(patient.birth_date)}</Col>
              </Row>
              <Row className="mb-3">
                <Col xs={4} className="fw-bold">{t('patients.maritalStatus')}</Col>
                <Col xs={8}>
                  {patient.marital_status === 'S' ? t('patients.single') :
                   patient.marital_status === 'M' ? t('patients.married') :
                   patient.marital_status === 'D' ? t('patients.divorced') :
                   patient.marital_status === 'W' ? t('patients.widowed') : ''}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col xs={4} className="fw-bold">{t('common.email')}</Col>
                <Col xs={8}>
                  {patient.email ? (
                    <a href={`mailto:${patient.email}`}>
                      <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                      {patient.email}
                    </a>
                  ) : '-'}
                </Col>
              </Row>
              
              {/* Phones */}
              <h6 className="mt-4 mb-3">{t('patients.phones')}</h6>
              {patient.phones && patient.phones.length > 0 ? (
                <Table size="sm" className="mb-0">
                  <tbody>
                    {patient.phones.map((phone, index) => (
                      <tr key={index}>
                        <td>
                          {phone.phone_type === 'P' ? t('patients.phoneTypeLabels.P') :
                           phone.phone_type === 'H' ? t('patients.phoneTypeLabels.H') :
                           phone.phone_type === 'W' ? t('patients.phoneTypeLabels.W') :
                           t('patients.phoneTypeLabels.O')}
                        </td>
                        <td>
                          <a href={`tel:${phone.phone_number}`}>
                            <FontAwesomeIcon icon={faPhone} className="me-2" />
                            {phone.phone_number}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">{t('patients.noPhones')}</p>
              )}
              
              {/* Address */}
              <h6 className="mt-4 mb-3">{t('common.address')}</h6>
              <div className="d-flex">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 mt-1" />
                <div>
                  <p className="mb-1">{patient.address}</p>
                  <p className="text-muted mb-0">
                    {patient.province}, {patient.canton}, {patient.district}
                  </p>
                </div>
              </div>

              {/* Emergency Contacts */}
              <h6 className="mt-4 mb-3">{t('patients.emergencyContacts')}</h6>
              {patient.emergency_contacts && patient.emergency_contacts.length > 0 ? (
                <Table size="sm" responsive>
                  <thead>
                    <tr>
                      <th>{t('common.name')}</th>
                      <th>{t('common.phone')}</th>
                      <th>{t('patients.relationship')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.emergency_contacts.map((contact, index) => (
                      <tr key={index}>
                        <td>{`${contact.first_name} ${contact.last_name1} ${contact.last_name2 || ''}`}</td>
                        <td>
                          <a href={`tel:${contact.phone}`}>
                            <FontAwesomeIcon icon={faPhone} className="me-2" />
                            {contact.phone}
                          </a>
                        </td>
                        <td>{contact.relationship}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">{t('patients.noEmergencyContacts')}</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={8}>
          <Card>
            <Card.Body>
              <Tabs defaultActiveKey="anamnesis" className="mb-3" onSelect={(key) => {
                if (key === 'treatments') {
                  fetchPatientTreatments();
                }
              }}>
                {/* Anamnesis Tab */}
                <Tab eventKey="anamnesis" title={
                  <span>
                    <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                    {t('patients.medicalHistory.anamnesis')}
                  </span>
                }>
                  {canViewPatientsHistory() ? (
                    <>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">{t('patients.medicalHistory.title')}</h5>
                        
                        {canManagePatientsHistory() && (
                          <Button variant="primary" size="sm" onClick={handleAddMedicalHistory}>
                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                            {t('patients.medicalHistory.add')}
                          </Button>
                        )}
                      </div>
                      
                      {medicalHistories.length === 0 ? (
                        <Alert variant="info">
                          {t('patients.medicalHistory.noRecords')}
                        </Alert>
                      ) : (
                        <>
                          {/* Latest Anamnesis */}
                          <div className="mb-4">
                            <h6 className="border-bottom pb-2">{t('patients.medicalHistory.latest')}</h6>
                            <MedicalHistoryDisplay history={medicalHistories[0]} />
                          </div>
                          
                          {/* All Anamnesis Entries */}
                          <div>
                            <h6 className="border-bottom pb-2">{t('patients.medicalHistory.all')}</h6>
                            <Table responsive hover>
                              <thead>
                                <tr>
                                  <th>{t('patients.medicalHistory.date')}</th>
                                  <th>{t('patients.medicalHistory.confirmed')}</th>
                                  <th>{t('common.actions')}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {medicalHistories.map((history, index) => (
                                  <tr key={history.id || index}>
                                    <td>{formatDate(history.created_at)}</td>
                                    <td>
                                      {history.information_confirmed ? (
                                        <Badge bg="success">{t('common.yes')}</Badge>
                                      ) : (
                                        <Badge bg="warning">{t('common.no')}</Badge>
                                      )}
                                    </td>
                                    <td>
                                      <Button 
                                        variant="outline-info" 
                                        size="sm"
                                        onClick={() => handleViewMedicalHistory(history.id)}
                                      >
                                        {t('common.view')}
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted">
                      <p>You don't have access to view patient history.</p>
                    </div>
                  )}
                </Tab>

                {/* Treatments Tab */}
                <Tab eventKey="treatments" title={
                  <span>
                    <FontAwesomeIcon icon={faStethoscope} className="me-2" />
                    {t('treatments.title')}
                  </span>
                }>
                  {canViewAnyTreatments() ? (
                    <>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">{t('treatments.title')}</h5>
                        
                        {canCreateTreatments() && (
                          <Button variant="primary" size="sm" onClick={() => navigate('/clinic/treatments/new', { state: { selectedPatient: patient } })}>
                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                            {t('treatments.newTreatment')}
                          </Button>
                        )}
                      </div>
                      
                      {treatmentsLoading ? (
                        <div className="text-center py-3">
                          <Spinner animation="border" size="sm" />
                          <p className="mt-2">{t('common.loading')}...</p>
                        </div>
                      ) : patientTreatments.length === 0 ? (
                        <Alert variant="info">
                          {t('treatments.noTreatments')}
                        </Alert>
                      ) : (
                        <Table responsive hover>
                          <thead>
                            <tr>
                              <th>{t('treatments.scheduledDate')}</th>
                              <th>{t('common.specialty')}</th>
                              <th>{t('common.procedure')}</th>
                              <th>{t('common.doctor')}</th>
                              <th>{t('common.status')}</th>
                              <th>{t('common.actions')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {patientTreatments
                              .filter(treatment => ['SCHEDULED', 'IN_PROGRESS'].includes(treatment.status))
                              .map((treatment) => (
                              <tr key={treatment.id}>
                                <td>{formatDateTime(treatment.scheduled_date)}</td>
                                <td>{treatment.specialty_details?.name || '-'}</td>
                                <td>{treatment.catalog_item_details?.name || '-'}</td>
                                <td>{treatment.doctor_details?.first_name && treatment.doctor_details?.last_name1 
                                  ? `${treatment.doctor_details.first_name} ${treatment.doctor_details.last_name1}` 
                                  : '-'}</td>
                                <td>
                                  <Badge bg={
                                    treatment.status === 'COMPLETED' ? 'success' :
                                    treatment.status === 'IN_PROGRESS' ? 'primary' :
                                    treatment.status === 'CANCELED' ? 'danger' : 'secondary'
                                  }>
                                    {t(`treatments.status.${treatment.status}`)}
                                  </Badge>
                                </td>
                                <td>
                                  <Button 
                                    variant="outline-info" 
                                    size="sm"
                                    onClick={() => handleViewTreatment(treatment)}
                                  >
                                    {t('common.view')}
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted">
                      <p>You don't have access to view treatments.</p>
                    </div>
                  )}
                </Tab>

                {/* Finances Tab */}
                <Tab eventKey="finances" title={
                  <span>
                    <FontAwesomeIcon icon={faDollarSign} className="me-2" />
                    {t('common.finances')}
                  </span>
                }>
                  <div className="text-center py-5 text-muted">
                    <FontAwesomeIcon icon={faDollarSign} size="3x" className="mb-3" />
                    <p>{t('common.finances.comingSoon')}</p>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Medical History Form Modal */}
      {canManagePatientsHistory() && (
        <Modal 
          show={showMedicalHistoryForm} 
          onHide={() => setShowMedicalHistoryForm(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>{t('patients.medicalHistory.add')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <MedicalHistoryForm 
              patientId={id}
              onSave={handleMedicalHistorySave}
              onCancel={() => setShowMedicalHistoryForm(false)}
            />
          </Modal.Body>
        </Modal>
      )}
      
      <Modal 
        show={showMedicalHistoryDetails} 
        onHide={() => setShowMedicalHistoryDetails(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('patients.medicalHistory.viewDetails')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMedicalHistory ? (
            <MedicalHistoryDisplay history={selectedMedicalHistory} />
          ) : (
            <div className="text-center">
              <Spinner animation="border" role="status" />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMedicalHistoryDetails(false)}>
            {t('common.close')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

// Helper component to display medical history details
const MedicalHistoryDisplay = ({ history }) => {
  const { t } = useTranslation();
  
  if (!history) return <Alert variant="info">{t('patients.medicalHistory.noRecords')}</Alert>;
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <div>
      <Row className="mb-4">
        <Col md={6}>
          <h6>{t('patients.medicalHistory.date')}</h6>
          <p>{formatDate(history.created_at)}</p>
        </Col>
        <Col md={6}>
          <h6>{t('patients.medicalHistory.confirmed')}</h6>
          <p>
            {history.information_confirmed ? (
              <Badge bg="success">{t('common.yes')}</Badge>
            ) : (
              <Badge bg="warning">{t('common.no')}</Badge>
            )}
          </p>
        </Col>
      </Row>
      
      <h6 className="border-bottom pb-2 mb-3">{t('patients.medicalHistory.medicalConditions')}</h6>
      <Row className="mb-4">
        {renderMedicalConditions(history, t)}
      </Row>
      
      <h6 className="border-bottom pb-2 mb-3">{t('patients.medicalHistory.medicalStatus')}</h6>
      <Row className="mb-4">
        {renderMedicalStatus(history, t)}
      </Row>
      
      <h6 className="border-bottom pb-2 mb-3">{t('patients.medicalHistory.treatmentDetails')}</h6>
      {renderTreatmentDetails(history, t)}
    </div>
  );
};

// Helper functions to render different sections of medical history
const renderMedicalConditions = (history, t) => {
  const conditions = [
    { field: 'high_blood_pressure', label: t('patients.medicalHistory.conditions.highBloodPressure') },
    { field: 'diabetes', label: t('patients.medicalHistory.conditions.diabetes') },
    { field: 'asthma', label: t('patients.medicalHistory.conditions.asthma') },
    { field: 'heart_problems', label: t('patients.medicalHistory.conditions.heartProblems') },
    { field: 'gastritis', label: t('patients.medicalHistory.conditions.gastritis') },
    { field: 'hormonal_problems', label: t('patients.medicalHistory.conditions.hormonalProblems') },
    { field: 'rheumatic_fever', label: t('patients.medicalHistory.conditions.rheumaticFever') },
    { field: 'anemia', label: t('patients.medicalHistory.conditions.anemia') },
    { field: 'arthritis', label: t('patients.medicalHistory.conditions.arthritis') },
    { field: 'smoker', label: t('patients.medicalHistory.conditions.smoker') },
    { field: 'hepatitis', label: t('patients.medicalHistory.conditions.hepatitis') },
    { field: 'epilepsy', label: t('patients.medicalHistory.conditions.epilepsy') },
    { field: 'drug_addiction', label: t('patients.medicalHistory.conditions.drugAddiction') },
    { field: 'thyroid', label: t('patients.medicalHistory.conditions.thyroid') },
    { field: 'cancer', label: t('patients.medicalHistory.conditions.cancer') },
    { field: 'ulcers', label: t('patients.medicalHistory.conditions.ulcers') },
    { field: 'kidney_diseases', label: t('patients.medicalHistory.conditions.kidneyDiseases') },
    { field: 'aids', label: t('patients.medicalHistory.conditions.aids') },
    { field: 'psychiatric_treatment', label: t('patients.medicalHistory.conditions.psychiatricTreatment') },
  ];
  
  return conditions.map((condition, index) => (
    <Col md={4} key={condition.field}>
      <div className="d-flex align-items-center mb-2">
        <div className={`me-2 status-indicator ${history[condition.field] ? 'bg-danger' : 'bg-success'}`} 
             style={{ width: '12px', height: '12px', borderRadius: '50%' }}></div>
        <span className={history[condition.field] ? 'fw-bold' : ''}>
          {condition.label}
        </span>
      </div>
    </Col>
  ));
};

const renderMedicalStatus = (history, t) => {
  const statuses = [
    { field: 'anesthesia_issues', label: t('patients.medicalHistory.status.anesthesiaIssues') },
    { field: 'bleeding_issues', label: t('patients.medicalHistory.status.bleedingIssues') },
    { field: 'pregnant_or_lactating', label: t('patients.medicalHistory.status.pregnantOrLactating') },
    { field: 'contraceptives', label: t('patients.medicalHistory.status.contraceptives') },
  ];
  
  return statuses.map((status, index) => (
    <Col md={6} key={status.field}>
      <div className="d-flex align-items-center mb-2">
        <div className={`me-2 status-indicator ${history[status.field] ? 'bg-warning' : 'bg-success'}`} 
             style={{ width: '12px', height: '12px', borderRadius: '50%' }}></div>
        <span className={history[status.field] ? 'fw-bold' : ''}>
          {status.label}
        </span>
      </div>
    </Col>
  ));
};

const renderTreatmentDetails = (history, t) => {
  const details = [
    { field: 'under_treatment', textField: 'under_treatment_text', label: t('patients.medicalHistory.details.underTreatment') },
    { field: 'current_medication', textField: 'current_medication_text', label: t('patients.medicalHistory.details.currentMedication') },
    { field: 'serious_illnesses', textField: 'serious_illnesses_text', label: t('patients.medicalHistory.details.seriousIllnesses') },
    { field: 'surgeries', textField: 'surgeries_text', label: t('patients.medicalHistory.details.surgeries') },
    { field: 'allergies', textField: 'allergies_text', label: t('patients.medicalHistory.details.allergies') },
  ];
  
  return details.map((detail, index) => (
    <div key={detail.field} className="mb-3">
      <h6 className="d-flex align-items-center">
        <div className={`me-2 status-indicator ${history[detail.field] ? 'bg-warning' : 'bg-success'}`} 
             style={{ width: '12px', height: '12px', borderRadius: '50%' }}></div>
        {detail.label}
      </h6>
      {history[detail.field] && history[detail.textField] && (
        <p className="ms-4 mb-0">{history[detail.textField]}</p>
      )}
    </div>
  ));
};

export default PatientDetail;