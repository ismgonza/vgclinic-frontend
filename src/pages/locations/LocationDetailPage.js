// src/pages/locations/LocationDetailPage.js
import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import LocationDetail from '../../components/locations/LocationDetail';

const LocationDetailPage = () => {
  return (
    <MainLayout>
      <h1>Location Details</h1>
      <LocationDetail />
    </MainLayout>
  );
};

export default LocationDetailPage;