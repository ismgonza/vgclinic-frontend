import React from 'react';
import { Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <Container>
        <div className="footer-content">
          <p className="mb-0">© {currentYear} VGClinic. {t('footer.allRightsReserved')}</p>
          <p className="mb-0 text-muted">{t('footer.tagline')}</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;