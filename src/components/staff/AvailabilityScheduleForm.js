// src/components/staff/AvailabilityScheduleForm.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import staffService from '../../services/staffService';
import locationService from '../../services/locationService';

// Validation schema
const ScheduleSchema = Yup.object().shape({
  location: Yup.number().required('Location is required'),
  day_of_week: Yup.number().required('Day is required'),
  start_time: Yup.string().required('Start time is required'),
  end_time: Yup.string()
    .required('End time is required')
    .test(
      'is-greater',
      'End time must be later than start time',
      function(value) {
        const { start_time } = this.parent;
        if (!start_time || !value) return true;
        return value > start_time;
      }
    ),
  is_available: Yup.boolean(),
});

const AvailabilityScheduleForm = ({ isEdit = false, onSuccess }) => {
  const navigate = useNavigate();
  const { id: staffId, scheduleId } = useParams();
  const [assignedLocations, setAssignedLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const initialValues = {
    staff: staffId,
    location: '',
    day_of_week: 0, // Monday
    start_time: '09:00',
    end_time: '17:00',
    is_available: true,
  };
  
  const [formValues, setFormValues] = useState(initialValues);
  
  const daysOfWeek = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
    { value: 6, label: 'Sunday' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get locations assigned to this staff member
        const staffLocations = await staffService.getStaffLocations(staffId);
        setAssignedLocations(staffLocations);
        
        if (isEdit && scheduleId) {
          // Fetch the specific schedule being edited
          const schedule = await staffService.getSchedule(scheduleId);
          setFormValues({
            staff: staffId,
            location: schedule.location,
            day_of_week: schedule.day_of_week,
            start_time: schedule.start_time.substring(0, 5), // HH:MM format
            end_time: schedule.end_time.substring(0, 5), // HH:MM format
            is_available: schedule.is_available,
          });
        } else if (staffLocations.length > 0) {
          // Set default location to the primary one or the first one
          const primaryLocation = staffLocations.find(loc => loc.is_primary);
          setFormValues(prev => ({
            ...prev,
            location: primaryLocation ? primaryLocation.location : staffLocations[0].location
          }));
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
  }, [isEdit, scheduleId, staffId]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEdit) {
        await staffService.updateSchedule(scheduleId, values);
      } else {
        await staffService.createSchedule(values);
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/staff/${staffId}`);
      }
    } catch (err) {
      console.error('Error saving schedule:', err);
      setError('Failed to save schedule. Please try again.');
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

  if (!isEdit && assignedLocations.length === 0) {
    return (
      <Card>
        <Card.Body>
          <Alert variant="warning">
            This staff member doesn't have any assigned locations yet. Please assign at least one location before adding a schedule.
          </Alert>
          <div className="d-flex justify-content-end">
            <Button 
              variant="primary" 
              onClick={() => navigate(`/staff/${staffId}/locations/add`)}
            >
              Assign Location
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">{isEdit ? 'Edit Schedule' : 'Add Schedule'}</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Formik
          initialValues={formValues}
          validationSchema={ScheduleSchema}
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
                  disabled={isEdit} // Can't change location when editing
                >
                  <option value="">Select Location</option>
                  {assignedLocations.map(loc => (
                    <option key={loc.id} value={loc.location}>
                      {loc.location_details.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.location}
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Day of Week</Form.Label>
                <Form.Select
                  name="day_of_week"
                  value={values.day_of_week}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.day_of_week && errors.day_of_week}
                >
                  {daysOfWeek.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.day_of_week}
                </Form.Control.Feedback>
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Start Time</Form.Label>
                    <Form.Control
                      type="time"
                      name="start_time"
                      value={values.start_time}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.start_time && errors.start_time}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.start_time}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>End Time</Form.Label>
                    <Form.Control
                      type="time"
                      name="end_time"
                      value={values.end_time}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.end_time && errors.end_time}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.end_time}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="is_available"
                  name="is_available"
                  label="Available for appointments"
                  checked={values.is_available}
                  onChange={handleChange}
                />
                <Form.Text className="text-muted">
                  Toggle this off to mark this time slot as unavailable (e.g., for breaks or out-of-office time).
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
      </Card.Body>
    </Card>
  );
};

export default AvailabilityScheduleForm;