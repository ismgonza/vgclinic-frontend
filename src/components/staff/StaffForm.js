// src/components/staff/StaffForm.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import staffService from '../../services/staffService';
import locationService from '../../services/locationService';
import { useAccount } from '../../context/AccountContext';

// Validation schema
const StaffSchema = Yup.object().shape({
  // Account user information
  id_number: Yup.string()
    .matches(/^([1-9]-\d{4}-\d{4}|\d{12})$/, 'Enter a valid ID number (1-1234-1234 for citizens, 12 digits for residents)'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  first_name: Yup.string()
    .required('First name is required'),
  last_name: Yup.string()
    .required('Last name is required'),
  
  // Staff profile information
  job_title: Yup.string()
    .required('Job title is required'),
  staff_role: Yup.string()
    .required('Role is required'),
  license_number: Yup.string(),
  phone: Yup.string()
    .matches(/^[0-9+\- ]*$/, 'Phone number can only contain digits, +, -, and spaces'),
  
  // Settings
  is_active: Yup.boolean(),
  can_book_appointments: Yup.boolean(),
  appointment_color: Yup.string(),
  
  // Specialties
  specialties: Yup.array()
    .of(Yup.number())
});

const StaffForm = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentAccount } = useAccount();
  
  const [initialValues, setInitialValues] = useState({
    // Account user information
    id_number: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    
    // Staff profile information
    job_title: '',
    staff_role: 'doctor',
    license_number: '',
    phone: '',
    
    // Settings
    is_active: true,
    can_book_appointments: true,
    appointment_color: '#3788d8', // Default blue color
    
    // Specialties
    specialties: [],
    
    // Account
    account: '',
  });
  
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  
  useEffect(() => {
    // Set account from context when it's available
    if (currentAccount && !isEdit) {
      setInitialValues(prev => ({
        ...prev,
        account: currentAccount.id
      }));
    }
    
    // Fetch specialties
    const fetchSpecialties = async () => {
      try {
        const data = await staffService.getStaffSpecialties(currentAccount?.id);
        setSpecialties(data);
      } catch (err) {
        console.error('Failed to fetch specialties:', err);
      }
    };
    
    // If editing, fetch the staff data
    const fetchStaffData = async () => {
      if (isEdit && id) {
        try {
          setLoading(true);
          const data = await staffService.getStaffMember(id);
          
          // Extract user details
          const user = data.user_details;
          
          setInitialValues({
            // Account user information
            email: user.email || '',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            password: '', // Password is not returned from the API
            
            // Staff profile information
            job_title: data.job_title || '',
            staff_role: data.staff_role || 'doctor',
            license_number: data.license_number || '',
            phone: data.phone || '',
            
            // Settings
            is_active: data.is_active !== undefined ? data.is_active : true,
            can_book_appointments: data.can_book_appointments !== undefined ? data.can_book_appointments : true,
            appointment_color: data.appointment_color || '#3788d8',
            
            // Specialties
            specialties: data.specialties || [],
            
            // Account and account_user
            account: data.account_details?.id || '',
            account_user: data.account_user || '',
          });
          
          setError(null);
        } catch (err) {
          console.error('Failed to fetch staff data:', err);
          setError('Failed to load staff data. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchSpecialties();
    fetchStaffData();
  }, [currentAccount, isEdit, id]);
  
  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      if (isEdit) {
        await staffService.updateStaffMember(id, values);
      } else {
        await staffService.createStaffMember(values);
      }
      navigate('/staff');
    } catch (err) {
      console.error('Error saving staff member:', err);
      let errorMessage = 'Failed to save staff member. Please check your inputs and try again.';
      
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
        <h5 className="mb-0">{isEdit ? 'Edit Staff Member' : 'Create New Staff Member'}</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Formik
          initialValues={initialValues}
          validationSchema={StaffSchema}
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
            setFieldValue,
            status,
          }) => (
            <Form onSubmit={handleSubmit}>
              {status && status.error && (
                <Alert variant="danger">{status.error}</Alert>
              )}
              
              <input type="hidden" name="account" value={values.account} />
              {isEdit && <input type="hidden" name="account_user" value={values.account_user} />}
              
              <h5 className="mb-3">User Information</h5>
              <Row>
                <Col md={6}>
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
                      Enter the national ID (cédula) or resident ID. This helps avoid duplicate users.
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.email && errors.email}
                      disabled={isEdit} // Email should not be editable for existing users
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{isEdit ? 'New Password (leave blank to keep current)' : 'Password'}</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.password && errors.password}
                      required={!isEdit} // Password required for new users only
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
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
              
              <hr className="my-4" />
              
              <h5 className="mb-3">Professional Information</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Job Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="job_title"
                      value={values.job_title}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.job_title && errors.job_title}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.job_title}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Role</Form.Label>
                    <Form.Select
                      name="staff_role"
                      value={values.staff_role}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.staff_role && errors.staff_role}
                    >
                      <option value="doctor">Doctor</option>
                      <option value="assistant">Assistant</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="administrator">Administrator</option>
                      <option value="other">Other</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.staff_role}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>License Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="license_number"
                      value={values.license_number}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.license_number && errors.license_number}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.license_number}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      value={values.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.phone && errors.phone}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.phone}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              {specialties.length > 0 && (
                <Form.Group className="mb-3">
                  <Form.Label>Specialties</Form.Label>
                  <div>
                    {specialties.map(specialty => (
                      <Form.Check
                        key={specialty.id}
                        type="checkbox"
                        id={`specialty-${specialty.id}`}
                        label={specialty.name}
                        checked={values.specialties.includes(specialty.id)}
                        onChange={() => {
                          const currentSpecialties = [...values.specialties];
                          if (currentSpecialties.includes(specialty.id)) {
                            setFieldValue(
                              'specialties',
                              currentSpecialties.filter(id => id !== specialty.id)
                            );
                          } else {
                            setFieldValue(
                              'specialties',
                              [...currentSpecialties, specialty.id]
                            );
                          }
                        }}
                        inline
                      />
                    ))}
                  </div>
                </Form.Group>
              )}
              
              <hr className="my-4" />
              
              <h5 className="mb-3">Settings</h5>
              <Row>
                <Col md={6}>
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
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="can_book_appointments"
                      name="can_book_appointments"
                      label="Can Book Appointments"
                      checked={values.can_book_appointments}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Calendar Color</Form.Label>
                <Row>
                  <Col md={6}>
                    <Form.Control
                      type="color"
                      id="appointment_color"
                      name="appointment_color"
                      value={values.appointment_color}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      title="Choose a color for calendar events"
                      style={{ width: '100%' }}
                    />
                  </Col>
                  <Col md={6}>
                    <div className="d-flex align-items-center">
                      <div 
                        className="me-2"
                        style={{ 
                          width: '30px', 
                          height: '30px', 
                          backgroundColor: values.appointment_color,
                          borderRadius: '4px',
                          border: '1px solid #ddd'
                        }}
                      ></div>
                      <span>{values.appointment_color}</span>
                    </div>
                  </Col>
                </Row>
              </Form.Group>
              
              <div className="d-flex justify-content-end mt-4">
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
                  {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card.Body>
    </Card>
  );
};

export default StaffForm;