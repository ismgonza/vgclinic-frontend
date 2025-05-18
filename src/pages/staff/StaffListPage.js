// src/pages/staff/StaffListPage.js (update with invitation option)
import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import StaffList from '../../components/staff/StaffList';
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const StaffListPage = () => {
  return (
    <MainLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Staff</h1>
        <Dropdown as={ButtonGroup}>
          <Button as={Link} to="/staff/create" variant="success">
            Add Staff Member
          </Button>
          <Dropdown.Toggle split variant="success" id="dropdown-split-basic" />
          <Dropdown.Menu>
            <Dropdown.Item as={Link} to="/staff/create">Add Existing User</Dropdown.Item>
            <Dropdown.Item as={Link} to="/staff/invite">Send Invitation</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <p>Manage your clinic staff members, including doctors, assistants, and other personnel.</p>
      <StaffList />
    </MainLayout>
  );
};

export default StaffListPage;