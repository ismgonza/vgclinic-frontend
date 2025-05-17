import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import LocationForm from '../../components/locations/LocationForm';

const LocationCreatePage = () => {
  return (
    <MainLayout>
      <h1>Add New Location</h1>
      <p>Create a new clinic location.</p>
      <LocationForm />
    </MainLayout>
  );
};

export default LocationCreatePage;