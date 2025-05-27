// src/pages/InvitationAcceptance.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Alert, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import invitationsService from '../services/invitations.service';

const InvitationAcceptance = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // State
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form data for new users
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    id_type: '01', // Default to Cédula
    id_number: '',
    password: '',
    confirm_password: ''
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  const validateToken = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Validating token:', token);
      const invitationData = await invitationsService.validateToken(token);
      console.log('Invitation data:', invitationData);
      setInvitation(invitationData);
    } catch (err) {
      console.error('Error validating token:', err);
      
      if (err.response?.data?.expired) {
        setError(t('invitations.acceptance.expired'));
      } else if (err.response?.data?.invalid) {
        setError(t('invitations.acceptance.invalid'));
      } else {
        setError(t('invitations.acceptance.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Only validate if user doesn't exist (new user creation)
    if (!invitation?.user_exists) {
      if (!formData.first_name.trim()) {
        errors.first_name = t('validation.required');
      }
      
      if (!formData.last_name.trim()) {
        errors.last_name = t('validation.required');
      }
      
      if (!formData.id_number.trim()) {
        errors.id_number = t('validation.required');
      } else {
        // Validate ID number format based on type
        if (formData.id_type === '01' && !/^\d{9}$/.test(formData.id_number)) {
          errors.id_number = t('users.invalidCedula');
        } else if (formData.id_type === '02' && !/^\d{11,12}$/.test(formData.id_number)) {
          errors.id_number = t('users.invalidDimex');
        }
      }
      
      if (!formData.password) {
        errors.password = t('validation.required');
      } else if (formData.password.length < 8) {
        errors.password = t('validation.passwordLength');
      }
      
      if (formData.password !== formData.confirm_password) {
        errors.confirm_password = t('validation.passwordMatch');
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAcceptInvitation = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      // Prepare acceptance data based on whether user exists
      const acceptanceData = {
        token: token
      };

      // Only include user creation fields if user doesn't exist
      if (!invitation.user_exists) {
        acceptanceData.first_name = formData.first_name;
        acceptanceData.last_name = formData.last_name;
        acceptanceData.id_type = formData.id_type;
        acceptanceData.id_number = formData.id_number;
        acceptanceData.password = formData.password;
        acceptanceData.confirm_password = formData.confirm_password;
      }

      console.log('Accepting invitation with data:', acceptanceData);
      const result = await invitationsService.acceptInvitation(acceptanceData);
      console.log('Invitation accepted:', result);
      
      setSuccess(true);
      
      // Redirect to login after a delay
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: t('invitations.acceptance.success', { 
              clinicName: invitation.account_name 
            })
          }
        });
      }, 3000);
      
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError(err.response?.data?.message || t('invitations.acceptance.error'));
    } finally {
      setProcessing(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card>
              <Card.Body className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">{t('invitations.acceptance.loading')}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card>
              <Card.Body className="text-center py-5">
                <FontAwesomeIcon icon={faUserPlus} size="3x" className="text-danger mb-3" />
                <Alert variant="danger">{error}</Alert>
                <Button variant="primary" onClick={() => navigate('/login')}>
                  Go to Login
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Success state
  if (success) {
    return (
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card>
              <Card.Body className="text-center py-5">
                <FontAwesomeIcon icon={faCheckCircle} size="3x" className="text-success mb-3" />
                <h4>{t('invitations.acceptance.success', { clinicName: invitation.account_name })}</h4>
                <p className="text-muted">You will be redirected to login shortly...</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Main invitation acceptance form
  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card>
            <Card.Header className="text-center">
              <FontAwesomeIcon icon={faUserPlus} size="2x" className="text-primary mb-2" />
              <h4>{t('invitations.acceptance.title', { clinicName: invitation.account_name })}</h4>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <p className="text-center">
                  {invitation.user_exists 
                    ? t('invitations.acceptance.welcomeExisting', { 
                        clinicName: invitation.account_name,
                        role: invitation.role 
                      })
                    : t('invitations.acceptance.welcomeNew', { 
                        clinicName: invitation.account_name,
                        role: invitation.role 
                      })
                  }
                </p>
                
                {invitation.specialty && (
                  <p className="text-center text-muted">
                    <strong>Specialty:</strong> {invitation.specialty}
                  </p>
                )}
                
                {invitation.personal_message && (
                  <Alert variant="info">
                    <strong>{t('invitations.acceptance.personalMessage')}:</strong>
                    <br />
                    {invitation.personal_message}
                  </Alert>
                )}
              </div>

              <Form onSubmit={handleAcceptInvitation}>
                {!invitation.user_exists && (
                  <>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>{t('users.firstName')} *</Form.Label>
                          <Form.Control
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            isInvalid={!!formErrors.first_name}
                            required
                          />
                          <Form.Control.Feedback type="invalid">
                            {formErrors.first_name}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>{t('users.lastName')} *</Form.Label>
                          <Form.Control
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            isInvalid={!!formErrors.last_name}
                            required
                          />
                          <Form.Control.Feedback type="invalid">
                            {formErrors.last_name}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>{t('users.idType')} *</Form.Label>
                          <Form.Select
                            name="id_type"
                            value={formData.id_type}
                            onChange={handleInputChange}
                          >
                            <option value="01">{t('users.idTypeCedula')}</option>
                            <option value="02">{t('users.idTypeDimex')}</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>{t('users.idNumber')} *</Form.Label>
                          <Form.Control
                            type="text"
                            name="id_number"
                            value={formData.id_number}
                            onChange={handleInputChange}
                            isInvalid={!!formErrors.id_number}
                            placeholder={formData.id_type === '01' ? '123456789' : '123456789012'}
                            required
                          />
                          <Form.Control.Feedback type="invalid">
                            {formErrors.id_number}
                          </Form.Control.Feedback>
                          <Form.Text className="text-muted">
                            {formData.id_type === '01' ? t('users.cedulaHelp') : t('users.dimexHelp')}
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>{t('users.password')} *</Form.Label>
                          <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            isInvalid={!!formErrors.password}
                            required
                          />
                          <Form.Control.Feedback type="invalid">
                            {formErrors.password}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>{t('users.confirmPassword')} *</Form.Label>
                          <Form.Control
                            type="password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleInputChange}
                            isInvalid={!!formErrors.confirm_password}
                            required
                          />
                          <Form.Control.Feedback type="invalid">
                            {formErrors.confirm_password}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                )}

                <div className="d-grid">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg"
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        {t('invitations.acceptance.processing')}
                      </>
                    ) : (
                      invitation.user_exists 
                        ? t('invitations.acceptance.acceptButton')
                        : t('invitations.acceptance.createAccountButton')
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default InvitationAcceptance;