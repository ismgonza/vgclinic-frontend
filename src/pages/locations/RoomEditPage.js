// src/pages/locations/RoomEditPage.js (updated)
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Spinner } from 'react-bootstrap';
import MainLayout from '../../components/layout/MainLayout';
import RoomEditForm from '../../components/locations/RoomEditForm';
import locationService from '../../services/locationService';

const RoomEditPage = () => {
  const { id, roomId } = useParams();  // roomId is used in RoomEditForm via useParams
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
  }, [id]);  // We don't need roomId in the dependency array since it's not used in this effect

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
      <h1>Edit Room - {location.name}</h1>
      <p>Update room details for this location.</p>
      <RoomEditForm />  {/* RoomEditForm internally uses useParams to get roomId */}
    </MainLayout>
  );
};

export default RoomEditPage;