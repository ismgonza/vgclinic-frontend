// src/pages/clinic/TeamMembers.jsx - FIXED to use centralized roles
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faEye, faUsers, faArrowLeft, faUserMinus, faUserCheck } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { AccountContext } from '../../contexts/AccountContext';
import { useRoles } from '../../utils/roleUtils'; // ADDED: Import centralized roles
import teamMembersService from '../../services/teamMembers.service';
import catalogService from '../../services/catalog.service';

const TeamMembers = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { selectedAccount } = useContext(AccountContext);
  const { getAllRoles, getRoleBadgeColor } = useRoles(); // ADDED: Use centralized roles
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    role: '',
    specialty: '',
    phone_number: '',
    color: '#3498db' // default blue color
  });
  const [specialties, setSpecialties] = useState([]);

  // ADDED: Get all roles from centralized utility
  const roleOptions = getAllRoles();

  // Reload members when account changes
  useEffect(() => {
    if (selectedAccount) {
      fetchMembers();
      fetchSpecialties();
    } else {
      // Clear members if no account selected
      setMembers([]);
      setSpecialties([]);
      setLoading(false);
    }
  }, [selectedAccount]);

  const fetchMembers = async () => {
    if (!selectedAccount) return;
    
    try {
      setLoading(true);
      
      // Set account context for API calls
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      const data = await teamMembersService.getTeamMembers({}, accountHeaders);
      setMembers(data.results || data);
      setError(null);
      
      console.log('Loaded team members for account:', selectedAccount.account_name);
      console.log('Members count:', (data.results || data).length);
      
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError(t('team.members.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    if (!selectedAccount) return;
    
    try {
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      const data = await catalogService.getSpecialties(accountHeaders);
      setSpecialties(data.results || data);
    } catch (err) {
      console.error('Error fetching specialties:', err);
    }
  };

  const handleRemoveClick = (member) => {
    if (!selectedAccount) {
      setError(t('team.selectAccountFirst') || 'Please select a clinic first');
      return;
    }
    setMemberToRemove(member);
    setShowRemoveModal(true);
  };

  const handleRemoveConfirm = async () => {
    if (!selectedAccount) return;
    
    try {
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      await teamMembersService.removeTeamMember(memberToRemove.id, accountHeaders);
      setMembers(members.filter(m => m.id !== memberToRemove.id));
      setShowRemoveModal(false);
      setMemberToRemove(null);
      setSuccessMessage(t('team.members.memberRemoved'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error removing team member:', err);
      setError(t('team.members.errorRemoving'));
    }
  };

  const handleStatusToggle = async (member) => {
    if (!selectedAccount) return;
    
    try {
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      if (member.is_active_in_account) {
        await teamMembersService.deactivateTeamMember(member.id, accountHeaders);
        setSuccessMessage(t('team.members.memberDeactivated'));
      } else {
        await teamMembersService.reactivateTeamMember(member.id, accountHeaders);
        setSuccessMessage(t('team.members.memberReactivated'));
      }
      
      // Refresh members list
      await fetchMembers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating member status:', err);
      setError(t('team.members.errorRemoving'));
    }
  };

  const handleEditClick = (member) => {
    if (!selectedAccount) {
      setError(t('team.selectAccountFirst') || 'Please select a clinic first');
      return;
    }
    
    setMemberToEdit(member);
    // Pre-populate the form with current member data
    setEditForm({
      role: member.role || '',
      specialty: member.specialty_details?.id || '',
      phone_number: member.phone_number || '',
      color: member.color || '#3498db'
    });
    setShowEditModal(true);
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAccount || !memberToEdit) return;
  
    // Simple validation: if role is doctor, specialty should be selected
    if (editForm.role === 'doc' && !editForm.specialty) {
      setError(t('team.members.edit.doctorNeedsSpecialty') || 'Doctors must have a specialty selected');
      return;
    }
  
    try {
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
  
      const updateData = {
        role: editForm.role,
        specialty: editForm.specialty || null,
        phone_number: editForm.phone_number,
        color: editForm.color
      };
  
      await teamMembersService.updateTeamMember(memberToEdit.id, updateData, accountHeaders);
      
      setShowEditModal(false);
      setMemberToEdit(null);
      setSuccessMessage(t('team.members.memberUpdated') || 'Team member updated successfully');
      
      // Refresh members list
      await fetchMembers();
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error('Error updating team member:', err);
      setError(t('team.members.errorUpdating') || 'Error updating team member');
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // UPDATED: Use centralized role badge function
  const getRoleBadgeVariant = (role) => {
    const bootstrapClass = getRoleBadgeColor(role);
    // Convert bg-danger to danger, bg-primary to primary, etc.
    return bootstrapClass.replace('bg-', '');
  };

  // Show message if no account selected
  if (!selectedAccount) {
    return (
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <Button 
              variant="outline-secondary" 
              className="mb-3"
              onClick={() => navigate('/clinic/team')}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              {t('team.members.back')}
            </Button>
            <h1 className="h3">{t('team.members.title')}</h1>
            <p className="text-muted">{t('team.members.description')}</p>
          </Col>
        </Row>
        
        <Card>
          <Card.Body>
            <div className="text-center py-4 text-muted">
              <FontAwesomeIcon icon={faUsers} size="3x" className="mb-3" />
              <p>{t('team.selectAccountFirst')}</p>
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
          <Button 
            variant="outline-secondary" 
            className="mb-3"
            onClick={() => navigate('/clinic/team')}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            {t('team.members.back')}
          </Button>
          <h1 className="h3">{t('team.members.title')}</h1>
          <p className="text-muted">{t('team.members.description')}</p>
          <small className="text-muted">
            {t('navigation.acctSelector.current')}: <strong>{selectedAccount.account_name}</strong>
          </small>
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
            <span>{t('team.members.title')}</span>
            <small className="text-muted">
              {loading ? t('common.loading') : `${members.length} members`}
            </small>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary" />
              <p className="mt-3">{t('common.loading')}...</p>
            </div>
          ) : members.length === 0 ? (
            <Alert variant="info">{t('team.members.noMembers')}</Alert>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>{t('team.members.name')}</th>
                  <th>{t('team.members.email')}</th>
                  <th>{t('team.members.role')}</th>
                  <th>{t('team.members.specialty')}</th>
                  <th>{t('team.members.color')}</th>
                  <th>{t('team.members.status')}</th>
                  <th>{t('team.members.joinDate')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {members.map(member => (
                  <tr key={member.id}>
                    <td>{member.user_details?.full_name || `${member.user_details?.first_name} ${member.user_details?.last_name}`}</td>
                    <td>
                      {member.user_details?.email && (
                        <a href={`mailto:${member.user_details.email}`} className="text-decoration-none">
                          {member.user_details.email}
                        </a>
                      )}
                    </td>
                    <td>
                      <Badge bg={getRoleBadgeVariant(member.role)}>
                        {t(`roles.${member.role}`, member.role)}
                      </Badge>
                    </td>
                    <td>{member.specialty_details?.name || '-'}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div 
                          style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: member.color || '#3498db',
                            borderRadius: '4px',
                            marginRight: '8px',
                            border: '1px solid #ddd'
                          }}
                        ></div>
                        <small className="text-muted" style={{ fontFamily: 'monospace' }}>
                          {member.color || '#3498db'}
                        </small>
                      </div>
                    </td>
                    <td>
                      <Badge bg={member.is_active_in_account ? "success" : "secondary"}>
                        {member.is_active_in_account ? t('team.members.active') : t('team.members.inactive')}
                      </Badge>
                    </td>
                    <td>{formatDate(member.created_at)}</td>
                    <td>
                      <Button 
                        variant={member.is_active_in_account ? "outline-warning" : "outline-success"}
                        size="sm" 
                        className="me-1"
                        title={member.is_active_in_account ? t('team.members.deactivate') : t('team.members.reactivate')}
                        onClick={() => handleStatusToggle(member)}
                      >
                        <FontAwesomeIcon icon={member.is_active_in_account ? faUserMinus : faUserCheck} />
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        className="me-1"
                        title={t('team.members.edit')}
                        onClick={() => handleEditClick(member)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        title={t('team.members.remove')}
                        onClick={() => handleRemoveClick(member)}
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
      
      {/* Remove Confirmation Modal */}
      <Modal show={showRemoveModal} onHide={() => setShowRemoveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('team.members.remove')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('team.members.confirmRemove')}
          {memberToRemove && (
            <p className="mt-2 fw-bold">
              {memberToRemove.user_details?.full_name || `${memberToRemove.user_details?.first_name} ${memberToRemove.user_details?.last_name}`}
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRemoveModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleRemoveConfirm}>
            {t('common.confirm')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* FIXED Edit Member Modal - Using centralized roles */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t('team.members.edit.title') || 'Edit Team Member'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            {memberToEdit && (
              <div className="mb-3">
                <strong>{memberToEdit.user_details?.full_name || `${memberToEdit.user_details?.first_name} ${memberToEdit.user_details?.last_name}`}</strong>
                <br />
                <small className="text-muted">{memberToEdit.user_details?.email}</small>
              </div>
            )}
            
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>{t('team.members.role') || 'Role'} *</Form.Label>
                  <Form.Select
                    value={editForm.role}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                    required
                  >
                    <option value="">{t('team.members.edit.selectRole') || 'Select Role'}</option>
                    {/* FIXED: Use centralized role options */}
                    {roleOptions.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>{t('team.members.specialty') || 'Specialty'}</Form.Label>
                  <Form.Select
                    value={editForm.specialty}
                    onChange={(e) => setEditForm({...editForm, specialty: e.target.value})}
                    disabled={editForm.role !== 'doc'}
                  >
                    <option value="">{t('team.members.edit.selectSpecialty') || 'Select Specialty'}</option>
                    {specialties.map(specialty => (
                      <option key={specialty.id} value={specialty.id}>
                        {specialty.name}
                      </option>
                    ))}
                  </Form.Select>
                  {editForm.role === 'doc' && (
                    <Form.Text className="text-muted">
                      {t('team.members.edit.specialtyRequired') || 'Specialty is required for doctors'}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>{t('team.members.edit.phoneNumber') || 'Phone Number'}</Form.Label>
                  <Form.Control
                    type="tel"
                    value={editForm.phone_number}
                    onChange={(e) => setEditForm({...editForm, phone_number: e.target.value})}
                    placeholder={t('team.members.edit.phoneNumberPlaceholder') || 'Enter phone number'}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>{t('team.members.edit.displayColor') || 'Display Color'}</Form.Label>
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="color"
                      value={editForm.color}
                      onChange={(e) => setEditForm({...editForm, color: e.target.value})}
                      style={{ width: '60px', height: '38px', marginRight: '10px' }}
                    />
                    <Form.Control
                      type="text"
                      value={editForm.color}
                      onChange={(e) => setEditForm({...editForm, color: e.target.value})}
                      placeholder="#3498db"
                      style={{ fontFamily: 'monospace' }}
                    />
                  </div>
                  <Form.Text className="text-muted">
                    {t('team.members.edit.colorHelp') || 'Color used for calendar and appointments'}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowEditModal(false)}
            >
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button 
              variant="primary" 
              type="submit"
            >
              {t('common.save') || 'Save Changes'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default TeamMembers;