import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import locationService from '../../services/locationService';
import { useAccount } from '../../context/AccountContext';

// Validation schema
const LocationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Location name is required')
    .max(100, 'Location name must be less than 100 characters'),
  province: Yup.string()
    .required('Province is required'),
  canton: Yup.string()
    .required('Canton is required'),
  district: Yup.string()
    .required('District is required'),
  address: Yup.string()
    .required('Address is required'),
  phone: Yup.string()
    .matches(/^[0-9+\- ]*$/, 'Phone number can only contain digits, +, -, and spaces'),
  email: Yup.string()
    .email('Invalid email address'),
  account: Yup.number()
    .required('Account is required'),
});

const LocationForm = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentAccount } = useAccount();

  // Initialize with account from context
  const [initialValues, setInitialValues] = useState({
    name: '',
    province: '',
    canton: '',
    district: '',
    address: '',
    phone: '',
    email: '',
    is_active: true,
    account: '',
  });
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set account from context when it's available
    if (currentAccount && !isEdit) {
      setInitialValues(prev => ({
        ...prev,
        account: currentAccount.id
      }));
    }
    
    // If editing, fetch the location data
    if (isEdit && id) {
      const fetchLocation = async () => {
        try {
          setLoading(true);
          const data = await locationService.getLocation(id);
          setInitialValues({
            name: data.name || '',
            province: data.province || '',
            canton: data.canton || '',
            district: data.district || '',
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
            is_active: data.is_active !== undefined ? data.is_active : true,
            account: data.account || '',
          });
          setError(null);
        } catch (err) {
          console.error('Failed to fetch location:', err);
          setError('Failed to load location data. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      fetchLocation();
    }
  }, [currentAccount, isEdit, id]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEdit) {
        await locationService.updateLocation(id, values);
      } else {
        await locationService.createLocation(values);
      }
      navigate('/locations');
    } catch (err) {
      console.error('Error saving location:', err);
      setError('Failed to save location. Please check your inputs and try again.');
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
        <h5 className="mb-0">{isEdit ? 'Edit Location' : 'Create New Location'}</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Formik
          initialValues={initialValues}
          validationSchema={LocationSchema}
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
              {/* Hidden account field - would be set based on user's context */}
              <input type="hidden" name="account" value={values.account} />
              
              <Form.Group className="mb-3">
                <Form.Label>Location Name</Form.Label>
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

              <Row>
                <Form.Group as={Col} md={4} className="mb-3">
                  <Form.Label>Province</Form.Label>
                  <Form.Control
                    type="text"
                    name="province"
                    value={values.province}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.province && errors.province}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.province}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group as={Col} md={4} className="mb-3">
                  <Form.Label>Canton</Form.Label>
                  <Form.Control
                    type="text"
                    name="canton"
                    value={values.canton}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.canton && errors.canton}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.canton}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group as={Col} md={4} className="mb-3">
                  <Form.Label>District</Form.Label>
                  <Form.Control
                    type="text"
                    name="district"
                    value={values.district}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.district && errors.district}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.district}
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="address"
                  value={values.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.address && errors.address}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.address}
                </Form.Control.Feedback>
              </Form.Group>

              <Row>
                <Form.Group as={Col} md={6} className="mb-3">
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

                <Form.Group as={Col} md={6} className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.email && errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>

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

              <div className="d-flex justify-content-end">
                <Button 
                  variant="secondary" 
                  className="me-2"
                  onClick={() => navigate('/locations')}
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

export default LocationForm;