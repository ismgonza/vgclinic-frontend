// src/pages/locations/RoomCreatePage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Spinner } from 'react-bootstrap';
import MainLayout from '../../components/layout/MainLayout';
import RoomForm from '../../components/locations/RoomForm';
import locationService from '../../services/locationService';

const RoomCreatePage = () => {
  const { id } = useParams();  // Make sure this matches your route parameter name
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(true);
        const data = await locationService.getLocation(id);
        setLocation(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch location:', err);
        setError('Failed to load location. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Alert variant="danger">{error}</Alert>
      </MainLayout>
    );
  }

  if (!location) {
    return (
      <MainLayout>
        <Alert variant="warning">Location not found.</Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h1>Add Room to {location.name}</h1>
      <p>Create a new room for this location.</p>
      <RoomForm />
    </MainLayout>
  );
};

export default RoomCreatePage;