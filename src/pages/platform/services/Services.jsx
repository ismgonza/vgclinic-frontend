// src/pages/platform/services/Services.jsx
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Services = () => {
  const { t } = useTranslation();

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="h3">{t('services.title')}</h1>
          <p className="text-muted">{t('services.description')}</p>
        </Col>
      </Row>

      <Row>
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <h5 className="card-title">{t('features.title')}</h5>
              <p className="card-text">{t('features.description')}</p>
              <Link to="/platform/services/features" className="btn btn-primary">
                {t('features.manage')}
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <h5 className="card-title">{t('services.servicesTitle')}</h5>
              <p className="card-text">{t('services.serviceDescription')}</p>
              <Link to="/platform/services/services" className="btn btn-primary">
                {t('services.manage')}
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <h5 className="card-title">{t('plans.title')}</h5>
              <p className="card-text">{t('plans.description')}</p>
              <Link to="/platform/services/plans" className="btn btn-primary">
                {t('plans.manage')}
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Services;