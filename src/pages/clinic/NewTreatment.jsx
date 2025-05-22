// src/pages/clinic/NewTreatment.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import treatmentsService from '../../services/treatments.service';
import TreatmentForm from '../../components/clinic/TreatmentForm';

const NewTreatment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [successMessage, setSuccessMessage] = useState('');

  // Check if patient was pre-selected from URL params
  const urlParams = new URLSearchParams(location.search);
  const preSelectedPatient = urlParams.get('patient');

  const handleBack = () => {
    navigate('/clinic/treatments');
  };

  const handleSave = async (treatmentData) => {
    try {
      const newTreatment = await treatmentsService.createTreatment(treatmentData);
      
      setSuccessMessage(t('treatments.messages.treatmentCreated'));
      
      // Navigate to the new treatment detail page after a brief delay
      setTimeout(() => {
        navigate(`/clinic/treatments/${newTreatment.id}`, {
          state: { successMessage: t('treatments.messages.treatmentCreated') }
        });
      }, 1000);
      
    } catch (error) {
      // Error will be handled by the form component
      throw error;
    }
  };

  const handleCancel = () => {
    navigate('/clinic/treatments');
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <Button variant="outline-secondary" onClick={handleBack} className="me-3">
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            {t('treatments.backToTreatments')}
          </Button>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <h1 className="h3">{t('treatments.newTreatment')}</h1>
          <p className="text-muted">{t('treatments.newTreatmentDescription')}</p>
        </Col>
      </Row>

      {successMessage && (
        <Row className="mb-4">
          <Col>
            <div className="alert alert-success" role="alert">
              {successMessage}
            </div>
          </Col>
        </Row>
      )}

      <Row>
        <Col lg={10} xl={8}>
          <TreatmentForm 
            treatment={null}
            onSave={handleSave}
            onCancel={handleCancel}
            preSelectedPatient={preSelectedPatient}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default NewTreatment;