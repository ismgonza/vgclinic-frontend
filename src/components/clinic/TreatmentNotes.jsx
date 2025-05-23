// src/components/clinic/TreatmentNotes.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Button, Form, Alert, Table, Modal, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSave, faTimes, faEye } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { AccountContext } from '../../contexts/AccountContext';
import treatmentsService from '../../services/treatments.service';

const TreatmentNotes = ({ treatmentId, onNotesUpdate, onClose }) => {
  const { t } = useTranslation();
  const { selectedAccount } = useContext(AccountContext);
  
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    note: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedAccount && treatmentId) {
      fetchNotes();
    }
  }, [selectedAccount, treatmentId]);

  const fetchNotes = async () => {
    if (!selectedAccount) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      const notesData = await treatmentsService.getTreatmentNotes(treatmentId, accountHeaders);
      setNotes(notesData.results || notesData);
      
    } catch (err) {
      console.error('Error fetching treatment notes:', err);
      setError(t('treatments.notes.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = () => {
    setFormData({
      note: ''
    });
    setFormErrors({});
    setShowAddForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!selectedAccount) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      const noteData = {
        note: formData.note.trim(),
        treatment: parseInt(treatmentId)
        // Date will be automatically set by the backend to current timestamp
      };
      
      if (editingNote) {
        // This shouldn't happen in this simplified version
        setSuccessMessage(t('treatments.notes.updateSuccess'));
      } else {
        // Add new note
        await treatmentsService.addTreatmentNote(treatmentId, noteData, accountHeaders);
        setSuccessMessage(t('treatments.notes.addSuccess'));
      }
      
      setShowAddForm(false);
      await fetchNotes();
      
      // Notify parent component
      if (onNotesUpdate) {
        onNotesUpdate();
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error('Error saving note:', err);
      setError(err.response?.data?.detail || t('treatments.notes.errorSaving'));
    } finally {
      setSaving(false);
    }
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setFormData({
      note: ''
    });
    setFormErrors({});
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!selectedAccount) {
    return (
      <Alert variant="info">
        {t('treatments.notes.selectAccountFirst')}
      </Alert>
    );
  }

  return (
    <div>
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

      {/* Add Note Form */}
      {showAddForm && (
        <Card className="mb-4">
          <Card.Header>
            <h6 className="mb-0">
              {t('treatments.notes.addNote')}
            </h6>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleFormSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>{t('treatments.notes.noteLabel')} *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="note"
                  value={formData.note}
                  onChange={handleFormChange}
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
                  onClick={handleFormCancel}
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
          </Card.Body>
        </Card>
      )}

      {/* Notes List */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">{t('treatments.notes.title')}</h6>
          {!showAddForm && (
            <Button variant="primary" size="sm" onClick={handleAddNote}>
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              {t('treatments.notes.newNote')}
            </Button>
          )}
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status" variant="primary" />
              <p className="mt-3">{t('treatments.notes.loading')}</p>
            </div>
          ) : notes.length === 0 ? (
            <Alert variant="info">
              {t('treatments.notes.noNotes')}
            </Alert>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th width="160">{t('treatments.notes.dateTime')}</th>
                  <th>{t('treatments.notes.note')}</th>
                  <th width="140">{t('treatments.notes.createdBy')}</th>
                  <th width="100">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((note, index) => (
                  <tr key={note.id || index}>
                    <td>
                      <small>{formatDate(note.date)}</small>
                    </td>
                    <td>
                      <div style={{ maxWidth: '400px' }}>
                        <div 
                          title={note.note} 
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
                        onClick={() => {/* View handled by parent */}}
                        title={t('treatments.notes.viewNote')}
                        disabled
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default TreatmentNotes;