// src/pages/staff/ScheduleCreatePage.js
import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import AvailabilityScheduleForm from '../../components/staff/AvailabilityScheduleForm';

const ScheduleCreatePage = () => {
  return (
    <MainLayout>
      <h1>Add Availability Schedule</h1>
      <p>Create a new availability schedule for this staff member.</p>
      <AvailabilityScheduleForm />
    </MainLayout>
  );
};

export default ScheduleCreatePage;