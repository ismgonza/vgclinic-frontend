// src/pages/staff/StaffDetailPage.js
import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import StaffDetail from '../../components/staff/StaffDetail';

const StaffDetailPage = () => {
  return (
    <MainLayout>
      <h1>Staff Details</h1>
      <StaffDetail />
    </MainLayout>
  );
};

export default StaffDetailPage;