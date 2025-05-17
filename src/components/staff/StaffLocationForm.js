// src/components/staff/StaffLocationForm.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import staffService from '../../services/staffService';
import locationService from '../../services/locationService';

// Validation schema
const StaffLocationSchema = Yup.object().shape({
  location: Yup.number().required('Location is required'),
  is_primary: Yup.boolean(),
});

const StaffLocationForm = ({ isEdit = false, onSuccess }) => {
  const navigate = useNavigate();
  const { id: staffId, locationId } = useParams();
  const [availableLocations, setAvailableLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const initialValues = {
    staff: staffId,
    location: '',
    is_primary: false,
  };
  
  const [formValues, setFormValues] = useState(initialValues);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get all locations
        const allLocations = await locationService.getLocations();
        
        if (!isEdit) {
          // Get locations already assigned to this staff member
          const staffLocations = await staffService.getStaffLocations(staffId);
          const assignedLocationIds = staffLocations.map(sl => sl.location);
          
          // Filter out already assigned locations
          const filteredLocations = allLocations.filter(
            loc => !assignedLocationIds.includes(loc.id)
          );
          
          setAvailableLocations(filteredLocations);
        } else {
          // If editing, we need all locations to select from
          setAvailableLocations(allLocations);
          
          // Get the specific staff location being edited
          const staffLocation = await staffService.getStaffLocation(locationId);
          setFormValues({
            staff: staffId,
            location: staffLocation.location,
            is_primary: staffLocation.is_primary,
          });
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isEdit, staffId, locationId]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEdit) {
        await staffService.updateStaffLocation(locationId, values);
      } else {
        await staffService.createStaffLocation(values);
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/staff/${staffId}`);
      }
    } catch (err) {
      console.error('Error saving location assignment:', err);
      setError('Failed to save location assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <Card.Body>
          <div className="text-center">Loading...</div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">{isEdit ? 'Edit Location Assignment' : 'Add Location Assignment'}</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        {!isEdit && availableLocations.length === 0 && (
          <Alert variant="info">
            All available locations are already assigned to this staff member.
          </Alert>
        )}
        
        {(isEdit || availableLocations.length > 0) && (
          <Formik
            initialValues={formValues}
            validationSchema={StaffLocationSchema}
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
            }) => (
              <Form onSubmit={handleSubmit}>
                <input type="hidden" name="staff" value={values.staff} />
                
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Select
                    name="location"
                    value={values.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.location && errors.location}
                    disabled={isEdit} // Can't change location when editing, only primary status
                  >
                    <option value="">Select Location</option>
                    {availableLocations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.location}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="is_primary"
                    name="is_primary"
                    label="Primary Location"
                    checked={values.is_primary}
                    onChange={handleChange}
                  />
                  <Form.Text className="text-muted">
                    Setting this as the primary location will change any existing primary location.
                  </Form.Text>
                </Form.Group>
                
                <div className="d-flex justify-content-end">
                  <Button 
                    variant="secondary" 
                    className="me-2"
                    onClick={() => onSuccess ? onSuccess() : navigate(`/staff/${staffId}`)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Add'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </Card.Body>
    </Card>
  );
};

export default StaffLocationForm;