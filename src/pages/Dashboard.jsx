// src/pages/Dashboard.jsx (modify to handle staff view)
import React, { useContext, useEffect, useState } from 'react';
import { Card, Row, Col, ListGroup, Button, Form, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserInjured, faTooth, faCalendarAlt, faMoneyBillWave, 
         faChartLine, faUsers, faBuilding, faUsersCog, faFileContract } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import dashboardService from '../services/dashboard.service';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const { t } = useTranslation();
  const [isStaff, setIsStaff] = useState(false);
  const [stats, setStats] = useState({});
  const [accounts, setAccounts] = useState([]);
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
        setIsStaff(statsData.isStaff);
        
        // If user is staff, fetch accounts list
        if (statsData.isStaff) {
          const accountsData = await dashboardService.getAccountsList();
          setAccounts(accountsData);
        } else {
          // Regular user - fetch patient and appointment data
          const patientsData = await dashboardService.getRecentPatients();
          setRecentPatients(patientsData.results || []);

          const appointmentsData = await dashboardService.getUpcomingAppointments();
          setUpcomingAppointments(appointmentsData.results || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setStats({});
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

  // Render staff dashboard
  const renderStaffDashboard = () => (
    <>
      <div className="dashboard-header">
        <h1>Platform Administration Dashboard</h1>
        <p className="welcome-message">Welcome, {currentUser?.first_name || 'Administrator'}! Here's your platform overview.</p>
      </div>
      
      <Row className="mb-4 stat-cards">
        <Col lg={3} md={6} className="mb-3">
          <Card className="stat-card accounts-card">
            <Card.Body>
              <div className="stat-icon">
                <FontAwesomeIcon icon={faBuilding} />
              </div>
              <div className="stat-content">
                <h4>Accounts</h4>
                <div className="stat-value">{stats.activeAccounts}</div>
                <div className="stat-label">Active of {stats.totalAccounts} total</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="stat-card users-card">
            <Card.Body>
              <div className="stat-icon">
                <FontAwesomeIcon icon={faUsersCog} />
              </div>
              <div className="stat-content">
                <h4>Users</h4>
                <div className="stat-value">{stats.activeUsers}</div>
                <div className="stat-label">Active of {stats.totalUsers} total</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="stat-card contracts-card">
            <Card.Body>
              <div className="stat-icon">
                <FontAwesomeIcon icon={faFileContract} />
              </div>
              <div className="stat-content">
                <h4>Contracts</h4>
                <div className="stat-value">{stats.activeContracts}</div>
                <div className="stat-label">Active of {stats.totalContracts} total</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="stat-card patients-card">
            <Card.Body>
              <div className="stat-icon">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div className="stat-content">
                <h4>Patients</h4>
                <div className="stat-value">{stats.totalPatients}</div>
                <div className="stat-label">Total patients in platform</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="dashboard-card">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <span>Platform Activity</span>
                <Button variant="link" size="sm" className="view-all-link">
                  View Details
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <p>From here you can manage all platform accounts and resources. Use the dropdown above to select a specific account to view or manage its details.</p>
              <Row>
                <Col md={6}>
                  <Button variant="primary" className="me-2">Manage Accounts</Button>
                  <Button variant="outline-primary">Manage Contracts</Button>
                </Col>
                <Col md={6} className="text-end">
                  <Button variant="success">View Reports</Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );

  // Render regular user dashboard
  const renderUserDashboard = () => (
    <>
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
    </>
  );

  return (
    <div className="dashboard-container">
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">{t('common.loading')}...</span>
          </div>
          <p className="mt-3">{t('common.loading')}...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        isStaff ? renderStaffDashboard() : renderUserDashboard()
      )}
    </div>
  );
};

export default Dashboard;