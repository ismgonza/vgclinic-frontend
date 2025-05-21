// src/components/platform/contracts/ContractDetails.jsx
import React from 'react';
import { Card, Row, Col, Badge, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const ContractDetails = ({ contract, onClose }) => {
  const { t } = useTranslation();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    const variants = {
      'active': 'success',
      'pending': 'warning',
      'suspended': 'danger',
      'terminated': 'secondary'
    };
    return (
      <Badge bg={variants[status] || 'info'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (!contract) return null;

  return (
    <Card>
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Contract Details: {contract.contract_number}</h5>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6}>
            <h6>Contract Information</h6>
            <p><strong>Type:</strong> {contract.contract_type === 'account' ? 'Account Contract' : 'User Contract'}</p>
            <p><strong>Target:</strong> {
              contract.contract_type === 'account' 
                ? (contract.account_details?.account_name || 'Unknown Account')
                : (contract.user_details?.email || 'Unknown User')
            }</p>
            <p><strong>Plan:</strong> {contract.plan_details?.name}</p>
            <p><strong>Status:</strong> {getStatusBadge(contract.status)}</p>
          </Col>
          <Col md={6}>
            <h6>Billing Information</h6>
            <p><strong>Price:</strong> ${contract.price_override || contract.plan_details?.base_price || 0}</p>
            <p><strong>Billing Period:</strong> {contract.billing_period}</p>
            <p><strong>Start Date:</strong> {formatDate(contract.start_date)}</p>
            <p><strong>End Date:</strong> {formatDate(contract.end_date)}</p>
            <p><strong>Auto Renew:</strong> {contract.auto_renew ? <FontAwesomeIcon icon={faCheck} className="text-success" /> : <FontAwesomeIcon icon={faTimes} className="text-danger" />}</p>
          </Col>
        </Row>
        
        {contract.notes && (
          <Row className="mt-3">
            <Col>
              <h6>Notes</h6>
              <p>{contract.notes}</p>
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
};

export default ContractDetails;