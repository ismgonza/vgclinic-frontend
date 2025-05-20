// src/pages/platform/Accounts.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import accountsService from '../../services/accounts.service';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountsService.getAccounts();
      setAccounts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Failed to load accounts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'active': 'success',
      'pending': 'warning',
      'suspended': 'danger'
    };
    return (
      <Badge bg={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="h3">Accounts Management</h1>
          <p className="text-muted">View and manage platform accounts</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary">
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            New Account
          </Button>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <span>All Accounts</span>
            <div>
              {/* Add filter/search controls here in the future */}
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary" />
              <p className="mt-3">Loading accounts...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : accounts.length === 0 ? (
            <Alert variant="info">No accounts found. Create your first account to get started.</Alert>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Account Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(account => (
                  <tr key={account.account_id}>
                    <td>{account.account_name}</td>
                    <td>{account.account_email}</td>
                    <td>{getStatusBadge(account.account_status)}</td>
                    <td>{formatDate(account.account_created_at)}</td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-1"
                        title="View Details"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        className="me-1"
                        title="Edit Account"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        title="Delete Account"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Accounts;