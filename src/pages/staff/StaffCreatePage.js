// src/pages/staff/StaffCreatePage.js
import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import StaffForm from '../../components/staff/StaffForm';

const StaffCreatePage = () => {
  return (
    <MainLayout>
      <h1>Add New Staff Member</h1>
      <p>Create a new staff member for your clinic.</p>
      <StaffForm />
    </MainLayout>
  );
};

export default StaffCreatePage;