// src/pages/staff/StaffLocationCreatePage.js
import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import StaffLocationForm from '../../components/staff/StaffLocationForm';
import { useParams } from 'react-router-dom';

const StaffLocationCreatePage = () => {
  const { id } = useParams();
  
  return (
    <MainLayout>
      <h1>Assign Location</h1>
      <p>Add a location to this staff member's assignments.</p>
      <StaffLocationForm />
    </MainLayout>
  );
};

export default StaffLocationCreatePage;