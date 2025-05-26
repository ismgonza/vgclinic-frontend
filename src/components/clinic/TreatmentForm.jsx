// src/components/clinic/TreatmentForm.jsx - Updated with pre-selected patient
import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Row, Col, Card, Alert, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { AccountContext } from '../../contexts/AccountContext';
import patientsService from '../../services/patients.service';
import catalogService from '../../services/catalog.service';
import usersService from '../../services/users.service';
import locationsService from '../../services/locations.service';
import treatmentsService from '../../services/treatments.service';

const TreatmentForm = ({ treatment, onSave, onCancel, preSelectedPatient }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { selectedAccount } = useContext(AccountContext);
  
  // Get pre-selected patient from props or location state
  const selectedPatient = preSelectedPatient || location.state?.selectedPatient;
  
  // Form data state
  const [formData, setFormData] = useState({
    patient: '',
    catalog_item: '',
    specialty: '',
    doctor: '',
    location: '',
    scheduled_date: '',
    scheduled_time: '',
    notes: '',
    status: 'SCHEDULED'
  });

  // Options for dropdowns
  const [patients, setPatients] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [branches, setBranches] = useState([]);
  
  // Patient search
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState([]);
  
  // Form state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState(null);

  // Load form options - reload when account changes
  useEffect(() => {
    if (selectedAccount) {
      loadOptions();
    } else {
      // Clear options if no account selected
      setPatients([]);
      setCatalogItems([]);
      setSpecialties([]);
      setDoctors([]);
      setBranches([]);
      setLoadingOptions(false);
    }
  }, [selectedAccount]);

  // Handle pre-selected patient
  useEffect(() => {
    if (selectedPatient && !treatment) {
      // Pre-fill patient data
      setFormData(prev => ({
        ...prev,
        patient: selectedPatient.id
      }));
      
      // Set patient search display
      setPatientSearch(`${selectedPatient.first_name} ${selectedPatient.last_name1} ${selectedPatient.last_name2 || ''}`.trim());
      
      console.log('Pre-selected patient:', selectedPatient);
    }
  }, [selectedPatient, treatment]);

  const loadOptions = async () => {
    if (!selectedAccount) return;
    
    try {
      setLoadingOptions(true);
      
      // Set account context for API calls
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      const [patientsData, catalogData, specialtiesData, formOptionsData, branchesData] = await Promise.all([
        patientsService.getPatients({ limit: 100 }, accountHeaders),
        catalogService.getCatalogItems(null, accountHeaders),
        catalogService.getSpecialties(accountHeaders),
        treatmentsService.getFormOptions(accountHeaders),
        locationsService.getBranches({}, accountHeaders)
      ]);
      
      setPatients(patientsData.results || patientsData);
      setCatalogItems(catalogData);
      setSpecialties(specialtiesData);
      setDoctors(formOptionsData.doctors || []);
      setBranches(branchesData.filter(branch => branch.is_active));
      
      console.log('Loaded form options for account:', selectedAccount.account_name);
      console.log('Patients:', (patientsData.results || patientsData).length);
      console.log('Doctors:', formOptionsData.doctors?.length || 0);
      console.log('Catalog items:', catalogData.length);
      console.log('Branches:', branchesData.filter(branch => branch.is_active).length);
      
    } catch (err) {
      console.error('Error loading form options:', err);
      setError(t('treatments.errorLoadingOptions'));
    } finally {
      setLoadingOptions(false);
    }
  };

  // Initialize form for editing
  useEffect(() => {
    if (treatment) {
      const scheduledDate = treatment.scheduled_date ? new Date(treatment.scheduled_date) : null;
      
      setFormData({
        patient: treatment.patient || '',
        catalog_item: treatment.catalog_item || '',
        specialty: treatment.specialty || '',
        doctor: treatment.doctor || '',
        location: treatment.location || '',
        scheduled_date: scheduledDate ? scheduledDate.toISOString().split('T')[0] : '',
        scheduled_time: scheduledDate ? scheduledDate.toTimeString().slice(0, 5) : '',
        notes: treatment.notes || '',
        status: treatment.status || 'SCHEDULED'
      });
      
      // Set patient search if editing
      if (treatment.patient_details) {
        setPatientSearch(`${treatment.patient_details.first_name} ${treatment.patient_details.last_name1} ${treatment.patient_details.last_name2 || ''}`.trim());
      }
    }
  }, [treatment]);

  // Filter patients based on search
  useEffect(() => {
    if (patientSearch.length >= 2) {
      const filtered = patients.filter(patient => {
        const fullName = `${patient.first_name} ${patient.last_name1} ${patient.last_name2 || ''}`.toLowerCase();
        const idNumber = patient.id_number || '';
        const searchLower = patientSearch.toLowerCase();
        
        return fullName.includes(searchLower) || idNumber.includes(searchLower);
      });
      setFilteredPatients(filtered.slice(0, 10));
      setShowPatientDropdown(true);
    } else {
      setFilteredPatients([]);
      setShowPatientDropdown(false);
    }
  }, [patientSearch, patients]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  // Handle patient selection
  const handlePatientSelect = (patient) => {
    setPatientSearch(`${patient.first_name} ${patient.last_name1} ${patient.last_name2 || ''}`.trim());
    setFormData({
      ...formData,
      patient: patient.id
    });
    setShowPatientDropdown(false);
    
    // Clear patient error
    if (errors.patient) {
      setErrors({
        ...errors,
        patient: undefined
      });
    }
  };

  // Handle catalog item change (update specialty)
  const handleCatalogItemChange = (e) => {
    const catalogItemId = e.target.value;
    const selectedItem = catalogItems.find(item => item.id == catalogItemId);
    
    setFormData({
      ...formData,
      catalog_item: catalogItemId,
      specialty: selectedItem ? selectedItem.specialty : ''
    });
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.patient) newErrors.patient = t('validation.required');
    if (!formData.catalog_item) newErrors.catalog_item = t('validation.required');
    if (!formData.doctor) newErrors.doctor = t('validation.required');
    if (!formData.scheduled_date) newErrors.scheduled_date = t('validation.required');
    if (!formData.scheduled_time) newErrors.scheduled_time = t('validation.required');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Combine date and time
      const scheduledDateTime = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`);
      
      const treatmentData = {
        ...formData,
        scheduled_date: scheduledDateTime.toISOString(),
        patient: parseInt(formData.patient),
        catalog_item: parseInt(formData.catalog_item),
        specialty: parseInt(formData.specialty),
        doctor: parseInt(formData.doctor),
        location: formData.location ? parseInt(formData.location) : null
      };
      
      await onSave(treatmentData);
    } catch (err) {
      console.error('Error saving treatment:', err);
      setError(err.response?.data?.detail || t('treatments.errorSaving'));
    } finally {
      setLoading(false);
    }
  };

  // Filter catalog items by specialty
  const getFilteredCatalogItems = () => {
    if (!formData.specialty) return catalogItems;
    return catalogItems.filter(item => item.specialty == formData.specialty);
  };

  // Show message if no account selected
  if (!selectedAccount) {
    return (
      <Card>
        <Card.Header>
          {treatment ? t('treatments.editTreatment') : t('treatments.newTreatment')}
        </Card.Header>
        <Card.Body>
          <div className="text-center py-4 text-muted">
            <p>{t('treatments.selectAccountFirst') || 'Please select a clinic first'}</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        {treatment ? t('treatments.editTreatment') : t('treatments.newTreatment')}
        {selectedPatient && !treatment && (
          <small className="text-muted d-block mt-1">
            Patient: {selectedPatient.first_name} {selectedPatient.last_name1} {selectedPatient.last_name2}
          </small>
        )}
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        {loadingOptions ? (
          <div className="text-center py-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">{t('common.loading')}...</span>
            </div>
            <p className="mt-2">{t('treatments.loadingOptions')}</p>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            {/* Patient Search */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>{t('treatments.fields.patient')} *</Form.Label>
              <Col sm={9}>
                <div className="position-relative">
                  <InputGroup>
                    <InputGroup.Text>
                      <FontAwesomeIcon icon={faSearch} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder={t('treatments.searchPatient')}
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      onFocus={() => patientSearch.length >= 2 && setShowPatientDropdown(true)}
                      isInvalid={!!errors.patient}
                      disabled={selectedPatient && !treatment} // Disable if patient is pre-selected
                    />
                  </InputGroup>
                  
                  {/* Patient Dropdown */}
                  {showPatientDropdown && filteredPatients.length > 0 && !selectedPatient && (
                    <div className="position-absolute w-100 bg-white border rounded shadow-sm" style={{ zIndex: 1000, top: '100%' }}>
                      {filteredPatients.map(patient => (
                        <div
                          key={patient.id}
                          className="p-2 border-bottom cursor-pointer"
                          onClick={() => handlePatientSelect(patient)}
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <div className="fw-bold">{patient.first_name} {patient.last_name1} {patient.last_name2}</div>
                          <small className="text-muted">ID: {patient.id_number}</small>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Form.Control.Feedback type="invalid">
                    {errors.patient}
                  </Form.Control.Feedback>
                </div>
              </Col>
            </Form.Group>

            {/* Specialty Selection */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>{t('catalog.specialty')}</Form.Label>
              <Col sm={9}>
                <Form.Select
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                >
                  <option value="">{t('catalog.selectSpecialty')}</option>
                  {specialties.map(specialty => (
                    <option key={specialty.id} value={specialty.id}>
                      {specialty.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Form.Group>

            {/* Catalog Item Selection */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>{t('treatments.procedure')} *</Form.Label>
              <Col sm={9}>
                <Form.Select
                  name="catalog_item"
                  value={formData.catalog_item}
                  onChange={handleCatalogItemChange}
                  isInvalid={!!errors.catalog_item}
                  required
                >
                  <option value="">{t('treatments.selectProcedure')}</option>
                  {getFilteredCatalogItems().map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} - ${item.price}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.catalog_item}
                </Form.Control.Feedback>
              </Col>
            </Form.Group>

            {/* Doctor Selection */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>{t('treatments.fields.doctor')} *</Form.Label>
              <Col sm={9}>
                <Form.Select
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleChange}
                  isInvalid={!!errors.doctor}
                  required
                >
                  <option value="">{t('treatments.selectDoctor')}</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.first_name} {doctor.last_name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.doctor}
                </Form.Control.Feedback>
              </Col>
            </Form.Group>

            {/* Branch Selection */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>{t('treatments.fields.branch')}</Form.Label>
              <Col sm={9}>
                <Form.Select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                >
                  <option value="">{t('treatments.selectBranch')}</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Form.Group>

            {/* Scheduled Date and Time */}
            <Row className="mb-3">
              <Col sm={6}>
                <Form.Group as={Row}>
                  <Form.Label column sm={6}>{t('treatments.scheduledDate')} *</Form.Label>
                  <Col sm={6}>
                    <Form.Control
                      type="date"
                      name="scheduled_date"
                      value={formData.scheduled_date}
                      onChange={handleChange}
                      isInvalid={!!errors.scheduled_date}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.scheduled_date}
                    </Form.Control.Feedback>
                  </Col>
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group as={Row}>
                  <Form.Label column sm={4}>{t('treatments.scheduledTime')} *</Form.Label>
                  <Col sm={8}>
                    <Form.Control
                      type="time"
                      name="scheduled_time"
                      value={formData.scheduled_time}
                      onChange={handleChange}
                      isInvalid={!!errors.scheduled_time}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.scheduled_time}
                    </Form.Control.Feedback>
                  </Col>
                </Form.Group>
              </Col>
            </Row>

            {/* Notes */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>{t('treatments.fields.notes')}</Form.Label>
              <Col sm={9}>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder={t('treatments.notesPlaceholder')}
                />
              </Col>
            </Form.Group>

            {/* Form Actions */}
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
                  disabled={loading || loadingOptions}
                >
                  {loading ? t('common.saving') : t('common.save')}
                </Button>
              </Col>
            </Row>
          </Form>
        )}
      </Card.Body>
    </Card>
  );
};

export default TreatmentForm;