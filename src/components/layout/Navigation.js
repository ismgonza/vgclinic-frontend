// src/components/layout/Navigation.js (updated with AccountSelector)
import React from 'react';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import AccountSelector from './AccountSelector';
import logoImage from '../../assets/images/logo.png';

const Navigation = () => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img
            src={logoImage}
            height="30"
            className="d-inline-block align-top me-2"
            alt="VG Clinic Logo"
          />
          VG Clinic
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {isAuthenticated && (
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/patients">Patients</Nav.Link>
              <Nav.Link as={Link} to="/appointments">Appointments</Nav.Link>
              <Nav.Link as={Link} to="/catalog">Catalog</Nav.Link>
              <Nav.Link as={Link} to="/locations">Locations</Nav.Link>
              <Nav.Link as={Link} to="/staff">Staff</Nav.Link>
              <Nav.Link as={Link} to="/reports">Reports</Nav.Link>
            </Nav>
          )}
          
          <Nav className="d-flex align-items-center">
            {isAuthenticated && <AccountSelector />}
            
            {isAuthenticated ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" id="dropdown-user">
                  My Account
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">Profile</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;