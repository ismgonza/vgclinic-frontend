import React, { useContext, useEffect, useState } from 'react';
import { Card, Row, Col, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserInjured, faTooth, faCalendarAlt, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [stats, setStats] = useState({
    patients: 0,
    treatments: 0,
    upcomingAppointments: 0,
    pendingPayments: 0
  });

  useEffect(() => {
    // You would implement these API calls to get actual data
    // For now, we'll just use dummy data
    // In a real application, you'd fetch this data from your backend
    setStats({
      patients: 120,
      treatments: 45,
      upcomingAppointments: 8,
      pendingPayments: 15
    });
  }, []);

  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>
      <p className="lead">Welcome back, {currentUser?.first_name || 'User'}!</p>
      
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 text-center">
            <Card.Body>
              <FontAwesomeIcon icon={faUserInjured} size="3x" className="mb-3 text-primary" />
              <Card.Title>Patients</Card.Title>
              <h3>{stats.patients}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 text-center">
            <Card.Body>
              <FontAwesomeIcon icon={faTooth} size="3x" className="mb-3 text-success" />
              <Card.Title>Treatments</Card.Title>
              <h3>{stats.treatments}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 text-center">
            <Card.Body>
              <FontAwesomeIcon icon={faCalendarAlt} size="3x" className="mb-3 text-warning" />
              <Card.Title>Upcoming</Card.Title>
              <h3>{stats.upcomingAppointments}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 text-center">
            <Card.Body>
              <FontAwesomeIcon icon={faMoneyBillWave} size="3x" className="mb-3 text-danger" />
              <Card.Title>Pending Payments</Card.Title>
              <h3>{stats.pendingPayments}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>Recent Patients</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>Maria González - Dental Cleaning - May 15, 2025</ListGroup.Item>
              <ListGroup.Item>Carlos Rodríguez - Root Canal - May 14, 2025</ListGroup.Item>
              <ListGroup.Item>Ana Martínez - Consultation - May 13, 2025</ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>Upcoming Appointments</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>Juan Pérez - 9:00 AM - May 20, 2025</ListGroup.Item>
              <ListGroup.Item>Laura Sanchez - 11:30 AM - May 20, 2025</ListGroup.Item>
              <ListGroup.Item>Roberto Diaz - 2:00 PM - May 20, 2025</ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;