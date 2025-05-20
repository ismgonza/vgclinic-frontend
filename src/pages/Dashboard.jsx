import React, { useContext, useEffect, useState } from 'react';
import { Card, Row, Col, ListGroup, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserInjured, faTooth, faCalendarAlt, faMoneyBillWave, faChartLine, faUsers } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import dashboardService from '../services/dashboard.service';
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
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch dashboard stats
        const statsData = await dashboardService.getDashboardStats();
        setStats(statsData);

        // Fetch recent patients
        const patientsData = await dashboardService.getRecentPatients();
        setRecentPatients(patientsData.results || []);

        // Fetch upcoming appointments
        const appointmentsData = await dashboardService.getUpcomingAppointments();
        setUpcomingAppointments(appointmentsData.results || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        
        // Fallback to dummy data in case of error
        setStats({
          patients: 0,
          treatments: 0,
          upcomingAppointments: 0,
          pendingPayments: 0
        });
        setRecentPatients([]);
        setUpcomingAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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