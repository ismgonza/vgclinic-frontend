import React, { useContext } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import './Navbar.css';

const AppNavbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem('preferredLanguage', language);
  };

  // Check if user is staff
  const isStaff = currentUser?.is_staff;

  return (
    <Navbar expand="lg" className="vgclinic-navbar">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="brand-text">
          VGClinic
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            {currentUser && (
              <>
                <Nav.Link as={Link} to="/dashboard">
                  {t('navigation.dashboard')}
                </Nav.Link>
                
               {/* Regular clinic menu items */}
               {!isStaff && (
                  <>
                    <Nav.Link as={Link} to="/clinic/locations">
                      {t('navigation.locations')}
                    </Nav.Link>
                    <Nav.Link as={Link} to="/clinic/catalog">
                      {t('navigation.catalog')}
                    </Nav.Link>
                    <Nav.Link as={Link} to="/patients">
                      {t('navigation.patients')}
                    </Nav.Link>
                    <Nav.Link as={Link} to="/treatments">
                      {t('navigation.treatments')}
                    </Nav.Link>
                  </>
                )}
                
                {/* Platform admin menu items - only for staff */}
                {isStaff && (
                  <>
                    <Nav.Link as={Link} to="/platform/accounts">
                      Accounts
                    </Nav.Link>
                    <Nav.Link as={Link} to="/platform/services">
                      Services
                    </Nav.Link>
                    <Nav.Link as={Link} to="/platform/contracts">
                      Contracts
                    </Nav.Link>
                    <Nav.Link as={Link} to="/platform/users">
                      Users
                    </Nav.Link>
                  </>
                )}
              </>
            )}
          </Nav>
          <Nav>
            <NavDropdown 
              title={
                <span>
                  <FontAwesomeIcon icon={faGlobe} className="me-1" />
                  {i18n.language === 'es' ? 'Español' : 'English'}
                </span>
              } 
              id="language-dropdown" 
              align="end"
              className="language-dropdown"
            >
              <NavDropdown.Item onClick={() => changeLanguage('en')} className={i18n.language === 'en' ? 'active' : ''}>
                English
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => changeLanguage('es')} className={i18n.language === 'es' ? 'active' : ''}>
                Español
              </NavDropdown.Item>
            </NavDropdown>
            
            {currentUser && (
              <NavDropdown 
                title={
                  <span>
                    <FontAwesomeIcon icon={faUser} className="me-1" />
                    {currentUser.first_name || t('navigation.user')}
                  </span>
                } 
                id="user-dropdown" 
                align="end"
                className="user-dropdown"
              >
                <NavDropdown.Item as={Link} to="/profile">
                  {t('navigation.profile')}
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                  {t('navigation.logout')}
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;