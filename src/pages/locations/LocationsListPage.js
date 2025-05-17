// src/pages/locations/LocationsListPage.js
import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import LocationList from '../../components/locations/LocationList';

const LocationsListPage = () => {
  return (
    <MainLayout>
      <h1>Locations</h1>
      <p>Manage your clinic locations and rooms.</p>
      <LocationList />
    </MainLayout>
  );
};

export default LocationsListPage;