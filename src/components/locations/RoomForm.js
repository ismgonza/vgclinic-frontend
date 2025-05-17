import React from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import locationService from '../../services/locationService';

// Validation schema
const RoomSchema = Yup.object().shape({
  name: Yup.string()
    .required('Room name is required')
    .max(100, 'Room name must be less than 100 characters'),
  is_active: Yup.boolean(),
  is_private: Yup.boolean(),
  location: Yup.number().required('Location is required'),
});

const RoomForm = () => {
  const navigate = useNavigate();
  const { id: locationId } = useParams();  // Changed to match the parameter name in your route
  const initialValues = {
    name: '',
    is_active: true,
    is_private: false,
    location: locationId,
  };

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      console.log("Submitting room with values:", values);
      const response = await locationService.createRoom(values);
      console.log("Room created successfully:", response);
      navigate(`/locations/${locationId}`);
    } catch (err) {
      console.error('Error creating room:', err);
      let errorMessage = 'Failed to create room. Please try again.';
      
      // Extract specific error messages from the response if available
      if (err.response && err.response.data) {
        console.error('Response data:', err.response.data);
        
        // If the error is an object with field-specific errors
        if (typeof err.response.data === 'object') {
          const errorDetails = Object.entries(err.response.data)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
            
          if (errorDetails) {
            errorMessage = `Error: ${errorDetails}`;
          }
        } 
        // If the error is a string
        else if (typeof err.response.data === 'string') {
          errorMessage = `Error: ${err.response.data}`;
        }
      }
      
      setStatus({ error: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Add New Room</h5>
      </Card.Header>
      <Card.Body>
        <Formik
          initialValues={initialValues}
          validationSchema={RoomSchema}
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
              
              <input type="hidden" name="location" value={values.location} />
              
              <Form.Group className="mb-3">
                <Form.Label>Room Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.name && errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="is_active"
                  name="is_active"
                  label="Active"
                  checked={values.is_active}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="is_private"
                  name="is_private"
                  label="Private Room"
                  checked={values.is_private}
                  onChange={handleChange}
                />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button 
                  variant="secondary" 
                  className="me-2"
                  onClick={() => navigate(`/locations/${locationId}`)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Create'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card.Body>
    </Card>
  );
};

export default RoomForm;