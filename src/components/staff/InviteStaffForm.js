// src/components/staff/InviteStaffForm.js
import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import staffService from '../../services/staffService';
import { useAccount } from '../../context/AccountContext';

// Validation schema
const InviteSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  role: Yup.string()
    .required('Role is required'),
});

const InviteStaffForm = () => {
  const navigate = useNavigate();
  const { currentAccount } = useAccount();
  const [inviteSent, setInviteSent] = useState(false);
  
  const initialValues = {
    email: '',
    role: 'doctor', // Default role
    account: currentAccount?.id || '',
  };

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      await staffService.inviteStaffMember(values);
      setInviteSent(true);
    } catch (err) {
      console.error('Error sending invitation:', err);
      setStatus({ 
        error: 'Failed to send invitation. Please check your inputs and try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (inviteSent) {
    return (
      <Card>
        <Card.Body>
          <Alert variant="success">
            <Alert.Heading>Invitation Sent!</Alert.Heading>
            <p>An invitation has been sent to the email address. The recipient will need to click the link in the email to complete their profile setup.</p>
          </Alert>
          <div className="d-flex justify-content-end">
            <Button 
              variant="primary" 
              onClick={() => navigate('/staff')}
            >
              Return to Staff List
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Invite New Staff Member</h5>
      </Card.Header>
      <Card.Body>
        <Formik
          initialValues={initialValues}
          validationSchema={InviteSchema}
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
              
              <input type="hidden" name="account" value={values.account} />
              
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.email && errors.email}
                  placeholder="Enter their email address"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  name="role"
                  value={values.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.role && errors.role}
                >
                  <option value="doctor">Doctor</option>
                  <option value="assistant">Assistant</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="administrator">Administrator</option>
                  <option value="other">Other</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.role}
                </Form.Control.Feedback>
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button 
                  variant="secondary" 
                  className="me-2"
                  onClick={() => navigate('/staff')}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card.Body>
    </Card>
  );
};

export default InviteStaffForm;