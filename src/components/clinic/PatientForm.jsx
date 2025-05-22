// src/components/clinic/PatientForm.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Button, Row, Col, Card, Alert, Table } from 'react-bootstrap';
import CostaRicaGeoSelector from '../common/CostaRicaGeoSelector';
import accountsService from '../../services/accounts.service';

const PatientForm = ({ patient, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name1: '',
    last_name2: '',
    id_number: '',
    is_foreign: false,
    birth_date: '',
    gender: 'M',
    marital_status: 'S',
    email: '',
    province: '',
    canton: '',
    district: '',
    address: '',
    account: '',
    referral_source: '',
    consultation_reason: '',
    receive_notifications: false,
    // For nested objects
    phones: [],
    emergency_contacts: []
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // For managing phone numbers and emergency contacts
  const [phonesList, setPhonesList] = useState([]);
  const [emergencyContactsList, setEmergencyContactsList] = useState([]);
  const [tempPhone, setTempPhone] = useState({ phone_number: '', phone_type: 'P' });
  const [tempEmergencyContact, setTempEmergencyContact] = useState({ 
    first_name: '', 
    last_name1: '', 
    last_name2: '', 
    phone: '', 
    relationship: '' 
  });

  // Fetch accounts for the dropdown
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await accountsService.getAccounts();
        setAccounts(data);
      } catch (err) {
        console.error('Error fetching accounts:', err);
      }
    };
    fetchAccounts();
  }, []);

  // Initialize form with patient data if editing
  useEffect(() => {
    if (patient) {
      // Set main patient data
      setFormData({
        first_name: patient.first_name || '',
        last_name1: patient.last_name1 || '',
        last_name2: patient.last_name2 || '',
        id_number: patient.id_number || '',
        is_foreign: patient.is_foreign || false,
        birth_date: patient.birth_date ? new Date(patient.birth_date).toISOString().split('T')[0] : '',
        gender: patient.gender || 'M',
        marital_status: patient.marital_status || 'S',
        email: patient.email || '',
        province: patient.province || '',
        canton: patient.canton || '',
        district: patient.district || '',
        address: patient.address || '',
        // If a patient account is available, use its values
        account: patient.clinic_memberships && patient.clinic_memberships.length > 0 
          ? patient.clinic_memberships[0].account 
          : '',
        referral_source: patient.clinic_memberships && patient.clinic_memberships.length > 0 
          ? patient.clinic_memberships[0].referral_source 
          : '',
        consultation_reason: patient.clinic_memberships && patient.clinic_memberships.length > 0 
          ? patient.clinic_memberships[0].consultation_reason 
          : '',
        receive_notifications: patient.clinic_memberships && patient.clinic_memberships.length > 0 
          ? patient.clinic_memberships[0].receive_notifications 
          : false,
      });
      
      // Set phones and emergency contacts if available
      if (patient.phones) {
        setPhonesList(patient.phones);
      }
      
      if (patient.emergency_contacts) {
        setEmergencyContactsList(patient.emergency_contacts);
      }
    }
  }, [patient]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleGeoChange = (geoData) => {
    setFormData({
      ...formData,
      ...geoData
    });
  };

  // Phone management
  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    setTempPhone({
      ...tempPhone,
      [name]: value
    });
  };

  const addPhone = () => {
    if (!tempPhone.phone_number) return;
    
    const newPhone = {
      ...tempPhone,
      id: Date.now() // Temporary ID for UI purposes
    };
    
    setPhonesList([...phonesList, newPhone]);
    setTempPhone({ phone_number: '', phone_type: 'P' });
  };

  const removePhone = (id) => {
    setPhonesList(phonesList.filter(phone => phone.id !== id));
  };

  // Emergency contact management
  const handleEmergencyContactChange = (e) => {
    const { name, value } = e.target;
    setTempEmergencyContact({
      ...tempEmergencyContact,
      [name]: value
    });
  };

  const addEmergencyContact = () => {
    if (!tempEmergencyContact.first_name || !tempEmergencyContact.phone) return;
    
    const newContact = {
      ...tempEmergencyContact,
      id: Date.now() // Temporary ID for UI purposes
    };
    
    setEmergencyContactsList([...emergencyContactsList, newContact]);
    setTempEmergencyContact({ first_name: '', last_name1: '', last_name2: '', phone: '', relationship: '' });
  };

  const removeEmergencyContact = (id) => {
    setEmergencyContactsList(emergencyContactsList.filter(contact => contact.id !== id));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Basic validations
    if (!formData.first_name) newErrors.first_name = t('validation.required');
    if (!formData.last_name1) newErrors.last_name1 = t('validation.required');
    if (!formData.id_number) newErrors.id_number = t('validation.required');
    if (!formData.birth_date) newErrors.birth_date = t('validation.required');
    if (!formData.gender) newErrors.gender = t('validation.required');
    if (!formData.marital_status) newErrors.marital_status = t('validation.required');
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t('validation.invalidEmail');
    if (!formData.province) newErrors.province = t('validation.required');
    if (!formData.canton) newErrors.canton = t('validation.required');
    if (!formData.district) newErrors.district = t('validation.required');
    if (!formData.address) newErrors.address = t('validation.required');
    if (!formData.account) newErrors.account = t('validation.required');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Prepare data for submission
      const patientData = {
        ...formData,
        phones: phonesList.map(phone => ({
          phone_number: phone.phone_number,
          phone_type: phone.phone_type
        })),
        emergency_contacts: emergencyContactsList.map(contact => ({
          first_name: contact.first_name,
          last_name1: contact.last_name1,
          last_name2: contact.last_name2,
          phone: contact.phone,
          relationship: contact.relationship
        }))
      };
      
      // Call the onSave callback with the prepared data
      await onSave(patientData);
    } catch (err) {
      console.error('Error saving patient:', err);
      setError(err.response?.data?.detail || t('common.errorSaving'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        {patient ? t('patients.editPatient') : t('patients.newPatient')}
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <h5 className="mb-3">{t('patients.personalInfo')}</h5>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>{t('patients.firstName')}</Form.Label>
                <Form.Control
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  isInvalid={!!errors.first_name}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.first_name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>{t('patients.lastName1')}</Form.Label>
                <Form.Control
                  type="text"
                  name="last_name1"
                  value={formData.last_name1}
                  onChange={handleChange}
                  isInvalid={!!errors.last_name1}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.last_name1}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>{t('patients.lastName2')}</Form.Label>
                <Form.Control
                  type="text"
                  name="last_name2"
                  value={formData.last_name2}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>{t('patients.idNumber')}</Form.Label>
                <Form.Control
                  type="text"
                  name="id_number"
                  value={formData.id_number}
                  onChange={handleChange}
                  isInvalid={!!errors.id_number}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.id_number}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mt-4">
                <Form.Check
                  type="checkbox"
                  id="is_foreign"
                  name="is_foreign"
                  label={t('patients.foreign')}
                  checked={formData.is_foreign}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('patients.email')}</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>{t('patients.birthDate')}</Form.Label>
                <Form.Control
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  isInvalid={!!errors.birth_date}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.birth_date}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>{t('patients.gender')}</Form.Label>
                <Form.Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  isInvalid={!!errors.gender}
                  required
                >
                  <option value="M">{t('patients.male')}</option>
                  <option value="F">{t('patients.female')}</option>
                  <option value="O">{t('patients.other')}</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.gender}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>{t('patients.maritalStatus')}</Form.Label>
                <Form.Select
                  name="marital_status"
                  value={formData.marital_status}
                  onChange={handleChange}
                  isInvalid={!!errors.marital_status}
                  required
                >
                  <option value="S">{t('patients.single')}</option>
                  <option value="M">{t('patients.married')}</option>
                  <option value="D">{t('patients.divorced')}</option>
                  <option value="W">{t('patients.widowed')}</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.marital_status}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          {/* Address Information */}
          <h5 className="mb-3 mt-4">{t('patients.addressInfo')}</h5>
          
          <CostaRicaGeoSelector
            formData={{
              province: formData.province,
              canton: formData.canton,
              district: formData.district
            }}
            onChange={handleGeoChange}
            errors={errors}
            required={true}
          />
          
          <Form.Group className="mb-3">
            <Form.Label>{t('patients.address')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="address"
              value={formData.address}
              onChange={handleChange}
              isInvalid={!!errors.address}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.address}
            </Form.Control.Feedback>
          </Form.Group>
          
          {/* Phone Numbers */}
          <h5 className="mb-3 mt-4">{t('patients.phones')}</h5>
          
          <Row className="mb-3 align-items-end">
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('patients.phoneNumber')}</Form.Label>
                <Form.Control
                  type="text"
                  name="phone_number"
                  value={tempPhone.phone_number}
                  onChange={handlePhoneChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>{t('patients.phoneType')}</Form.Label>
                <Form.Select
                  name="phone_type"
                  value={tempPhone.phone_type}
                  onChange={handlePhoneChange}
                >
                  <option value="P">{t('patients.personalPhone')}</option>
                  <option value="H">{t('patients.homePhone')}</option>
                  <option value="W">{t('patients.workPhone')}</option>
                  <option value="O">{t('patients.otherPhone')}</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Button variant="outline-primary" onClick={addPhone}>
                {t('patients.addPhone')}
              </Button>
            </Col>
          </Row>
          
          {phonesList.length > 0 && (
            <Table className="mb-4" size="sm">
              <thead>
                <tr>
                  <th>{t('patients.phoneType')}</th>
                  <th>{t('patients.phoneNumber')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {phonesList.map(phone => (
                  <tr key={phone.id || phone.phone_number}>
                    <td>
                      {phone.phone_type === 'P' ? t('patients.personalPhone') :
                       phone.phone_type === 'H' ? t('patients.homePhone') :
                       phone.phone_type === 'W' ? t('patients.workPhone') :
                       t('patients.otherPhone')}
                    </td>
                    <td>{phone.phone_number}</td>
                    <td>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => removePhone(phone.id)}
                      >
                        {t('common.remove')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          
          {/* Emergency Contacts */}
          <h5 className="mb-3 mt-4">{t('patients.emergencyContacts')}</h5>
          
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>{t('patients.firstName')}</Form.Label>
                <Form.Control
                  type="text"
                  name="first_name"
                  value={tempEmergencyContact.first_name}
                  onChange={handleEmergencyContactChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>{t('patients.lastName1')}</Form.Label>
                <Form.Control
                  type="text"
                  name="last_name1"
                  value={tempEmergencyContact.last_name1}
                  onChange={handleEmergencyContactChange}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>{t('patients.phone')}</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={tempEmergencyContact.phone}
                  onChange={handleEmergencyContactChange}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>{t('patients.relationship')}</Form.Label>
                <Form.Control
                  type="text"
                  name="relationship"
                  value={tempEmergencyContact.relationship}
                  onChange={handleEmergencyContactChange}
                />
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button variant="outline-primary" onClick={addEmergencyContact}>
                {t('patients.addContact')}
              </Button>
            </Col>
          </Row>
          
          {emergencyContactsList.length > 0 && (
            <Table className="mb-4" size="sm">
              <thead>
                <tr>
                  <th>{t('patients.name')}</th>
                  <th>{t('patients.phone')}</th>
                  <th>{t('patients.relationship')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {emergencyContactsList.map(contact => (
                  <tr key={contact.id || contact.phone}>
                    <td>{`${contact.first_name} ${contact.last_name1} ${contact.last_name2 || ''}`}</td>
                    <td>{contact.phone}</td>
                    <td>{contact.relationship}</td>
                    <td>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => removeEmergencyContact(contact.id)}
                      >
                        {t('common.remove')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          
          {/* Clinic Information */}
          <h5 className="mb-3 mt-4">{t('patients.clinicInfo')}</h5>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('patients.clinic')}</Form.Label>
                <Form.Select
                  name="account"
                  value={formData.account}
                  onChange={handleChange}
                  isInvalid={!!errors.account}
                  required
                >
                  <option value="">{t('patients.selectClinic')}</option>
                  {accounts.map(account => (
                    <option key={account.account_id} value={account.account_id}>
                      {account.account_name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.account}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('patients.referralSource')}</Form.Label>
                <Form.Select
                  name="referral_source"
                  value={formData.referral_source}
                  onChange={handleChange}
                >
                  <option value="">{t('patients.selectReferral')}</option>
                  <option value="INT">{t('patients.referralSources.internet')}</option>
                  <option value="SOC">{t('patients.referralSources.socialMedia')}</option>
                  <option value="REC">{t('patients.referralSources.recommendation')}</option>
                  <option value="OAD">{t('patients.referralSources.onlineAd')}</option>
                  <option value="OUT">{t('patients.referralSources.outdoorAd')}</option>
                  <option value="OTH">{t('patients.referralSources.other')}</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label>{t('patients.consultationReason')}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="consultation_reason"
                  value={formData.consultation_reason}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="receive_notifications"
              name="receive_notifications"
              label={t('patients.receiveNotifications')}
              checked={formData.receive_notifications}
              onChange={handleChange}
            />
          </Form.Group>
          
          <Row className="mt-4">
            <Col className="d-flex justify-content-end">
              <Button 
                variant="secondary" 
                onClick={onCancel} 
                className="me-2"
                disabled={loading}
              >
                {t('common.cancel')}
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? t('common.saving') : t('common.save')}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PatientForm;