import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
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

const RoomEditForm = () => {
  const navigate = useNavigate();
  const { id: locationId, roomId } = useParams();
  const [initialValues, setInitialValues] = useState({
    name: '',
    is_active: true,
    is_private: false,
    location: locationId,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const room = await locationService.getRoom(roomId);
        setInitialValues({
          name: room.name || '',
          is_active: room.is_active !== undefined ? room.is_active : true,
          is_private: room.is_private !== undefined ? room.is_private : false,
          location: room.location || locationId,
        });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch room:', err);
        setError('Failed to load room data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId, locationId]);

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      await locationService.updateRoom(roomId, values);
      navigate(`/locations/${locationId}`);
    } catch (err) {
      console.error('Error updating room:', err);
      let errorMessage = 'Failed to update room. Please try again.';
      
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'object') {
          const errorDetails = Object.entries(err.response.data)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
            
          if (errorDetails) {
            errorMessage = `Error: ${errorDetails}`;
          }
        } else if (typeof err.response.data === 'string') {
          errorMessage = `Error: ${err.response.data}`;
        }
      }
      
      setStatus({ error: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Edit Room</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Formik
          initialValues={initialValues}
          validationSchema={RoomSchema}
          onSubmit={handleSubmit}
          enableReinitialize
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
                  {isSubmitting ? 'Saving...' : 'Update'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card.Body>
    </Card>
  );
};

export default RoomEditForm;