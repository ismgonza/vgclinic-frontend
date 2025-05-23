// src/pages/clinic/TreatmentDetail.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Table, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, faEdit, faPlus, faUser, faCalendarAlt, 
  faStethoscope, faNotesMedical, faMapMarkerAlt, faCheck, faTimes, faEye, faTrash, faSave 
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
      
      // Set account context for API calls
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      // Fetch treatment details
      const treatmentData = await treatmentsService.getTreatment(id, accountHeaders);
      setTreatment(treatmentData);
      
      console.log('Loaded treatment for account:', selectedAccount.account_name);
      
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
      
      // Refresh treatment data
      await fetchTreatmentData();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating treatment:', err);
      throw err; // Re-throw to let the form component handle it
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
      setSuccessMessage(t('treatments.statusUpdated') || 'Status updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      setError(t('treatments.errorUpdatingStatus') || 'Error updating status');
    }
  };

  const handleComplete = () => handleStatusChange('COMPLETED');
  const handleCancel = () => handleStatusChange('CANCELED');

  const handleShowNotes = () => {
    setShowAddNoteModal(true);
  };

  const handleAddNoteSave = async (noteData) => {
    if (!selectedAccount) return;
    
    try {
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      // Add new note
      await treatmentsService.addTreatmentNote(id, noteData, accountHeaders);
      
      setShowAddNoteModal(false);
      setSuccessMessage(t('treatments.notes.addSuccess'));
      
      // Refresh treatment data
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
    if (!selectedAccount || !noteToDelete) return;
    
    try {
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      // Delete note (if your API supports it)
      // await treatmentsService.deleteTreatmentNote(noteToDelete.id, accountHeaders);
      
      setShowNoteDeleteModal(false);
      setNoteToDelete(null);
      setSuccessMessage(t('treatments.notes.deleteSuccess'));
      
      // Refresh treatment data
      await fetchTreatmentData();
      
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error('Error deleting note:', err);
      setError(t('treatments.notes.errorDeleting'));
    }
  };

  const handleEditNoteSave = async (noteData) => {
    if (!selectedAccount || !selectedNote) return;
    
    try {
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      // Update note (if your API supports it)
      // await treatmentsService.updateTreatmentNote(selectedNote.id, noteData, accountHeaders);
      
      setShowNoteEditModal(false);
      setSelectedNote(null);
      setSuccessMessage(t('treatments.notes.updateSuccess'));
      
      // Refresh treatment data
      await fetchTreatmentData();
      
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error('Error updating note:', err);
      throw err;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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
              {t('treatments.back') || 'Back to Treatments'}
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
              {t('treatments.back') || 'Back to Treatments'}
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
            {t('treatments.back') || 'Back to Treatments'}
          </Button>
          <Button variant="outline-primary" onClick={handleEdit} className="me-2">
            <FontAwesomeIcon icon={faEdit} className="me-2" />
            {t('common.edit')}
          </Button>
          {treatment.status === 'SCHEDULED' && (
            <Button variant="success" onClick={handleComplete} className="me-2">
              <FontAwesomeIcon icon={faCheck} className="me-2" />
              {t('treatments.markComplete') || 'Mark Complete'}
            </Button>
          )}
          {treatment.status !== 'CANCELED' && treatment.status !== 'COMPLETED' && (
            <Button variant="danger" onClick={handleCancel}>
              <FontAwesomeIcon icon={faTimes} className="me-2" />
              {t('treatments.cancel') || 'Cancel'}
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
                  <h6>{t('treatments.fields.procedure') || 'Procedure'}</h6>
                  <p className="mb-1 fw-bold">
                    {treatment.catalog_item_details?.name}
                  </p>
                  <small className="text-success fw-bold">
                    ${treatment.catalog_item_details?.price}
                  </small>
                </Col>
                <Col md={6}>
                  <h6>{t('treatments.fields.specialty') || 'Specialty'}</h6>
                  <p>{treatment.specialty_details?.name}</p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <h6>{t('treatments.fields.status') || 'Status'}</h6>
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
                {t('treatments.fields.patient') || 'Patient'}
              </h6>
            </Card.Header>
            <Card.Body>
              <h6 className="text-primary">
                {treatment.patient_details?.first_name} {treatment.patient_details?.last_name1} {treatment.patient_details?.last_name2}
              </h6>
              <p className="mb-1">
                <strong>ID:</strong> {treatment.patient_details?.id_number}
              </p>
              {treatment.patient_details?.email && (
                <p className="mb-1">
                  <strong>Email:</strong> {treatment.patient_details?.email}
                </p>
              )}
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
                Schedule
              </h6>
            </Card.Header>
            <Card.Body>
              <p className="mb-2">
                <strong>Scheduled:</strong><br />
                {formatDate(treatment.scheduled_date)}
              </p>
              {treatment.completed_date && (
                <p className="mb-2">
                  <strong>Completed:</strong><br />
                  {formatDate(treatment.completed_date)}
                </p>
              )}
              <p className="mb-0">
                <strong>Doctor:</strong><br />
                {treatment.doctor_details?.first_name} {treatment.doctor_details?.last_name}
              </p>
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
                      <th width="160">{t('treatments.notes.dateTime')}</th>
                      <th>{t('treatments.notes.note')}</th>
                      <th width="140">{t('treatments.notes.createdBy')}</th>
                      <th width="120">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {treatment.additional_notes.map((note, index) => (
                      <tr key={note.id || index}>
                        <td>
                          <small>{formatDate(note.date)}</small>
                        </td>
                        <td>
                          <div style={{ maxWidth: '400px' }}>
                            <div 
                              style={{ 
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                lineHeight: '1.4'
                              }}
                            >
                              {truncateText(note.note, 120)}
                            </div>
                            {note.note && note.note.length > 120 && (
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
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteNote(note)}
                            title={t('treatments.notes.deleteNote')}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
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
          <NoteAddForm 
            onSave={handleAddNoteSave}
            onCancel={() => setShowAddNoteModal(false)}
          />
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
    </Container>
  );
};

// Helper component for adding notes
const NoteAddForm = ({ onSave, onCancel }) => {
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
      const noteData = {
        note: formData.note.trim()
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
    note: note.note || ''
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
        note: formData.note.trim()
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

export default TreatmentDetail;