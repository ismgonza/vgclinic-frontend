// src/pages/staff/StaffLocationEditPage.js
import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import StaffLocationForm from '../../components/staff/StaffLocationForm';

const StaffLocationEditPage = () => {
  return (
    <MainLayout>
      <h1>Edit Location Assignment</h1>
      <p>Update this location assignment.</p>
      <StaffLocationForm isEdit={true} />
    </MainLayout>
  );
};

export default StaffLocationEditPage;