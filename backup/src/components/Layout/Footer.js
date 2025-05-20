import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-light py-3 mt-auto">
      <Container>
        <div className="text-center">
          <p className="mb-0">© {new Date().getFullYear()} VGClinic. All rights reserved.</p>
          <p className="mb-0 text-muted">A modern clinic management system</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;