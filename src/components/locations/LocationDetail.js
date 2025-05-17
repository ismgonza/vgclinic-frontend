import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Table, Spinner, Alert, Modal } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import locationService from '../../services/locationService';

const LocationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        setLoading(true);
        const locationData = await locationService.getLocation(id);
        setLocation(locationData);
        
        // Fetch rooms for this location
        const roomsData = await locationService.getRooms(id);
        setRooms(roomsData);
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch location data:', err);
        setError('Failed to load location details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
  }, [id]);

  const handleDeleteLocation = async () => {
    if (window.confirm('Are you sure you want to delete this location? This action cannot be undone.')) {
      try {
        await locationService.deleteLocation(id);
        navigate('/locations');
      } catch (err) {
        console.error('Failed to delete location:', err);
        setError('Failed to delete location. Please try again.');
      }
    }
  };
  
  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;
    
    try {
      await locationService.deleteRoom(roomToDelete.id);
      // Update rooms list
      setRooms(rooms.filter(room => room.id !== roomToDelete.id));
      setShowDeleteModal(false);
      setRoomToDelete(null);
    } catch (err) {
      console.error('Failed to delete room:', err);
      setError('Failed to delete room. Please try again.');
    }
  };

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

  if (!location) {
    return <Alert variant="warning">Location not found.</Alert>;
  }

  return (
    <>
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Location Details</h5>
          <div>
            <Link to={`/locations/edit/${id}`} className="btn btn-primary btn-sm me-2">
              Edit
            </Link>
            <Button variant="danger" size="sm" onClick={handleDeleteLocation}>
              Delete
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p><strong>Name:</strong> {location.name}</p>
              <p><strong>Status:</strong> {' '}
                {location.is_active ? (
                  <Badge bg="success">Active</Badge>
                ) : (
                  <Badge bg="secondary">Inactive</Badge>
                )}
              </p>
              <p><strong>Phone:</strong> {location.phone || 'N/A'}</p>
              <p><strong>Email:</strong> {location.email || 'N/A'}</p>
            </Col>
            <Col md={6}>
              <p><strong>Address:</strong></p>
              <p>
                {location.province}, {location.canton}, {location.district}<br />
                {location.address}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Rooms</h5>
          <Button variant="success" size="sm" onClick={() => navigate(`/locations/${id}/rooms/create`)}>
            Add Room
          </Button>
        </Card.Header>
        <Card.Body>
          {rooms.length === 0 ? (
            <Alert variant="info">
              No rooms found for this location. Click the button above to add a room.
            </Alert>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Private</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id}>
                    <td>{room.name}</td>
                    <td>
                      {room.is_active ? (
                        <Badge bg="success">Active</Badge>
                      ) : (
                        <Badge bg="secondary">Inactive</Badge>
                      )}
                    </td>
                    <td>
                      {room.is_private ? (
                        <Badge bg="info">Private</Badge>
                      ) : (
                        <Badge bg="light" text="dark">Public</Badge>
                      )}
                    </td>
                    <td>
                      <Link 
                        to={`/locations/${id}/rooms/edit/${room.id}`} 
                        className="btn btn-sm btn-primary me-2"
                      >
                        Edit
                      </Link>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => {
                          setRoomToDelete(room);
                          setShowDeleteModal(true);
                        }}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the room "{roomToDelete?.name}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteRoom}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LocationDetail;