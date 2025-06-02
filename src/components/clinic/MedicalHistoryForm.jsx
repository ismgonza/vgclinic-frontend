// src/components/clinic/MedicalHistoryForm.jsx
import React, { useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const MedicalHistoryForm = ({ patientId, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    under_treatment: false,
    under_treatment_text: '',
    current_medication: false,
    current_medication_text: '',
    serious_illnesses: false,
    serious_illnesses_text: '',
    surgeries: false,
    surgeries_text: '',
    allergies: false,
    allergies_text: '',
    anesthesia_issues: false,
    bleeding_issues: false,
    pregnant_or_lactating: false,
    contraceptives: false,
    high_blood_pressure: false,
    rheumatic_fever: false,
    drug_addiction: false,
    diabetes: false,
    anemia: false,
    thyroid: false,
    asthma: false,
    arthritis: false,
    cancer: false,
    heart_problems: false,
    smoker: false,
    ulcers: false,
    gastritis: false,
    hepatitis: false,
    kidney_diseases: false,
    hormonal_problems: false,
    epilepsy: false,
    aids: false,
    psychiatric_treatment: false,
    information_confirmed: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
    
    // If the checkbox for a text field is unchecked, clear the text
    if (type === 'checkbox' && !checked) {
      const textFieldName = `${name}_text`;
      if (formData[textFieldName] !== undefined) {
        setFormData(prev => ({
          ...prev,
          [textFieldName]: ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate that text fields are filled when their checkbox is checked
    if (formData.under_treatment && !formData.under_treatment_text) {
      newErrors.under_treatment_text = t('validation.required');
    }
    
    if (formData.current_medication && !formData.current_medication_text) {
      newErrors.current_medication_text = t('validation.required');
    }
    
    if (formData.serious_illnesses && !formData.serious_illnesses_text) {
      newErrors.serious_illnesses_text = t('validation.required');
    }
    
    if (formData.surgeries && !formData.surgeries_text) {
      newErrors.surgeries_text = t('validation.required');
    }
    
    if (formData.allergies && !formData.allergies_text) {
      newErrors.allergies_text = t('validation.required');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await onSave(formData);
    } catch (err) {
      console.error('Error saving medical history:', err);
      setError(err.response?.data?.detail || t('patients.anamnesis.errorSaving'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Medical Treatment Questions */}
      <h5 className="mb-3">{t('patients.medicalHistory.treatmentDetails')}</h5>
      
      <Form.Group as={Row} className="mb-3">
        <Col sm={12}>
          <Form.Check
            type="checkbox"
            id="under_treatment"
            name="under_treatment"
            label={t('patients.medicalHistory.details.underTreatment')}
            checked={formData.under_treatment}
            onChange={handleChange}
          />
          {formData.under_treatment && (
            <Form.Control
              as="textarea"
              rows={2}
              name="under_treatment_text"
              value={formData.under_treatment_text}
              onChange={handleChange}
              isInvalid={!!errors.under_treatment_text}
              placeholder={t('patients.medicalHistory.details.underTreatmentHelp')}
              className="mt-2"
            />
          )}
          <Form.Control.Feedback type="invalid">
            {errors.under_treatment_text}
          </Form.Control.Feedback>
        </Col>
      </Form.Group>
      
      <Form.Group as={Row} className="mb-3">
        <Col sm={12}>
          <Form.Check
            type="checkbox"
            id="current_medication"
            name="current_medication"
            label={t('patients.medicalHistory.details.currentMedication')}
            checked={formData.current_medication}
            onChange={handleChange}
          />
          {formData.current_medication && (
            <Form.Control
              as="textarea"
              rows={2}
              name="current_medication_text"
              value={formData.current_medication_text}
              onChange={handleChange}
              isInvalid={!!errors.current_medication_text}
              placeholder={t('patients.medicalHistory.details.currentMedicationHelp')}
              className="mt-2"
            />
          )}
          <Form.Control.Feedback type="invalid">
            {errors.current_medication_text}
          </Form.Control.Feedback>
        </Col>
      </Form.Group>
      
      <Form.Group as={Row} className="mb-3">
        <Col sm={12}>
          <Form.Check
            type="checkbox"
            id="serious_illnesses"
            name="serious_illnesses"
            label={t('patients.medicalHistory.details.seriousIllnesses')}
            checked={formData.serious_illnesses}
            onChange={handleChange}
          />
          {formData.serious_illnesses && (
            <Form.Control
              as="textarea"
              rows={2}
              name="serious_illnesses_text"
              value={formData.serious_illnesses_text}
              onChange={handleChange}
              isInvalid={!!errors.serious_illnesses_text}
              placeholder={t('patients.medicalHistory.details.seriousIllnessesHelp')}
              className="mt-2"
            />
          )}
          <Form.Control.Feedback type="invalid">
            {errors.serious_illnesses_text}
          </Form.Control.Feedback>
        </Col>
      </Form.Group>
      
      <Form.Group as={Row} className="mb-3">
        <Col sm={12}>
          <Form.Check
            type="checkbox"
            id="surgeries"
            name="surgeries"
            label={t('patients.medicalHistory.details.surgeries')}
            checked={formData.surgeries}
            onChange={handleChange}
          />
          {formData.surgeries && (
            <Form.Control
              as="textarea"
              rows={2}
              name="surgeries_text"
              value={formData.surgeries_text}
              onChange={handleChange}
              isInvalid={!!errors.surgeries_text}
              placeholder={t('patients.medicalHistory.details.surgeriesHelp')}
              className="mt-2"
            />
          )}
          <Form.Control.Feedback type="invalid">
            {errors.surgeries_text}
          </Form.Control.Feedback>
        </Col>
      </Form.Group>
      
      <Form.Group as={Row} className="mb-3">
        <Col sm={12}>
          <Form.Check
            type="checkbox"
            id="allergies"
            name="allergies"
            label={t('patients.medicalHistory.details.allergies')}
            checked={formData.allergies}
            onChange={handleChange}
          />
          {formData.allergies && (
            <Form.Control
              as="textarea"
              rows={2}
              name="allergies_text"
              value={formData.allergies_text}
              onChange={handleChange}
              isInvalid={!!errors.allergies_text}
              placeholder={t('patients.medicalHistory.details.allergiesHelp')}
              className="mt-2"
            />
          )}
          <Form.Control.Feedback type="invalid">
            {errors.allergies_text}
          </Form.Control.Feedback>
        </Col>
      </Form.Group>
      
      {/* Medical Status */}
      <h5 className="mb-3 mt-4">{t('patients.medicalHistory.medicalStatus')}</h5>
      
      <Row className="mb-3">
        <Col md={6}>
        <Form.Check
            type="checkbox"
            id="anesthesia_issues"
            name="anesthesia_issues"
            label={t('patients.medicalHistory.status.anesthesiaIssues')}
            checked={formData.anesthesia_issues}
            onChange={handleChange}
          />
        </Col>
        <Col md={6}>
          <Form.Check
            type="checkbox"
            id="bleeding_issues"
            name="bleeding_issues"
            label={t('patients.medicalHistory.status.bleedingIssues')}
            checked={formData.bleeding_issues}
            onChange={handleChange}
          />
        </Col>
      </Row>
      
      <Row className="mb-3">
        <Col md={6}>
          <Form.Check
            type="checkbox"
            id="pregnant_or_lactating"
            name="pregnant_or_lactating"
            label={t('patients.medicalHistory.status.pregnantOrLactating')}
            checked={formData.pregnant_or_lactating}
            onChange={handleChange}
          />
        </Col>
        <Col md={6}>
          <Form.Check
            type="checkbox"
            id="contraceptives"
            name="contraceptives"
            label={t('patients.medicalHistory.status.contraceptives')}
            checked={formData.contraceptives}
            onChange={handleChange}
          />
        </Col>
      </Row>
      
      {/* Medical Conditions */}
      <h5 className="mb-3 mt-4">{t('patients.medicalHistory.medicalConditions')}</h5>
      
      <Row className="mb-3">
        <Col md={4}>
          <Form.Check
            type="checkbox"
            id="high_blood_pressure"
            name="high_blood_pressure"
            label={t('patients.medicalHistory.conditions.highBloodPressure')}
            checked={formData.high_blood_pressure}
            onChange={handleChange}
          />
        </Col>
        <Col md={4}>
          <Form.Check
            type="checkbox"
            id="rheumatic_fever"
            name="rheumatic_fever"
            label={t('patients.medicalHistory.conditions.rheumaticFever')}
            checked={formData.rheumatic_fever}
            onChange={handleChange}
          />
        </Col>
        <Col md={4}>
          <Form.Check
            type="checkbox"
            id="drug_addiction"
            name="drug_addiction"
            label={t('patients.medicalHistory.conditions.drugAddiction')}
            checked={formData.drug_addiction}
            onChange={handleChange}
          />
        </Col>
      </Row>
      
      <Row className="mb-3">
        <Col md={4}>
          <Form.Check
            type="checkbox"
            id="diabetes"
            name="diabetes"
            label={t('patients.medicalHistory.conditions.diabetes')}
            checked={formData.diabetes}
            onChange={handleChange}
          />
        </Col>
        <Col md={4}>
          <Form.Check
            type="checkbox"
            id="anemia"
            name="anemia"
            label={t('patients.medicalHistory.conditions.anemia')}
            checked={formData.anemia}
            onChange={handleChange}
          />
        </Col>
        <Col md={4}>
          <Form.Check
            type="checkbox"
            id="thyroid"
            name="thyroid"
            label={t('patients.medicalHistory.conditions.thyroid')}
            checked={formData.thyroid}
            onChange={handleChange}
          />
        </Col>
      </Row>
      
      <Row className="mb-3">
        <Col md={4}>
          <Form.Check
            type="checkbox"
            id="asthma"
            name="asthma"
            label={t('patients.medicalHistory.conditions.asthma')}
            checked={formData.asthma}
            onChange={handleChange}
          />
        </Col>
        <Col md={4}>
          <Form.Check
            type="checkbox"
            id="arthritis"
            name="arthritis"
            label={t('patients.medicalHistory.conditions.arthritis')}
            checked={formData.arthritis}
            onChange={handleChange}
          />
        </Col>
        <Col md={4}>
          <Form.Check
            type="checkbox"
            id="cancer"
            name="cancer"
            label={t('patients.medicalHistory.conditions.cancer')}
            checked={formData.cancer}
            onChange={handleChange}
          />
        </Col>
      </Row>
      
      <Row className="mb-3">
        <Col md={4}>
          <Form.Check
            type="checkbox"
            id="heart_problems"
            name="heart_problems"
            label={t('patients.medicalHistory.conditions.heartProblems')}
            checked={formData.heart_problems}
            onChange={handleChange}
          />
        </Col>
        <Col md={4}>
          <Form.Check
            type="checkbox"
            id="smoker"
            name="smoker"
            label={t('patients.medicalHistory.conditions.smoker')}
            checked={formData.smoker}
            onChange={handleChange}
          />
        </Col>
        <Col md={4}>
          <Form.Check
            type="checkbox"
            id="ulcers"
            name="ulcers"
            label={t('patients.medicalHistory.conditions.ulcers')}
            checked={formData.ulcers}
            onChange={handleChange}
          />
        </Col>
      </Row>
      
      <Row className="mb-3">
        <Col md={4}>
          <Form.Check
            type="checkbox"
            id="gastritis"
            name="gastritis"
            label={t('patients.medicalHistory.conditions.gastritis')}
            checked={formData.gastritis}
            onChange={handleChange}
          />
        </Col>
        <Col md={4}>
          <Form.Check
            type="checkbox"
            id="hepatitis"
            name="hepatitis"
            label={t('patients.medicalHistory.conditions.hepatitis')}
            checked={formData.hepatitis}
            onChange={handleChange}
          />
        </Col>
        <Col md={4}>
          <Form.Check
            type="checkbox"
            id="kidney_diseases"
            name="kidney_diseases"
            label={t('patients.medicalHistory.conditions.kidneyDiseases')}
            checked={formData.kidney_diseases}
            onChange={handleChange}
          />
        </Col>
      </Row>
      
      <Row className="mb-3">
        <Col md={4}>
          <Form.Check
            type="checkbox"
            id="hormonal_problems"
            name="hormonal_problems"
            label={t('patients.medicalHistory.conditions.hormonalProblems')}
            checked={formData.hormonal_problems}
            onChange={handleChange}
          />
        </Col>
        <Col md={4}>
          <Form.Check
            type="checkbox"
            id="epilepsy"
            name="epilepsy"
            label={t('patients.medicalHistory.conditions.epilepsy')}
            checked={formData.epilepsy}
            onChange={handleChange}
          />
        </Col>
        <Col md={4}>
          <Form.Check
            type="checkbox"
            id="aids"
            name="aids"
            label={t('patients.medicalHistory.conditions.aids')}
            checked={formData.aids}
            onChange={handleChange}
          />
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={4}>
          <Form.Check
            type="checkbox"
            id="psychiatric_treatment"
            name="psychiatric_treatment"
            label={t('patients.medicalHistory.conditions.psychiatricTreatment')}
            checked={formData.psychiatric_treatment}
            onChange={handleChange}
          />
        </Col>
      </Row>
      
      {/* Confirmation */}
      <Form.Group className="mb-4 border-top pt-3">
        <Form.Check
          type="checkbox"
          id="information_confirmed"
          name="information_confirmed"
          label={t('patients.medicalHistory.confirmation')}
          checked={formData.information_confirmed}
          onChange={handleChange}
          className="fw-bold"
        />
      </Form.Group>
      
      <div className="d-flex justify-content-end">
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
      </div>
    </Form>
  );
};

export default MedicalHistoryForm;