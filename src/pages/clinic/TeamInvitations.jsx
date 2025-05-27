// src/pages/clinic/TeamInvitations.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faArrowLeft, faEnvelope, faRedo, faTimes, faUsers } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { AccountContext } from '../../contexts/AccountContext';
import invitationsService from '../../services/invitations.service';
import catalogService from '../../services/catalog.service';

const TeamInvitations = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { selectedAccount } = useContext(AccountContext);
  
  const [invitations, setInvitations] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form state
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: '',
    specialty: '',
    personal_message: ''
  });

  // Hardcoded role options (matching your backend)
  const roleOptions = [
    { value: 'adm', label: t('invitations.form.roles.adm') },
    { value: 'doc', label: t('invitations.form.roles.doc') },
    { value: 'ast', label: t('invitations.form.roles.ast') },
    { value: 'rdo', label: t('invitations.form.roles.rdo') }
  ];

  // Using actual specialties from API
  const specialtyOptions = specialties;

  // Reload invitations when account changes
  useEffect(() => {
    if (selectedAccount) {
      fetchInvitations();
      fetchSpecialties();
    } else {
      setInvitations([]);
      setSpecialties([]);
      setLoading(false);
    }
  }, [selectedAccount]);

  const fetchInvitations = async () => {
    if (!selectedAccount) return;
    
    try {
      setLoading(true);
      
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      const data = await invitationsService.getInvitations({}, accountHeaders);
      setInvitations(data.results || data);
      setError(null);
      
      console.log('Loaded invitations for account:', selectedAccount.account_name);
      console.log('Invitations count:', (data.results || data).length);
      
    } catch (err) {
      console.error('Error fetching invitations:', err);
      setError(t('team.invitations.messages.errorLoading'));
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
      
      console.log('Loaded specialties for account:', selectedAccount.account_name);
      console.log('Specialties count:', (data.results || data).length);
      
    } catch (err) {
      console.error('Error fetching specialties:', err);
      // Don't show error for specialties, just log it
    }
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    if (!selectedAccount) return;

    try {
      setFormSubmitting(true);
      
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };

      const invitationData = {
        email: inviteForm.email,
        role: inviteForm.role,
        specialty: inviteForm.specialty || null,
        personal_message: inviteForm.personal_message || '',
        account: selectedAccount.account_id
      };

      await invitationsService.sendInvitation(invitationData, accountHeaders);
      
      setSuccessMessage(t('team.invitations.messages.invitationSent'));
      setShowInviteForm(false);
      setInviteForm({ email: '', role: '', specialty: '', personal_message: '' });
      
      // Refresh invitations list
      await fetchInvitations();
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error('Error sending invitation:', err);
      setError(t('team.invitations.messages.errorSending'));
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleResendInvitation = async (invitation) => {
    if (!selectedAccount) return;

    try {
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };

      await invitationsService.resendInvitation(invitation.id, accountHeaders);
      setSuccessMessage(t('team.invitations.messages.invitationResent'));
      
      // Refresh invitations list
      await fetchInvitations();
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error('Error resending invitation:', err);
      setError(t('team.invitations.messages.errorResending'));
    }
  };

  const handleRevokeInvitation = async (invitation) => {
    if (!selectedAccount) return;

    try {
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };

      await invitationsService.revokeInvitation(invitation.id, accountHeaders);
      setSuccessMessage(t('team.invitations.messages.invitationRevoked'));
      
      // Refresh invitations list
      await fetchInvitations();
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error('Error revoking invitation:', err);
      setError(t('team.invitations.messages.errorRevoking'));
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'expired': return 'secondary';
      case 'revoked': return 'danger';
      default: return 'secondary';
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'adm': return 'primary';
      case 'doc': return 'success';
      case 'ast': return 'info';
      case 'rdo': return 'secondary';
      default: return 'secondary';
    }
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
            <Button 
              variant="outline-secondary" 
              className="mb-3"
              onClick={() => navigate('/clinic/team')}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              {t('team.invitations.back')}
            </Button>
            <h1 className="h3">{t('team.invitations.title')}</h1>
            <p className="text-muted">{t('team.invitations.description')}</p>
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
            {t('team.invitations.back')}
          </Button>
          <h1 className="h3">{t('team.invitations.title')}</h1>
          <p className="text-muted">{t('team.invitations.description')}</p>
          <small className="text-muted">
            {t('navigation.acctSelector.current')}: <strong>{selectedAccount.account_name}</strong>
          </small>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowInviteForm(true)}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            {t('team.invitations.sendInvitation')}
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
            <span>{t('team.invitations.title')}</span>
            <small className="text-muted">
              {loading ? t('common.loading') : `${invitations.length} invitations`}
            </small>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary" />
              <p className="mt-3">{t('common.loading')}...</p>
            </div>
          ) : invitations.length === 0 ? (
            <Alert variant="info">{t('team.invitations.noInvitations')}</Alert>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>{t('team.invitations.email')}</th>
                  <th>{t('team.invitations.role')}</th>
                  <th>{t('team.invitations.specialty')}</th>
                  <th>{t('team.invitations.status')}</th>
                  <th>{t('team.invitations.sentDate')}</th>
                  <th>{t('team.invitations.expiresDate')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map(invitation => (
                  <tr key={invitation.id}>
                    <td>{invitation.email}</td>
                    <td>
                      <Badge bg={getRoleBadgeVariant(invitation.role)}>
                        {t(`invitations.form.roles.${invitation.role}`)}
                      </Badge>
                    </td>
                    <td>{invitation.specialty?.name || '-'}</td>
                    <td>
                      <Badge bg={getStatusBadgeVariant(invitation.status)}>
                        {t(`team.invitations.${invitation.status}`)}
                      </Badge>
                    </td>
                    <td>{formatDate(invitation.created_at)}</td>
                    <td>{formatDate(invitation.expires_at)}</td>
                    <td>
                      {invitation.status === 'pending' && (
                        <>
                          <Button 
                            variant="outline-info"
                            size="sm" 
                            className="me-1"
                            title={t('team.invitations.resend')}
                            onClick={() => handleResendInvitation(invitation)}
                          >
                            <FontAwesomeIcon icon={faRedo} />
                          </Button>
                          <Button 
                            variant="outline-warning"
                            size="sm"
                            title={t('team.invitations.revoke')}
                            onClick={() => handleRevokeInvitation(invitation)}
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </Button>
                        </>
                      )}
                      {invitation.status !== 'pending' && (
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

      {/* Send Invitation Modal */}
      <Modal show={showInviteForm} onHide={() => setShowInviteForm(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t('team.invitations.newInvitation')}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSendInvitation}>
          <Modal.Body>
            <Row>
              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>{t('team.invitations.email')} *</Form.Label>
                  <Form.Control
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                    required
                  />
                  <Form.Text className="text-muted">
                    {t('team.invitations.form.emailHelp')}
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>{t('team.invitations.role')} *</Form.Label>
                  <Form.Select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
                    required
                  >
                    <option value="">{t('team.invitations.form.selectRole')}</option>
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
                  <Form.Label>{t('team.invitations.specialty')}</Form.Label>
                  <Form.Select
                    value={inviteForm.specialty}
                    onChange={(e) => setInviteForm({...inviteForm, specialty: e.target.value})}
                  >
                    <option value="">{t('team.invitations.form.selectSpecialty')}</option>
                    {specialtyOptions.map(specialty => (
                      <option key={specialty.id} value={specialty.id}>
                        {specialty.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    {t('team.invitations.form.selectSpecialty')}
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>{t('team.invitations.personalMessage')}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={inviteForm.personal_message}
                    onChange={(e) => setInviteForm({...inviteForm, personal_message: e.target.value})}
                  />
                  <Form.Text className="text-muted">
                    {t('team.invitations.form.personalMessageHelp')}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowInviteForm(false)}
              disabled={formSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={formSubmitting}
            >
              {formSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {t('common.saving')}...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                  {t('team.invitations.form.send')}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default TeamInvitations;