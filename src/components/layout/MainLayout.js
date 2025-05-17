// src/components/layout/MainLayout.js
import React from 'react';
import { Container } from 'react-bootstrap';
import Navigation from './Navigation';

const MainLayout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navigation />
      <Container fluid className="flex-grow-1 py-3">
        {children}
      </Container>
      <footer className="py-3 bg-light text-center">
        <Container>
          <p className="mb-0">&copy; {new Date().getFullYear()} VG Clinic. All rights reserved.</p>
        </Container>
      </footer>
    </div>
  );
};

export default MainLayout;