// src/components/clinic/TreatmentFilters.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { AccountContext } from '../../contexts/AccountContext';
import patientsService from '../../services/patients.service';
import catalogService from '../../services/catalog.service';
import locationsService from '../../services/locations.service';
import treatmentsService from '../../services/treatments.service';


const TreatmentFilters = ({ filters, onFiltersChange, onClearFilters }) => {
  const { t } = useTranslation();
  const { selectedAccount } = useContext(AccountContext);
  
  // Options for dropdowns
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [branches, setBranches] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  
  // Patient search
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState([]);

  // Load dropdown options - reload when account changes
  useEffect(() => {
    if (selectedAccount) {
      loadOptions();
    } else {
      // Clear options if no account selected
      setPatients([]);
      setDoctors([]);
      setBranches([]);
      setSpecialties([]);
      setLoadingOptions(false);
    }
  }, [selectedAccount]);

  const loadOptions = async () => {
    if (!selectedAccount) return;
    
    try {
      setLoadingOptions(true);
      
      // Set account context for API calls
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      const [patientsData, formOptionsData, branchesData, specialtiesData] = await Promise.all([
        patientsService.getPatients({ limit: 100 }, accountHeaders),
        treatmentsService.getFormOptions(accountHeaders),
        locationsService.getBranches(accountHeaders),
        catalogService.getSpecialties(accountHeaders)
      ]);
      
      setPatients(patientsData.results || patientsData);
      setDoctors(formOptionsData.doctors || []);
      setBranches(branchesData.filter(branch => branch.is_active));
      setSpecialties(specialtiesData || []);
      
      console.log('Loaded filter options for account:', selectedAccount.account_name);
      console.log('Patients:', (patientsData.results || patientsData).length);
      console.log('Doctors:', formOptionsData.doctors?.length || 0);
      console.log('Branches:', branchesData.filter(branch => branch.is_active).length);
      console.log('Specialties:', specialtiesData?.length || 0);
      
    } catch (err) {
      console.error('Error loading filter options:', err);
    } finally {
      setLoadingOptions(false);
    }
  };

  // Filter patients based on search
  useEffect(() => {
    if (patientSearch.length >= 2) {
      const filtered = patients.filter(patient => {
        const fullName = `${patient.first_name} ${patient.last_name1} ${patient.last_name2 || ''}`.toLowerCase();
        const idNumber = patient.id_number || '';
        const searchLower = patientSearch.toLowerCase();
        
        return fullName.includes(searchLower) || idNumber.includes(searchLower);
      });
      setFilteredPatients(filtered.slice(0, 10)); // Show max 10 results
      setShowPatientDropdown(true);
    } else {
      setFilteredPatients([]);
      setShowPatientDropdown(false);
    }
  }, [patientSearch, patients]);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    const newFilters = {
      ...filters,
      [filterName]: value
    };
    onFiltersChange(newFilters);
  };

  // Handle multi-select changes (status, doctor, specialty)
  const handleMultiSelectChange = (filterName, value, checked) => {
    const currentValues = filters[filterName] || [];
    let newValues;
    
    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }
    
    handleFilterChange(filterName, newValues);
  };

  // Handle patient selection
  const handlePatientSelect = (patient) => {
    setPatientSearch(`${patient.first_name} ${patient.last_name1} ${patient.last_name2 || ''}`.trim());
    handleFilterChange('patient', patient.id);
    setShowPatientDropdown(false);
  };

  // Clear patient search
  const clearPatientSearch = () => {
    setPatientSearch('');
    handleFilterChange('patient', '');
    setShowPatientDropdown(false);
  };

  // Status options
  const statusOptions = [
    { value: 'SCHEDULED', label: t('treatments.status.SCHEDULED') },
    { value: 'RESCHEDULED', label: t('treatments.status.RESCHEDULED') },
    { value: 'IN_PROGRESS', label: t('treatments.status.IN_PROGRESS') },
    { value: 'COMPLETED', label: t('treatments.status.COMPLETED') },
    { value: 'CANCELED', label: t('treatments.status.CANCELED') }
  ];

  // Show message if no account selected
  if (!selectedAccount) {
    return (
      <div className="treatment-filters">
        <div className="text-center py-4 text-muted">
          <p>{t('treatments.filters.selectAccountFirst') || 'Please select a clinic first'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="treatment-filters">
      <Row className="g-3">
        {/* Patient Search */}
        <Col lg={2} md={3}>
          <Form.Label className="small fw-bold">{t('treatments.fields.patient')}</Form.Label>
          <div className="position-relative">
            <InputGroup>
              <InputGroup.Text>
                <FontAwesomeIcon icon={faSearch} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder={t('treatments.filters.searchPatient')}
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                onFocus={() => patientSearch.length >= 2 && setShowPatientDropdown(true)}
                disabled={loadingOptions}
                size="sm"
              />
              {patientSearch && (
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={clearPatientSearch}
                  style={{ borderLeft: 'none' }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </Button>
              )}
            </InputGroup>
            
            {/* Patient Dropdown */}
            {showPatientDropdown && filteredPatients.length > 0 && (
              <div className="position-absolute w-100 bg-white border rounded shadow-sm" style={{ zIndex: 1000, top: '100%' }}>
                {filteredPatients.map(patient => (
                  <div
                    key={patient.id}
                    className="p-2 border-bottom cursor-pointer hover-bg-light"
                    onClick={() => handlePatientSelect(patient)}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <div className="fw-bold small">{patient.first_name} {patient.last_name1} {patient.last_name2}</div>
                    <small className="text-muted">ID: {patient.id_number}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Col>

        {/* Specialty Multi-Select */}
        <Col lg={2} md={3}>
          <Form.Label className="small fw-bold">{t('treatments.fields.specialty')}</Form.Label>
          <div className="border rounded p-2" style={{ maxHeight: '120px', overflowY: 'auto' }}>
            {loadingOptions ? (
              <small className="text-muted">{t('common.loading')}...</small>
            ) : (
              specialties.map(specialty => (
                <Form.Check
                  key={specialty.id}
                  type="checkbox"
                  id={`specialty-${specialty.id}`}
                  label={specialty.name}
                  checked={filters.specialty?.includes(specialty.id.toString()) || false}
                  onChange={(e) => handleMultiSelectChange('specialty', specialty.id.toString(), e.target.checked)}
                  className="small"
                />
              ))
            )}
          </div>
        </Col>

        {/* Status Multi-Select */}
        <Col lg={2} md={3}>
          <Form.Label className="small fw-bold">{t('treatments.fields.status')}</Form.Label>
          <div className="border rounded p-2" style={{ maxHeight: '120px', overflowY: 'auto' }}>
            {statusOptions.map(option => (
              <Form.Check
                key={option.value}
                type="checkbox"
                id={`status-${option.value}`}
                label={option.label}
                checked={filters.status?.includes(option.value) || false}
                onChange={(e) => handleMultiSelectChange('status', option.value, e.target.checked)}
                className="small"
              />
            ))}
          </div>
        </Col>

        {/* Doctor Multi-Select */}
        <Col lg={2} md={3}>
          <Form.Label className="small fw-bold">{t('treatments.fields.doctor')}</Form.Label>
          <div className="border rounded p-2" style={{ maxHeight: '120px', overflowY: 'auto' }}>
            {loadingOptions ? (
              <small className="text-muted">{t('common.loading')}...</small>
            ) : (
              doctors.map(doctor => (
                <Form.Check
                  key={doctor.id}
                  type="checkbox"
                  id={`doctor-${doctor.id}`}
                  label={`${doctor.first_name} ${doctor.last_name}`}
                  checked={filters.doctor?.includes(doctor.id.toString()) || false}
                  onChange={(e) => handleMultiSelectChange('doctor', doctor.id.toString(), e.target.checked)}
                  className="small"
                />
              ))
            )}
          </div>
        </Col>

        {/* Branch Select */}
        <Col lg={2} md={3}>
          <Form.Label className="small fw-bold">{t('treatments.fields.branch')}</Form.Label>
          <Form.Select
            value={filters.branch || ''}
            onChange={(e) => handleFilterChange('branch', e.target.value)}
            size="sm"
            disabled={loadingOptions}
          >
            <option value="">{t('treatments.filters.selectBranch')}</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </Form.Select>
        </Col>

        {/* Date Range */}
        <Col lg={1} md={2}>
          <Form.Label className="small fw-bold">{t('treatments.filters.dateFrom')}</Form.Label>
          <Form.Control
            type="date"
            value={filters.date_from || ''}
            onChange={(e) => handleFilterChange('date_from', e.target.value)}
            size="sm"
          />
        </Col>

        <Col lg={1} md={2}>
          <Form.Label className="small fw-bold">{t('treatments.filters.dateTo')}</Form.Label>
          <Form.Control
            type="date"
            value={filters.date_to || ''}
            onChange={(e) => handleFilterChange('date_to', e.target.value)}
            size="sm"
          />
        </Col>
      </Row>

      {/* Clear Filters Button */}
      <Row className="mt-3">
        <Col>
          <Button 
            variant="outline-secondary" 
            size="sm" 
            onClick={onClearFilters}
            className="me-2"
          >
            <FontAwesomeIcon icon={faTimes} className="me-1" />
            {t('treatments.filters.clearFilters')}
          </Button>
          <small className="text-muted">
            {Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : f !== '')) && 
              t('treatments.filters.filtersActive')
            }
          </small>
        </Col>
      </Row>
    </div>
  );
};

export default TreatmentFilters;