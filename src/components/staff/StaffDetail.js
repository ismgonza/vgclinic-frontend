// src/components/staff/StaffDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Row, Col, Badge, Button, Table, Spinner, Alert, Modal, Nav, Tab } from 'react-bootstrap';
import staffService from '../../services/staffService';

const StaffDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [locations, setLocations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true);
        const staffData = await staffService.getStaffMember(id);
        setStaff(staffData);
        
        // Fetch staff locations
        const locationsData = await staffService.getStaffLocations(id);
        setLocations(locationsData);
        
        // Fetch availability schedules
        const schedulesData = await staffService.getStaffSchedules(id);
        setSchedules(schedulesData);
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch staff data:', err);
        setError('Failed to load staff details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [id]);

  const handleDeleteStaff = async () => {
    try {
      await staffService.deleteStaffMember(id);
      navigate('/staff');
    } catch (err) {
      console.error('Failed to delete staff member:', err);
      setError('Failed to delete staff member. Please try again.');
      setShowDeleteModal(false);
    }
  };

  // Handle deleting a staff location assignment
  const handleDeleteStaffLocation = async (locationId) => {
    if (window.confirm('Are you sure you want to remove this location assignment? This action cannot be undone.')) {
      try {
        await staffService.deleteStaffLocation(locationId);
        // Update locations list after deletion
        const updatedLocations = locations.filter(loc => loc.id !== locationId);
        setLocations(updatedLocations);
      } catch (err) {
        console.error('Failed to delete location assignment:', err);
        setError('Failed to remove location. Please try again.');
      }
    }
  };

  // Handle deleting a schedule
  const handleDeleteSchedule = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule? This action cannot be undone.')) {
      try {
        await staffService.deleteSchedule(scheduleId);
        // Update schedules list after deletion
        const updatedSchedules = schedules.filter(schedule => schedule.id !== scheduleId);
        setSchedules(updatedSchedules);
      } catch (err) {
        console.error('Failed to delete schedule:', err);
        setError('Failed to delete schedule. Please try again.');
      }
    }
  };

  // Format time
  const formatTime = (timeString) => {
    return timeString.substring(0, 5); // HH:MM format
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

  if (!staff) {
    return <Alert variant="warning">Staff member not found.</Alert>;
  }

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'doctor':
        return 'primary';
      case 'assistant':
        return 'success';
      case 'receptionist':
        return 'info';
      case 'administrator':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{staff.user_details.full_name}</h2>
        <div>
          <Link to={`/staff/edit/${id}`} className="btn btn-primary me-2">
            Edit
          </Link>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            Delete
          </Button>
        </div>
      </div>

      <Tab.Container id="staff-tabs" activeKey={activeTab} onSelect={setActiveTab}>
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="general">General Information</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="locations">Assigned Locations</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="schedule">Availability Schedule</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="general">
            <Card className="mb-4">
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p><strong>Email:</strong> {staff.user_details.email}</p>
                    <p><strong>Job Title:</strong> {staff.job_title}</p>
                    <p><strong>Role:</strong> <Badge bg={getRoleBadgeVariant(staff.staff_role)}>{staff.role_display}</Badge></p>
                    <p><strong>Phone:</strong> {staff.phone || 'N/A'}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>License Number:</strong> {staff.license_number || 'N/A'}</p>
                    <p><strong>Status:</strong> {staff.is_active ? (
                      <Badge bg="success">Active</Badge>
                    ) : (
                      <Badge bg="secondary">Inactive</Badge>
                    )}</p>
                    <p><strong>Can Book Appointments:</strong> {staff.can_book_appointments ? 'Yes' : 'No'}</p>
                    <p><strong>Calendar Color:</strong> {staff.appointment_color && (
                      <span className="d-inline-block" 
                            style={{
                              width: '20px', 
                              height: '20px', 
                              backgroundColor: staff.appointment_color,
                              marginRight: '5px',
                              verticalAlign: 'middle',
                              borderRadius: '3px'
                            }}></span>
                    )} {staff.appointment_color || 'Not set'}</p>
                  </Col>
                </Row>
                
                {staff.specialties_details && staff.specialties_details.length > 0 && (
                  <>
                    <h5 className="mt-4">Specialties</h5>
                    <div className="d-flex flex-wrap gap-2">
                      {staff.specialties_details.map(specialty => (
                        <Badge key={specialty.id} bg="info">{specialty.name}</Badge>
                      ))}
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          </Tab.Pane>
          
          <Tab.Pane eventKey="locations">
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Assigned Locations</h5>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => navigate(`/staff/${id}/locations/add`)}
                >
                  Add Location
                </Button>
              </Card.Header>
              <Card.Body>
                {locations.length === 0 ? (
                  <Alert variant="info">
                    No locations assigned to this staff member yet. Click the button above to add a location.
                  </Alert>
                ) : (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Location Name</th>
                        <th>Address</th>
                        <th>Primary</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locations.map((location) => (
                        <tr key={location.id}>
                          <td>{location.location_details.name}</td>
                          <td>
                            {location.location_details.province}, {location.location_details.canton}
                          </td>
                          <td>
                            {location.is_primary ? (
                              <Badge bg="success">Primary</Badge>
                            ) : (
                              <Badge bg="light" text="dark">Secondary</Badge>
                            )}
                          </td>
                          <td>
                            <Button
                              variant="info"
                              size="sm"
                              className="me-2"
                              onClick={() => navigate(`/staff/${id}/locations/edit/${location.id}`)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteStaffLocation(location.id)}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Tab.Pane>
          
          <Tab.Pane eventKey="schedule">
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Availability Schedule</h5>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => navigate(`/staff/${id}/schedule/add`)}
                >
                  Add Schedule
                </Button>
              </Card.Header>
              <Card.Body>
                {schedules.length === 0 ? (
                  <Alert variant="info">
                    No availability schedules defined yet. Click the button above to add a schedule.
                  </Alert>
                ) : (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Location</th>
                        <th>Day</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Available</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedules.map((schedule) => (
                        <tr key={schedule.id}>
                          <td>{schedule.location_name}</td>
                          <td>{schedule.day_name}</td>
                          <td>{formatTime(schedule.start_time)}</td>
                          <td>{formatTime(schedule.end_time)}</td>
                          <td>
                            {schedule.is_available ? (
                              <Badge bg="success">Available</Badge>
                            ) : (
                              <Badge bg="danger">Unavailable</Badge>
                            )}
                          </td>
                          <td>
                            <Button
                              variant="info"
                              size="sm"
                              className="me-2"
                              onClick={() => navigate(`/staff/${id}/schedule/edit/${schedule.id}`)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteSchedule(schedule.id)}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the staff member "{staff.user_details.full_name}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteStaff}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default StaffDetail;