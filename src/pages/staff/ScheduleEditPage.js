// src/pages/staff/ScheduleEditPage.js
import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import AvailabilityScheduleForm from '../../components/staff/AvailabilityScheduleForm';

const ScheduleEditPage = () => {
  return (
    <MainLayout>
      <h1>Edit Availability Schedule</h1>
      <p>Update the availability schedule for this staff member.</p>
      <AvailabilityScheduleForm isEdit={true} />
    </MainLayout>
  );
};

export default ScheduleEditPage;