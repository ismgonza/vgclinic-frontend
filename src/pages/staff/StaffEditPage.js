// src/pages/staff/StaffEditPage.js
import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import StaffForm from '../../components/staff/StaffForm';

const StaffEditPage = () => {
  return (
    <MainLayout>
      <h1>Edit Staff Member</h1>
      <p>Update staff member information.</p>
      <StaffForm isEdit={true} />
    </MainLayout>
  );
};

export default StaffEditPage;