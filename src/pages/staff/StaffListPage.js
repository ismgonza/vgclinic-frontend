// src/pages/staff/StaffListPage.js
import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import StaffList from '../../components/staff/StaffList';

const StaffListPage = () => {
  return (
    <MainLayout>
      <h1>Staff</h1>
      <p>Manage your clinic staff members, including doctors, assistants, and other personnel.</p>
      <StaffList />
    </MainLayout>
  );
};

export default StaffListPage;