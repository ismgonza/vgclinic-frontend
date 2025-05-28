// src/pages/clinic/Team.jsx
import React, { useContext } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faEnvelope, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { AccountContext } from '../../contexts/AccountContext';

const Team = () => {
  const { t } = useTranslation();
  const { selectedAccount } = useContext(AccountContext);

  // Show message if no account selected
  if (!selectedAccount) {
    return (
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <h1 className="h3">{t('team.title')}</h1>
          </Col>
        </Row>
        
        <Card>
          <Card.Body>
            <div className="text-center py-4 text-muted">
              <FontAwesomeIcon icon={faUsers} size="3x" className="mb-3" />
              <p>{t('team.selectAccountFirst')}</p>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="h3">{t('team.title')}</h1>
          <small className="text-muted">
            {t('navigation.acctSelector.current')}: <strong>{selectedAccount.account_name}</strong>
          </small>
        </Col>
      </Row>

      <Row>
        <Col lg={4} md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body className="d-flex flex-column text-center">
              <div className="mb-3">
                <FontAwesomeIcon icon={faUsers} size="4x" className="text-primary" />
              </div>
              <h5 className="card-title">{t('team.membersTitle')}</h5>
              <p className="card-text">{t('team.membersDescription')}</p>
              <div className="mt-auto">
                <Link to="/clinic/team/members" className="btn btn-primary">
                  {t('team.manageMembers')}
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body className="d-flex flex-column text-center">
              <div className="mb-3">
                <FontAwesomeIcon icon={faEnvelope} size="4x" className="text-primary" />
              </div>
              <h5 className="card-title">{t('team.invitationsTitle')}</h5>
              <p className="card-text">{t('team.invitationsDescription')}</p>
              <div className="mt-auto">
                <Link to="/clinic/team/invitations" className="btn btn-primary">
                  {t('team.manageInvitations')}
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body className="d-flex flex-column text-center">
              <div className="mb-3">
                <FontAwesomeIcon icon={faShieldAlt} size="4x" className="text-success" />
              </div>
              <h5 className="card-title">{t('team.permissionsTitle')}</h5>
              <p className="card-text">{t('team.permissionsDescription')}</p>
              <div className="mt-auto">
                <Link to="/clinic/team/permissions" className="btn btn-success">
                  {t('team.managePermissions')}
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Team;