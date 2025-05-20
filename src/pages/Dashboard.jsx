import React, { useContext, useEffect, useState } from 'react';
import { Card, Row, Col, ListGroup, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserInjured, faTooth, faCalendarAlt, faMoneyBillWave, faChartLine, faUsers } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    patients: 0,
    treatments: 0,
    upcomingAppointments: 0,
    pendingPayments: 0
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This would be replaced with actual API calls in a production environment
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Dummy data for demonstration
      setStats({
        patients: 120,
        treatments: 45,
        upcomingAppointments: 8,
        pendingPayments: 15
      });
      
      setRecentPatients([
        { id: 1, name: 'Maria González', procedure: 'Dental Cleaning', date: '2025-05-15' },
        { id: 2, name: 'Carlos Rodríguez', procedure: 'Root Canal', date: '2025-05-14' },
        { id: 3, name: 'Ana Martínez', procedure: 'Consultation', date: '2025-05-13' }
      ]);
      
      setUpcomingAppointments([
        { id: 1, name: 'Juan Pérez', time: '09:00', date: '2025-05-20' },
        { id: 2, name: 'Laura Sanchez', time: '11:30', date: '2025-05-20' },
        { id: 3, name: 'Roberto Diaz', time: '14:00', date: '2025-05-20' }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{t('dashboard.title')}</h1>
        <p className="welcome-message">{t('dashboard.welcome', { name: currentUser?.first_name || t('navigation.user') })}</p>
      </div>
      
      <Row className="mb-4 stat-cards">
        <Col lg={3} md={6} className="mb-3">
          <Card className="stat-card patients-card">
            <Card.Body>
              <div className="stat-icon">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div className="stat-content">
                <h4>{t('dashboard.patients')}</h4>
                <div className="stat-value">{stats.patients}</div>
                <div className="stat-label">{t('dashboard.totalPatients')}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="stat-card treatments-card">
            <Card.Body>
              <div className="stat-icon">
                <FontAwesomeIcon icon={faTooth} />
              </div>
              <div className="stat-content">
                <h4>{t('dashboard.treatments')}</h4>
                <div className="stat-value">{stats.treatments}</div>
                <div className="stat-label">{t('dashboard.activeTreatments')}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="stat-card appointments-card">
            <Card.Body>
              <div className="stat-icon">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </div>
              <div className="stat-content">
                <h4>{t('dashboard.appointments')}</h4>
                <div className="stat-value">{stats.upcomingAppointments}</div>
                <div className="stat-label">{t('dashboard.upcomingAppointments')}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="stat-card payments-card">
            <Card.Body>
              <div className="stat-icon">
                <FontAwesomeIcon icon={faMoneyBillWave} />
              </div>
              <div className="stat-content">
                <h4>{t('dashboard.payments')}</h4>
                <div className="stat-value">{stats.pendingPayments}</div>
                <div className="stat-label">{t('dashboard.pendingPayments')}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={6} className="mb-4">
          <Card className="dashboard-card">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <span>{t('dashboard.recentPatients')}</span>
                <Button variant="link" size="sm" className="view-all-link">
                  {t('dashboard.viewAll')}
                </Button>
              </div>
            </Card.Header>
            <ListGroup variant="flush">
              {loading ? (
                <ListGroup.Item className="text-center py-3">
                  {t('common.loading')}...
                </ListGroup.Item>
              ) : (
                recentPatients.map(patient => (
                  <ListGroup.Item key={patient.id} className="patient-item">
                    <div className="patient-info">
                      <div className="patient-name">{patient.name}</div>
                      <div className="patient-procedure">{patient.procedure}</div>
                    </div>
                    <div className="patient-date">{formatDate(patient.date)}</div>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>
        </Col>
        <Col lg={6} className="mb-4">
          <Card className="dashboard-card">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <span>{t('dashboard.upcomingAppointments')}</span>
                <Button variant="link" size="sm" className="view-all-link">
                  {t('dashboard.viewAll')}
                </Button>
              </div>
            </Card.Header>
            <ListGroup variant="flush">
              {loading ? (
                <ListGroup.Item className="text-center py-3">
                  {t('common.loading')}...
                </ListGroup.Item>
              ) : (
                upcomingAppointments.map(appointment => (
                  <ListGroup.Item key={appointment.id} className="appointment-item">
                    <div className="appointment-info">
                      <div className="appointment-name">{appointment.name}</div>
                      <div className="appointment-time">{appointment.time}</div>
                    </div>
                    <div className="appointment-date">{formatDate(appointment.date)}</div>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;