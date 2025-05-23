// src/pages/clinic/catalog/Catalog.jsx - Centered text version
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcaseMedical, faList } from '@fortawesome/free-solid-svg-icons';

const Catalog = () => {
  const { t } = useTranslation();

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="h3">{t('catalog.title')}</h1>
          {/* <p className="text-muted">{t('catalog.description')}</p> */}
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body className="d-flex flex-column text-center">
              <div className="mb-3">
                <FontAwesomeIcon icon={faBriefcaseMedical} size="4x" className="text-primary" />
              </div>
              <h5 className="card-title">{t('catalog.specialtiesTitle')}</h5>
              <p className="card-text">{t('catalog.specialtiesDescription')}</p>
              <div className="mt-auto">
                <Link to="/clinic/catalog/specialties" className="btn btn-primary">
                  {t('catalog.manageSpecialties')}
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body className="d-flex flex-column text-center">
              <div className="mb-3">
                <FontAwesomeIcon icon={faBriefcaseMedical} size="4x" className="text-primary" />
              </div>
              <h5 className="card-title">{t('catalog.itemsTitle')}</h5>
              <p className="card-text">{t('catalog.itemsDescription')}</p>
              <div className="mt-auto">
                <Link to="/clinic/catalog/items" className="btn btn-primary">
                  {t('catalog.manageItems')}
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Catalog;