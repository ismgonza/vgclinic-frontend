// src/pages/locations/LocationEditPage.js
import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import LocationForm from '../../components/locations/LocationForm';

const LocationEditPage = () => {
  return (
    <MainLayout>
      <h1>Edit Location</h1>
      <p>Update location details.</p>
      <LocationForm isEdit={true} />
    </MainLayout>
  );
};

export default LocationEditPage;