// src/pages/staff/AcceptInvitePage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Alert, Spinner, Form, Button } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import staffService from '../../services/staffService';

const AcceptInviteSchema = Yup.object().shape({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  id_number: Yup.string()
    .matches(/^([1-9]-\d{4}-\d{4}|\d{12})$/, 'Enter a valid ID number (1-1234-1234 for citizens, 12 digits for residents)')
    .required('ID number is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const AcceptInvitePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const verifyInvitation = async () => {
      try {
        setLoading(true);
        const data = await staffService.verifyInvitation(token);
        setInvitation(data);
      } catch (err) {
        console.error('Error verifying invitation:', err);
        setError('This invitation is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    verifyInvitation();
  }, [token]);

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      await staffService.acceptInvitation(token, values);
      setCompleted(true);
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setStatus({ 
        error: 'Failed to complete registration. Please try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-5">
        <Card>
          <Card.Body>
            <Alert variant="danger">
              <Alert.Heading>Invalid Invitation</Alert.Heading>
              <p>{error}</p>
            </Alert>
          </Card.Body>
        </Card>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="container my-5">
        <Card>
          <Card.Body>
            <Alert variant="success">
              <Alert.Heading>Registration Completed!</Alert.Heading>
              <p>Your account has been set up successfully. You can now log in with your email and password.</p>
            </Alert>
            <div className="d-flex justify-content-center">
              <Button 
                variant="primary" 
                onClick={() => navigate('/login')}
              >
                Go to Login
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  if (!invitation) return null;

  return (
    <div className="container my-5">
      <Card>
        <Card.Header>
          <h3>Accept Invitation</h3>
        </Card.Header>
        <Card.Body>
          <Alert variant="info">
            <p>You've been invited to join <strong>{invitation.account_name}</strong> as a <strong>{invitation.role_display}</strong>.</p>
            <p>Please complete the registration form below to accept this invitation.</p>
          </Alert>

          <Formik
            initialValues={{
              first_name: '',
              last_name: '',
              id_number: '',
              password: '',
              confirmPassword: '',
            }}
            validationSchema={AcceptInviteSchema}
            onSubmit={handleSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
              status,
            }) => (
              <Form onSubmit={handleSubmit}>
                {status && status.error && (
                  <Alert variant="danger">{status.error}</Alert>
                )}
                
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    value={invitation.email}
                    disabled
                  />
                  <Form.Text className="text-muted">
                    This is the email address the invitation was sent to.
                  </Form.Text>
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="first_name"
                        value={values.first_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.first_name && errors.first_name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.first_name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="last_name"
                        value={values.last_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.last_name && errors.last_name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.last_name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>ID Number (Cédula)</Form.Label>
                  <Form.Control
                    type="text"
                    name="id_number"
                    value={values.id_number}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.id_number && errors.id_number}
                    placeholder="1-1234-1234 or 123456789012"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.id_number}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Enter your national ID (cédula) or resident ID in the correct format.
                  </Form.Text>
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.password && errors.password}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.password}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.confirmPassword && errors.confirmPassword}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.confirmPassword}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <div className="d-flex justify-content-end">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : 'Complete Registration'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AcceptInvitePage;