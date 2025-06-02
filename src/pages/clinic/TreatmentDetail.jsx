// src/pages/clinic/TreatmentDetail.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Table, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, faEdit, faPlus, faUser, faCalendarAlt, 
  faStethoscope, faNotesMedical, faMapMarkerAlt, faCheck, faTimes, faEye, faTrash, faSave, faPlay 
} from '@fortawesome/free-solid-svg-icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccountContext } from '../../contexts/AccountContext';
import treatmentsService from '../../services/treatments.service';
import TreatmentForm from '../../components/clinic/TreatmentForm';

const TreatmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { selectedAccount } = useContext(AccountContext);
  
  const [treatment, setTreatment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showNoteViewModal, setShowNoteViewModal] = useState(false);
  const [showNoteEditModal, setShowNoteEditModal] = useState(false);
  const [showNoteDeleteModal, setShowNoteDeleteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (selectedAccount) {
      fetchTreatmentData();
    }
  }, [id, selectedAccount]);

  const fetchTreatmentData = async () => {
    if (!selectedAccount) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      const treatmentData = await treatmentsService.getTreatment(id, accountHeaders);
      setTreatment(treatmentData);
      
    } catch (err) {
      console.error('Error fetching treatment data:', err);
      setError(t('treatments.errorLoadingDetails') || 'Error loading treatment details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/clinic/treatments');
  };

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleEditSave = async (treatmentData) => {
    if (!selectedAccount) {
      throw new Error('Please select a clinic first');
    }
    
    try {
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      await treatmentsService.updateTreatment(id, treatmentData, accountHeaders);
      setSuccessMessage(t('treatments.updateSuccess') || 'Treatment updated successfully');
      setShowEditForm(false);
      
      await fetchTreatmentData();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating treatment:', err);
      throw err;
    }
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedAccount) return;
    
    try {
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      await treatmentsService.updateTreatmentStatus(id, newStatus, accountHeaders);
      setTreatment({ ...treatment, status: newStatus });
      setSuccessMessage(t('treatments.messages.statusUpdated') || 'Status updated successfully');
      
      await fetchTreatmentData();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      setError(t('treatments.errorUpdatingStatus') || 'Error updating status');
    }
  };

  const handleShowNotes = () => {
    setShowAddNoteModal(true);
  };

  const handleAddNoteSave = async (noteData) => {
    if (!selectedAccount) return;
    
    try {
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      const addNoteData = {
        note: noteData.note,
        type: noteData.type
      };

      if (noteData.assigned_doctor) {
        addNoteData.assigned_doctor = noteData.assigned_doctor;
      }
      
      await treatmentsService.addTreatmentNote(id, addNoteData, accountHeaders);
      
      setShowAddNoteModal(false);
      setSuccessMessage(t('treatments.notes.addSuccess'));
      
      await fetchTreatmentData();
      
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error('Error adding note:', err);
      throw err;
    }
  };

  const handleViewNote = (note) => {
    setSelectedNote(note);
    setShowNoteViewModal(true);
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setShowNoteEditModal(true);
  };

  const handleDeleteNote = (note) => {
    setNoteToDelete(note);
    setShowNoteDeleteModal(true);
  };
  
  const handleDeleteNoteConfirm = async () => {
    if (!selectedAccount || !noteToDelete) {
      return;
    }
    
    try {
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      await treatmentsService.deleteTreatmentNote(noteToDelete.id, accountHeaders);
      
      setShowNoteDeleteModal(false);
      setNoteToDelete(null);
      setSuccessMessage(t('treatments.notes.deleteSuccess'));
      
      await fetchTreatmentData();
      
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error('Error deleting note:', err);
      setError(t('treatments.notes.errorDeleting'));
    }
  };

  const handleEditNoteSave = async (noteData) => {
    if (!selectedAccount || !selectedNote) {
      return;
    }
    
    try {
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      const updateData = {
        ...noteData,
        treatment: selectedNote.treatment || parseInt(id)
      };
      
      await treatmentsService.updateTreatmentNote(selectedNote.id, updateData, accountHeaders);
      
      setShowNoteEditModal(false);
      setSelectedNote(null);
      setSuccessMessage(t('treatments.notes.updateSuccess'));
      
      await fetchTreatmentData();
      
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error('Error updating note:', err);
      throw err;
    }
  };

  const handleRescheduleSave = async (rescheduleData) => {
    if (!selectedAccount) {
      return;
    }
    
    try {
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      const newDate = new Date(rescheduleData.newDate).toISOString();
      
      const updateData = {
        scheduled_date: newDate,
        status: 'RESCHEDULED'
      };
      
      await treatmentsService.updateTreatment(id, updateData, accountHeaders);
      
      const noteData = {
        note: rescheduleData.note,
        type: 'RESCHEDULE'
      };
      
      await treatmentsService.addTreatmentNote(id, noteData, accountHeaders);
      
      setShowRescheduleModal(false);
      setSuccessMessage('Treatment rescheduled successfully');
      
      await fetchTreatmentData();
      
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error('Error rescheduling treatment:', err);
      setError('Error rescheduling treatment');
    }
  };

  const handleStatusChangeWithNote = async (statusData) => {
    if (!selectedAccount) {
      return;
    }
    
    try {
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      const updateData = {
        status: statusData.status
      };
      
      if (statusData.status === 'COMPLETED') {
        updateData.completed_date = new Date().toISOString();
      }
      
      await treatmentsService.updateTreatment(id, updateData, accountHeaders);
      
      const noteData = {
        note: statusData.note,
        type: 'MEDICAL'
      };
      
      await treatmentsService.addTreatmentNote(id, noteData, accountHeaders);
      
      setShowCompleteModal(false);
      setShowCancelModal(false);
      
      setSuccessMessage(`Treatment ${statusData.status.toLowerCase()} successfully`);
      
      await fetchTreatmentData();
      
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error('Error changing status:', err);
      setError('Error changing treatment status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'primary';
      case 'IN_PROGRESS': return 'warning';
      case 'COMPLETED': return 'success';
      case 'CANCELED': return 'danger';
      default: return 'secondary';
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Show message if no account selected
  if (!selectedAccount) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-4 text-muted">
          <p>Please select a clinic first to view treatment details</p>
        </div>
      </Container>
    );
  }

  // Show edit form if editing
  if (showEditForm) {
    return (
      <Container fluid className="py-4">
        <Button 
          variant="outline-secondary" 
          className="mb-3"
          onClick={handleEditCancel}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          {t('common.back')}
        </Button>
        
        <TreatmentForm
          treatment={treatment}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
        />
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
              {t('common.back') || 'Back to Treatments'}
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!treatment) {
    return (
      <Container fluid className="py-4">
        <Alert variant="warning">
          Treatment not found
          <div className="mt-3">
            <Button variant="outline-primary" onClick={handleBack}>
              {t('common.back') || 'Back to Treatments'}
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <Button variant="outline-secondary" onClick={handleBack} className="me-2">
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            {t('common.back') || 'Back to Treatments'}
          </Button>
          <Button variant="outline-primary" onClick={handleEdit} className="me-2">
            <FontAwesomeIcon icon={faEdit} className="me-2" />
            {t('common.edit')}
          </Button>
          
          {/* Action Buttons */}
          {treatment.status === 'SCHEDULED' && (
            <Button variant="info" onClick={() => handleStatusChange('IN_PROGRESS')} className="me-2">
              <FontAwesomeIcon icon={faPlay} className="me-2" />
              {t('treatments.actions.startProgress') || 'Start Progress'}
            </Button>
          )}

          {/* Complete button ONLY for IN_PROGRESS */}
          {treatment.status === 'IN_PROGRESS' && (
            <Button variant="success" onClick={() => setShowCompleteModal(true)} className="me-2">
              <FontAwesomeIcon icon={faCheck} className="me-2" />
              {t('treatments.actions.complete') || 'Mark Complete'}
            </Button>
          )}

          {(treatment.status !== 'CANCELED' && treatment.status !== 'COMPLETED') && (
            <Button variant="danger" onClick={() => setShowCancelModal(true)} className="me-2">
              <FontAwesomeIcon icon={faTimes} className="me-2" />
              {t('common.cancel') || 'Cancel Treatment'}
            </Button>
          )}

          {/* Reschedule Button */}
          {(treatment.status === 'SCHEDULED' || treatment.status === 'IN_PROGRESS') && (
            <Button 
              variant="warning" 
              onClick={() => setShowRescheduleModal(true)}
              className="me-2"
            >
              <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
              {t('treatments.actions.reschedule') || 'Reschedule'}
            </Button>
          )}
        </Col>
      </Row>

      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
          {successMessage}
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          {/* Main Treatment Info */}
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faStethoscope} className="me-2" />
                Treatment Details
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <h6>{t('common.procedure') || 'Procedure'}</h6>
                  <p className="mb-1 fw-bold">
                    {treatment.catalog_item_details?.name}
                  </p>
                  <small className="text-success fw-bold">
                    ${treatment.catalog_item_details?.price}
                  </small>
                </Col>
                <Col md={6}>
                  <h6>{t('common.specialty') || 'Specialty'}</h6>
                  <p>{treatment.specialty_details?.name}</p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <h6>{t('common.status') || 'Status'}</h6>
                  <Badge bg={getStatusVariant(treatment.status)} className="fs-6">
                    {t(`treatments.status.${treatment.status}`) || treatment.status}
                  </Badge>
                </Col>
                <Col md={6}>
                  <h6>{t('treatments.fields.phase') || 'Phase'}</h6>
                  <p>Phase {treatment.phase_number}</p>
                </Col>
              </Row>

              {treatment.notes && (
                <Row className="mb-3">
                  <Col>
                    <h6>{t('treatments.fields.notes') || 'Notes'}</h6>
                    <p className="text-muted">{treatment.notes}</p>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Patient Info */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">
                <FontAwesomeIcon icon={faUser} className="me-2" />
                {t('common.patient') || 'Patient'}
              </h6>
            </Card.Header>
            <Card.Body>
              <h6 className="text-primary">
                {treatment.patient_details?.first_name} {treatment.patient_details?.last_name1} {treatment.patient_details?.last_name2}
              </h6>
              <p className="mb-1">
                <strong>ID:</strong> {treatment.patient_details?.id_number}
              </p>
              <p className="mb-0">
                <strong>Gender:</strong> {treatment.patient_details?.gender === 'M' ? 'Male' : 'Female'}
              </p>
            </Card.Body>
          </Card>
          {/* Schedule Info */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                {t('treatments.schedule.title') || 'Schedule'}
              </h6>
            </Card.Header>
            <Card.Body>
              {/* Current Schedule */}
              <div className="mb-3">
                <strong>{t('treatments.schedule.currentSchedule') || 'Current Schedule'}:</strong><br />
                <span className="text-primary fs-6">
                  {formatDate(treatment.scheduled_date)}
                </span>
                {treatment.status === 'RESCHEDULED' && (
                  <Badge bg="warning" className="ms-2 text-dark">
                    {t('treatments.schedule.rescheduled') || 'Rescheduled'}
                  </Badge>
                )}
              </div>

              {/* Schedule History - only show previous schedules */}
              {treatment.schedule_history && treatment.schedule_history.length > 1 && (
                <div className="mb-3">
                  <strong>{t('treatments.schedule.previousSchedules') || 'Previous Schedules'}:</strong>
                  <div className="mt-2">
                    {treatment.schedule_history
                      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort by newest first
                      .filter(historyItem => formatDate(historyItem.scheduled_date) !== formatDate(treatment.scheduled_date)) // Exclude current schedule
                      .map((historyItem, index) => (
                        <div key={historyItem.id || index} className="small mb-1">
                          <span className="text-muted">
                            <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                            <s>{formatDate(historyItem.scheduled_date)}</s>
                            <small className="ms-2">
                              ({t('treatments.schedule.changedOn') || 'Changed on'} {new Date(historyItem.created_at).toLocaleDateString()})
                            </small>
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Completion Date */}
              {treatment.completed_date && (
                <div className="mb-3">
                  <strong>{t('treatments.fields.completedDate') || 'Completed'}:</strong><br />
                  <span className="text-success">
                    {formatDate(treatment.completed_date)}
                  </span>
                </div>
              )}

              {/* Doctor */}
              <div className="mb-0">
                <strong>{t('common.doctor') || 'Doctor'}:</strong><br />
                {treatment.doctor_details?.first_name} {treatment.doctor_details?.last_name}
              </div>
            </Card.Body>
          </Card>

          {/* Location Info */}
          {treatment.location_details && (
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                  Location
                </h6>
              </Card.Header>
              <Card.Body>
                <p className="mb-1 fw-bold">{treatment.location_details.name}</p>
                <p className="mb-0 text-muted small">
                  {treatment.location_details.address}
                </p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Treatment Notes */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <FontAwesomeIcon icon={faNotesMedical} className="me-2" />
                {t('treatments.notes.title')}
              </h6>
              <Button variant="primary" size="sm" onClick={handleShowNotes}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                {t('treatments.notes.newNote')}
              </Button>
            </Card.Header>
            <Card.Body>
            {treatment.additional_notes && treatment.additional_notes.length > 0 ? (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th width="120">{t('treatments.notes.dateTime')}</th>
                    <th width="80">Type</th>
                    <th>{t('common.note')}</th>
                    <th width="120">{t('treatments.notes.createdBy')}</th>
                    <th width="120">Assigned Doctor</th>
                    <th width="100">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {treatment.additional_notes.map((note, index) => (
                    <tr key={note.id || index}>
                      <td>
                        <small>{formatDate(note.date)}</small>
                      </td>
                      <td>
                        <Badge 
                          bg={note.type === 'RESCHEDULE' ? 'warning' : note.type === 'BILLING' ? 'info' : 'success'}
                          className="text-dark"
                        >
                          {note.type || 'MEDICAL'}
                        </Badge>
                      </td>
                      <td>
                        <div style={{ maxWidth: '300px' }}>
                          <div 
                            style={{ 
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              lineHeight: '1.4'
                            }}
                          >
                            {truncateText(note.note, 100)}
                          </div>
                          {note.note && note.note.length > 100 && (
                            <small className="text-muted">
                              <em>{t('treatments.notes.clickViewFull')}</em>
                            </small>
                          )}
                        </div>
                      </td>
                      <td>
                        <small>
                          {note.created_by_details?.first_name} {note.created_by_details?.last_name}
                        </small>
                      </td>
                      <td>
                        <small>
                          {note.type === 'MEDICAL' ? (
                            note.assigned_doctor_details ? 
                              `${note.assigned_doctor_details.first_name} ${note.assigned_doctor_details.last_name}` :
                              <span className="text-muted">Not assigned</span>
                          ) : (
                            <span className="text-muted">N/A</span>
                          )}
                        </small>
                      </td>
                      <td>
                        <Button
                          variant="outline-info"
                          size="sm"
                          className="me-1"
                          onClick={() => handleViewNote(note)}
                          title={t('treatments.notes.viewNote')}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleEditNote(note)}
                          title={t('treatments.notes.editNote')}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>
                        {/* <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteNote(note)}
                          title={t('treatments.notes.deleteNote')}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button> */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <Alert variant="info">
                {t('treatments.notes.noNotes')}
              </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Note Modal */}
      <Modal 
        show={showAddNoteModal} 
        onHide={() => setShowAddNoteModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('treatments.notes.addNote')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {treatment ? (
            <NoteAddForm 
              onSave={handleAddNoteSave}
              onCancel={() => setShowAddNoteModal(false)}
              treatment={treatment}
            />
          ) : (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading treatment data...</span>
              </div>
              <p className="mt-2">Loading treatment data...</p>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Individual Note View Modal */}
      <Modal 
        show={showNoteViewModal} 
        onHide={() => setShowNoteViewModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('treatments.notes.viewNoteDetails')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNote && (
            <div>
              <div className="mb-3">
                <Row>
                  <Col md={6}>
                    <strong>{t('treatments.notes.dateTime')}:</strong><br />
                    <span className="text-primary">{formatDate(selectedNote.date)}</span>
                  </Col>
                  <Col md={6}>
                    <strong>{t('treatments.notes.createdBy')}:</strong><br />
                    <span className="text-primary">
                      {selectedNote.created_by_details?.first_name} {selectedNote.created_by_details?.last_name}
                    </span>
                  </Col>
                </Row>
              </div>

              {/* Show assigned doctor only for medical notes */}
              {selectedNote.type === 'MEDICAL' && (
                <div className="mb-3">
                  <Row>
                    <Col md={6}>
                      <strong>Assigned Doctor:</strong><br />
                      <span className="text-primary">
                        {selectedNote.assigned_doctor_details ? 
                          `${selectedNote.assigned_doctor_details.first_name} ${selectedNote.assigned_doctor_details.last_name}` :
                          <span className="text-muted">Not assigned</span>
                        }
                      </span>
                    </Col>
                    <Col md={6}>
                      <strong>Note Type:</strong><br />
                      <Badge bg="success" className="text-dark">
                        {selectedNote.type}
                      </Badge>
                    </Col>
                  </Row>
                </div>
              )}
              
              <hr />
              
              <div>
                <strong>{t('treatments.notes.note')}:</strong>
                <div 
                  className="mt-2 p-3"
                  style={{ 
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    lineHeight: '1.6',
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}
                >
                  {selectedNote.note}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNoteViewModal(false)}>
            {t('common.close')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Note Modal */}
      <Modal 
        show={showNoteEditModal} 
        onHide={() => setShowNoteEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('treatments.notes.editNote')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNote && (
            <NoteEditForm 
              note={selectedNote}
              onSave={handleEditNoteSave}
              onCancel={() => setShowNoteEditModal(false)}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Delete Note Confirmation Modal */}
      <Modal show={showNoteDeleteModal} onHide={() => setShowNoteDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('treatments.notes.deleteNote')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('treatments.notes.confirmDelete')}
          {noteToDelete && (
            <div className="mt-3 p-3 bg-light rounded">
              <strong>{t('treatments.notes.dateTime')}:</strong> {formatDate(noteToDelete.date)}<br />
              <strong>{t('treatments.notes.note')}:</strong>
              <div 
                className="mt-2"
                style={{ 
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  backgroundColor: 'white',
                  padding: '10px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px'
                }}
              >
                {noteToDelete.note}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNoteDeleteModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDeleteNoteConfirm}>
            {t('treatments.notes.deleteNote')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Complete Treatment Modal */}
      <Modal 
        show={showCompleteModal} 
        onHide={() => setShowCompleteModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('treatments.modals.completeTitle') || 'Complete Treatment'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <StatusChangeForm 
            statusType="COMPLETED"
            onSave={handleStatusChangeWithNote}
            onCancel={() => setShowCompleteModal(false)}
          />
        </Modal.Body>
      </Modal>

      {/* Cancel Treatment Modal */}
      <Modal 
        show={showCancelModal} 
        onHide={() => setShowCancelModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('treatments.modals.cancelTitle') || 'Cancel Treatment'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <StatusChangeForm 
            statusType="CANCELED"
            onSave={handleStatusChangeWithNote}
            onCancel={() => setShowCancelModal(false)}
          />
        </Modal.Body>
      </Modal>

      {/* Reschedule Treatment Modal */}
      <Modal 
        show={showRescheduleModal} 
        onHide={() => setShowRescheduleModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('treatments.modals.rescheduleTitle') || 'Reschedule Treatment'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <RescheduleForm 
            currentDate={treatment.scheduled_date}
            onSave={handleRescheduleSave}
            onCancel={() => setShowRescheduleModal(false)}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

// Helper component for adding notes
const NoteAddForm = ({ onSave, onCancel, treatment }) => {
  const { t } = useTranslation();
  const { selectedAccount } = useContext(AccountContext);
  
  const [formData, setFormData] = useState({
    note: '',
    type: 'MEDICAL',
    assigned_doctor: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [userRoleInfo, setUserRoleInfo] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Load user role info when component mounts
  useEffect(() => {
    if (selectedAccount) {
      loadUserRoleInfo();
    }
  }, [selectedAccount]);

  // Load doctors when treatment data is available
  useEffect(() => {
    if (selectedAccount && treatment) {
      loadDoctors();
    }
  }, [selectedAccount, treatment]);

  const loadUserRoleInfo = async () => {
    if (!selectedAccount) return;
    
    try {
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      const response = await treatmentsService.getUserRoleInfo(accountHeaders);
      setUserRoleInfo(response);
    } catch (err) {
      console.error('Error loading user role info:', err);
    }
  };

  const loadDoctors = async () => {
    if (!selectedAccount || !treatment) return;
    
    try {
      setLoadingDoctors(true);
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      const response = await treatmentsService.getFormOptions(accountHeaders, treatment.specialty);
      setDoctors(response.doctors || []);
    } catch (err) {
      console.error('Error loading doctors:', err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.note.trim()) {
      errors.note = t('validation.required');
    }
    
    // For medical notes, check doctor assignment requirement
    if (formData.type === 'MEDICAL' && userRoleInfo && !userRoleInfo.is_doctor) {
      if (!formData.assigned_doctor) {
        errors.assigned_doctor = t('validation.required');
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      const noteData = {
        note: formData.note.trim(),
        type: formData.type
      };
      
      // Add assigned doctor for medical notes if user is not a doctor
      if (formData.type === 'MEDICAL' && userRoleInfo && !userRoleInfo.is_doctor) {
        noteData.assigned_doctor = parseInt(formData.assigned_doctor);
      }
      
      await onSave(noteData);
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setSaving(false);
    }
  };

  const showDoctorSelection = formData.type === 'MEDICAL' && userRoleInfo && !userRoleInfo.is_doctor;

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>{t('common.type') || 'Note Type'} *</Form.Label>
        <Form.Select
          name="type"
          value={formData.type}
          onChange={handleChange}
        >
          <option value="MEDICAL">{t('treatments.notes.types.medical') || 'Medical Note'}</option>
          <option value="BILLING">{t('treatments.notes.types.billing') || 'Billing Note'}</option>
        </Form.Select>
      </Form.Group>

      {/* Doctor Assignment - Only show for medical notes when user is not a doctor */}
      {showDoctorSelection && (
        <Form.Group className="mb-3">
          <Form.Label>Assigned Doctor *</Form.Label>
          <Form.Select
            name="assigned_doctor"
            value={formData.assigned_doctor}
            onChange={handleChange}
            isInvalid={!!formErrors.assigned_doctor}
            disabled={loadingDoctors}
          >
            <option value="">
              {loadingDoctors ? 'Loading doctors...' : 'Select a doctor'}
            </option>
            {doctors.map(doctor => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.first_name} {doctor.last_name}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {formErrors.assigned_doctor}
          </Form.Control.Feedback>
          <Form.Text className="text-muted">
            Select the doctor who should be assigned to this medical note.
          </Form.Text>
        </Form.Group>
      )}

      {/* Auto-assignment info for doctors */}
      {formData.type === 'MEDICAL' && userRoleInfo && userRoleInfo.is_doctor && (
        <Alert variant="info" className="mb-3">
          <small>
            <strong>Auto-assigned:</strong> This medical note will be automatically assigned to you.
          </small>
        </Alert>
      )}
      
      <Form.Group className="mb-3">
        <Form.Label>{t('treatments.notes.noteLabel')} *</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          name="note"
          value={formData.note}
          onChange={handleChange}
          isInvalid={!!formErrors.note}
          placeholder={t('treatments.notes.notePlaceholder')}
        />
        <Form.Control.Feedback type="invalid">
          {formErrors.note}
        </Form.Control.Feedback>
        <Form.Text className="text-muted">
          {t('treatments.notes.timestampHelp')}
        </Form.Text>
      </Form.Group>
      
      <div className="d-flex justify-content-end">
        <Button 
          variant="secondary" 
          onClick={onCancel}
          className="me-2"
          disabled={saving}
        >
          <FontAwesomeIcon icon={faTimes} className="me-2" />
          {t('common.cancel')}
        </Button>
        <Button 
          variant="primary" 
          type="submit"
          disabled={saving || (showDoctorSelection && loadingDoctors)}
        >
          <FontAwesomeIcon icon={faSave} className="me-2" />
          {saving ? t('common.saving') : t('treatments.notes.addNote')}
        </Button>
      </div>
    </Form>
  );
};

// Helper component for editing notes
const NoteEditForm = ({ note, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    note: note.note || '',
    type: note.type || 'MEDICAL'
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.note.trim()) {
      errors.note = t('validation.required');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      const noteData = {
        note: formData.note.trim(),
        type: formData.type
      };
      
      await onSave(noteData);
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>{t('common.type') || 'Note Type'} *</Form.Label>
        <Form.Select
          name="type"
          value={formData.type}
          onChange={handleChange}
          disabled={note.type === 'RESCHEDULE'} // Don't allow changing reschedule notes
        >
          <option value="MEDICAL">{t('treatments.notes.types.medical') || 'Medical Note'}</option>
          <option value="BILLING">{t('treatments.notes.types.billing') || 'Billing Note'}</option>
          {note.type === 'RESCHEDULE' && (
            <option value="RESCHEDULE">{t('treatments.notes.types.reschedule') || 'Reschedule Note'}</option>
          )}
        </Form.Select>
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>{t('treatments.notes.noteLabel')} *</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          name="note"
          value={formData.note}
          onChange={handleChange}
          isInvalid={!!formErrors.note}
          placeholder={t('treatments.notes.notePlaceholder')}
        />
        <Form.Control.Feedback type="invalid">
          {formErrors.note}
        </Form.Control.Feedback>
        <Form.Text className="text-muted">
          {t('treatments.notes.timestampHelp')}
        </Form.Text>
      </Form.Group>
      
      <div className="d-flex justify-content-end">
        <Button 
          variant="secondary" 
          onClick={onCancel}
          className="me-2"
          disabled={saving}
        >
          <FontAwesomeIcon icon={faTimes} className="me-2" />
          {t('common.cancel')}
        </Button>
        <Button 
          variant="primary" 
          type="submit"
          disabled={saving}
        >
          <FontAwesomeIcon icon={faSave} className="me-2" />
          {saving ? t('common.saving') : t('treatments.notes.updateNote')}
        </Button>
      </div>
    </Form>
  );
};

// Helper component for rescheduling treatments
const RescheduleForm = ({ currentDate, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    newDate: currentDate ? new Date(currentDate).toISOString().slice(0, 16) : '',
    note: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.newDate) {
      errors.newDate = t('validation.required');
    }
    
    if (!formData.note.trim()) {
      errors.note = t('validation.required');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      const rescheduleData = {
        newDate: formData.newDate,
        note: formData.note.trim()
      };
      
      await onSave(rescheduleData);
    } catch (err) {
      console.error('Error saving reschedule:', err);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Alert variant="info" className="mb-3">
        <strong>{t('treatments.modals.currentScheduledDate') || 'Current scheduled date'}:</strong> {formatDate(currentDate)}
      </Alert>
      
      <Form.Group className="mb-3">
        <Form.Label>{t('treatments.modals.newScheduledDateTime') || 'New Scheduled Date & Time'} *</Form.Label>
        <Form.Control
          type="datetime-local"
          name="newDate"
          value={formData.newDate}
          onChange={handleChange}
          isInvalid={!!formErrors.newDate}
        />
        <Form.Control.Feedback type="invalid">
          {formErrors.newDate}
        </Form.Control.Feedback>
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>{t('treatments.modals.rescheduleReason') || 'Reschedule Reason'} *</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="note"
          value={formData.note}
          onChange={handleChange}
          isInvalid={!!formErrors.note}
          placeholder={t('treatments.modals.rescheduleReasonPlaceholder') || 'Enter reason for rescheduling...'}
        />
        <Form.Control.Feedback type="invalid">
          {formErrors.note}
        </Form.Control.Feedback>
        <Form.Text className="text-muted">
          {t('treatments.modals.rescheduleNoteHelp') || 'This note will be added to the treatment notes with type "RESCHEDULE"'}
        </Form.Text>
      </Form.Group>
      
      <div className="d-flex justify-content-end">
        <Button 
          variant="secondary" 
          onClick={onCancel}
          className="me-2"
          disabled={saving}
        >
          <FontAwesomeIcon icon={faTimes} className="me-2" />
          {t('common.cancel')}
        </Button>
        <Button 
          variant="primary" 
          type="submit"
          disabled={saving}
        >
          <FontAwesomeIcon icon={faSave} className="me-2" />
          {saving ? t('common.saving') : (t('treatments.modals.rescheduleButton') || 'Reschedule Treatment')}
        </Button>
      </div>
    </Form>
  );
};

// Helper component for status changes that require notes
const StatusChangeForm = ({ statusType, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    note: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.note.trim()) {
      errors.note = t('validation.required');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      const statusData = {
        status: statusType,
        note: formData.note.trim()
      };
      
      await onSave(statusData);
    } catch (err) {
      console.error('Error changing status:', err);
    } finally {
      setSaving(false);
    }
  };

  const getAlertText = () => {
    if (statusType === 'COMPLETED') {
      return {
        message: t('treatments.modals.completeMessage') || 'This will mark the treatment as completed.',
        instruction: t('treatments.modals.completeInstruction') || 'Please provide a note explaining the completion.'
      };
    } else {
      return {
        message: t('treatments.modals.cancelMessage') || 'This will cancel the treatment.',
        instruction: t('treatments.modals.cancelInstruction') || 'Please provide a note explaining the cancellation.'
      };
    }
  };

  const getFieldLabel = () => {
    return statusType === 'COMPLETED' ? 
      (t('treatments.modals.completionNotes') || 'Completion Notes') : 
      (t('treatments.modals.cancellationReason') || 'Cancellation Reason');
  };

  const getPlaceholder = () => {
    return statusType === 'COMPLETED' ? 
      (t('treatments.modals.completionPlaceholder') || 'Enter completion notes, final observations, or recommendations...') :
      (t('treatments.modals.cancellationPlaceholder') || 'Enter reason for cancellation...');
  };

  const getButtonText = () => {
    if (saving) return t('common.saving');
    return statusType === 'COMPLETED' ? 
      (t('treatments.modals.completeButton') || 'Complete Treatment') :
      (t('treatments.modals.cancelButton') || 'Cancel Treatment');
  };

  const alertText = getAlertText();

  return (
    <Form onSubmit={handleSubmit}>
      <Alert variant={statusType === 'COMPLETED' ? 'success' : 'warning'} className="mb-3">
        <strong>{alertText.message}</strong>
        <br />
        {alertText.instruction}
      </Alert>
      
      <Form.Group className="mb-3">
        <Form.Label>{getFieldLabel()} *</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          name="note"
          value={formData.note}
          onChange={handleChange}
          isInvalid={!!formErrors.note}
          placeholder={getPlaceholder()}
        />
        <Form.Control.Feedback type="invalid">
          {formErrors.note}
        </Form.Control.Feedback>
        <Form.Text className="text-muted">
          {t('treatments.modals.noteWillBeAdded') || 'This note will be added to the treatment notes.'}
        </Form.Text>
      </Form.Group>
      
      <div className="d-flex justify-content-end">
        <Button 
          variant="secondary" 
          onClick={onCancel}
          className="me-2"
          disabled={saving}
        >
          <FontAwesomeIcon icon={faTimes} className="me-2" />
          {t('common.cancel')}
        </Button>
        <Button 
          variant={statusType === 'COMPLETED' ? 'success' : 'danger'}
          type="submit"
          disabled={saving}
        >
          <FontAwesomeIcon icon={statusType === 'COMPLETED' ? faCheck : faTimes} className="me-2" />
          {getButtonText()}
        </Button>
      </div>
    </Form>
  );
};

export default TreatmentDetail;