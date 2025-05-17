// src/components/locations/LocationList.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import locationService from '../../services/locationService';

const LocationList = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const data = await locationService.getLocations();
        setLocations(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch locations:', err);
        setError('Failed to load locations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Clinic Locations</h5>
        <Link to="/locations/create">
          <Button variant="success" size="sm">
            <i className="fas fa-plus me-1"></i> Add New Location
          </Button>
        </Link>
      </Card.Header>
      <Card.Body>
        {locations.length === 0 ? (
          <Alert variant="info">
            No locations found. Click the button above to create your first location.
          </Alert>
        ) : (
          <Table responsive hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr key={location.id}>
                  <td>{location.name}</td>
                  <td>
                    {location.province}, {location.canton}, {location.district}<br />
                    <small>{location.address}</small>
                  </td>
                  <td>{location.phone || 'N/A'}</td>
                  <td>
                    {location.is_active ? (
                      <Badge bg="success">Active</Badge>
                    ) : (
                      <Badge bg="secondary">Inactive</Badge>
                    )}
                  </td>
                  <td>
                    <Link to={`/locations/${location.id}`} className="btn btn-sm btn-info me-2">
                      View
                    </Link>
                    <Link to={`/locations/edit/${location.id}`} className="btn btn-sm btn-primary me-2">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default LocationList;