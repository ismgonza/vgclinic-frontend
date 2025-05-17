// src/components/staff/StaffList.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Badge, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import staffService from '../../services/staffService';
import { useAccount } from '../../context/AccountContext';

const StaffList = () => {
  const { currentAccount } = useAccount();
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    const fetchStaffMembers = async () => {
      if (!currentAccount) return;
      
      try {
        setLoading(true);
        const data = await staffService.getStaffMembers(currentAccount.id);
        setStaffMembers(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch staff members:', err);
        setError('Failed to load staff members. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffMembers();
  }, [currentAccount]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilter = (e) => {
    setRoleFilter(e.target.value);
  };

  // Filter staff members based on search term and role filter
  const filteredStaffMembers = staffMembers.filter((staff) => {
    const matchesSearch = 
      staff.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.job_title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter ? staff.staff_role === roleFilter : true;
    
    return matchesSearch && matchesRole;
  });

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
        <h5 className="mb-0">Clinic Staff</h5>
        <Link to="/staff/create">
          <Button variant="success" size="sm">
            <i className="fas fa-plus me-1"></i> Add New Staff Member
          </Button>
        </Link>
      </Card.Header>
      <Card.Body>
        {/* Filters */}
        <div className="row mb-4">
          <div className="col-md-6">
            <InputGroup>
              <InputGroup.Text>
                <i className="fas fa-search"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search by name or title..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </InputGroup>
          </div>
          <div className="col-md-6">
            <Form.Select 
              value={roleFilter} 
              onChange={handleRoleFilter}
              aria-label="Filter by role"
            >
              <option value="">All Roles</option>
              <option value="doctor">Doctors</option>
              <option value="assistant">Assistants</option>
              <option value="receptionist">Receptionists</option>
              <option value="administrator">Administrators</option>
              <option value="other">Other</option>
            </Form.Select>
          </div>
        </div>

        {filteredStaffMembers.length === 0 ? (
          <Alert variant="info">
            {staffMembers.length === 0 
              ? "No staff members found. Click the button above to add your first staff member."
              : "No staff members match your search criteria."}
          </Alert>
        ) : (
          <Table responsive hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Job Title</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaffMembers.map((staff) => (
                <tr key={staff.id}>
                  <td>
                    <Link to={`/staff/${staff.id}`} className="text-decoration-none">
                      {staff.full_name}
                    </Link>
                  </td>
                  <td>{staff.job_title}</td>
                  <td>
                    <Badge bg={getRoleBadgeVariant(staff.staff_role)}>
                      {staff.role_display}
                    </Badge>
                  </td>
                  <td>{staff.phone || 'N/A'}</td>
                  <td>
                    {staff.is_active ? (
                      <Badge bg="success">Active</Badge>
                    ) : (
                      <Badge bg="secondary">Inactive</Badge>
                    )}
                  </td>
                  <td>
                    <Link to={`/staff/${staff.id}`} className="btn btn-sm btn-info me-2">
                      View
                    </Link>
                    <Link to={`/staff/edit/${staff.id}`} className="btn btn-sm btn-primary me-2">
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

export default StaffList;