// src/components/platform/contracts/ContractDetails.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Table, ProgressBar, Alert, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import contractsService from '../../../services/contracts.service';
import featureOverridesService from '../../../services/featureOverrides.service';
import usageQuotasService from '../../../services/usageQuotas.service';

const ContractDetails = ({ contract, onClose, onRefresh }) => {
  const { t } = useTranslation();
  const [featureOverrides, setFeatureOverrides] = useState([]);
  const [usageQuotas, setUsageQuotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [currentOverride, setCurrentOverride] = useState(null);
  const [currentQuota, setCurrentQuota] = useState(null);

  useEffect(() => {
    if (contract) {
      fetchContractDetails();
    }
  }, [contract]);

  const fetchContractDetails = async () => {
    try {
      setLoading(true);
      const [overrides, quotas] = await Promise.all([
        featureOverridesService.getFeatureOverrides(contract.contract_number),
        usageQuotasService.getUsageQuotas(contract.contract_number)
      ]);
      setFeatureOverrides(overrides);
      setUsageQuotas(quotas);
      setError(null);
    } catch (err) {
      console.error('Error fetching contract details:', err);
      setError('Failed to load contract details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOverride = () => {
    setCurrentOverride(null);
    setShowOverrideModal(true);
  };

  const handleEditOverride = (override) => {
    setCurrentOverride(override);
    setShowOverrideModal(true);
  };

  const handleDeleteOverride = async (overrideId) => {
    if (window.confirm('Are you sure you want to delete this feature override?')) {
      try {
        await featureOverridesService.deleteFeatureOverride(overrideId);
        await fetchContractDetails();
      } catch (err) {
        setError('Failed to delete feature override');
      }
    }
  };

  const handleAddQuota = () => {
    setCurrentQuota(null);
    setShowQuotaModal(true);
  };

  const handleEditQuota = (quota) => {
    setCurrentQuota(quota);
    setShowQuotaModal(true);
  };

  const handleDeleteQuota = async (quotaId) => {
    if (window.confirm('Are you sure you want to delete this usage quota?')) {
      try {
        await usageQuotasService.deleteUsageQuota(quotaId);
        await fetchContractDetails();
      } catch (err) {
        setError('Failed to delete usage quota');
      }
    }
  };

  const handleIncrementUsage = async (quotaId) => {
    try {
      await usageQuotasService.incrementUsage(quotaId);
      await fetchContractDetails();
    } catch (err) {
      setError('Failed to increment usage');
    }
  };

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
    <>
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
          {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
          
          {/* Basic Contract Info */}
          <Row className="mb-4">
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

          {/* Feature Overrides */}
          <Row className="mb-4">
            <Col>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6>Feature Overrides</h6>
                <Button variant="primary" size="sm" onClick={handleAddOverride}>
                  <FontAwesomeIcon icon={faPlus} className="me-1" /> Add Override
                </Button>
              </div>
              {loading ? (
                <p>Loading...</p>
              ) : featureOverrides.length === 0 ? (
                <p className="text-muted">No feature overrides configured</p>
              ) : (
                <Table responsive hover size="sm">
                  <thead>
                    <tr>
                      <th>Feature Code</th>
                      <th>Type</th>
                      <th>Reason</th>
                      <th>Expires</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureOverrides.map(override => (
                      <tr key={override.id}>
                        <td>{override.feature_code}</td>
                        <td>
                          <Badge bg={override.override_type === 'grant' ? 'success' : 'danger'}>
                            {override.override_type === 'grant' ? 'Grant' : 'Restrict'}
                          </Badge>
                        </td>
                        <td>{override.reason || '-'}</td>
                        <td>{formatDate(override.expires_at)}</td>
                        <td>
                          <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleEditOverride(override)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteOverride(override.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Col>
          </Row>

          {/* Usage Quotas */}
          <Row>
            <Col>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6>Usage Quotas</h6>
                <Button variant="primary" size="sm" onClick={handleAddQuota}>
                  <FontAwesomeIcon icon={faPlus} className="me-1" /> Add Quota
                </Button>
              </div>
              {loading ? (
                <p>Loading...</p>
              ) : usageQuotas.length === 0 ? (
                <p className="text-muted">No usage quotas configured</p>
              ) : (
                <Table responsive hover size="sm">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Current / Limit</th>
                      <th>Usage</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageQuotas.map(quota => (
                      <tr key={quota.id}>
                        <td>{quota.quota_type.charAt(0).toUpperCase() + quota.quota_type.slice(1)}</td>
                        <td>{quota.current_usage} / {quota.limit}</td>
                        <td style={{ minWidth: '150px' }}>
                          <ProgressBar 
                            now={quota.percentage_used} 
                            variant={quota.is_exceeded ? 'danger' : quota.percentage_used > 80 ? 'warning' : 'success'}
                            label={`${quota.percentage_used.toFixed(1)}%`}
                          />
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleIncrementUsage(quota.id)}
                            title="Increment Usage"
                          >
                            +1
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleEditQuota(quota)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteQuota(quota.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Feature Override Modal */}
      <FeatureOverrideModal
        show={showOverrideModal}
        override={currentOverride}
        contractNumber={contract.contract_number}
        onClose={() => setShowOverrideModal(false)}
        onSave={() => {
          setShowOverrideModal(false);
          fetchContractDetails();
        }}
      />

      {/* Usage Quota Modal */}
      <UsageQuotaModal
        show={showQuotaModal}
        quota={currentQuota}
        contractNumber={contract.contract_number}
        onClose={() => setShowQuotaModal(false)}
        onSave={() => {
          setShowQuotaModal(false);
          fetchContractDetails();
        }}
      />
    </>
  );
};

// Feature Override Modal Component
const FeatureOverrideModal = ({ show, override, contractNumber, onClose, onSave }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    feature_code: '',
    override_type: 'grant',
    reason: '',
    expires_at: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (override) {
      setFormData({
        feature_code: override.feature_code || '',
        override_type: override.override_type || 'grant',
        reason: override.reason || '',
        expires_at: override.expires_at ? new Date(override.expires_at).toISOString().split('T')[0] : ''
      });
    } else {
      setFormData({
        feature_code: '',
        override_type: 'grant',
        reason: '',
        expires_at: ''
      });
    }
  }, [override, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dataToSend = {
        ...formData,
        contract: contractNumber
      };

      if (!dataToSend.expires_at) {
        delete dataToSend.expires_at;
      }

      if (override) {
        await featureOverridesService.updateFeatureOverride(override.id, dataToSend);
      } else {
        await featureOverridesService.createFeatureOverride(dataToSend);
      }
      
      onSave();
    } catch (err) {
      setError('Failed to save feature override');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{override ? 'Edit Feature Override' : 'Add Feature Override'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
          
          <Form.Group className="mb-3">
            <Form.Label>Feature Code <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="feature_code"
              value={formData.feature_code}
              onChange={handleChange}
              required
              placeholder="e.g., advanced_reporting"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Override Type <span className="text-danger">*</span></Form.Label>
            <Form.Select
              name="override_type"
              value={formData.override_type}
              onChange={handleChange}
              required
            >
              <option value="grant">Grant Access</option>
              <option value="restrict">Restrict Access</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Reason</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Optional reason for this override"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Expires At</Form.Label>
            <Form.Control
              type="date"
              name="expires_at"
              value={formData.expires_at}
              onChange={handleChange}
            />
            <Form.Text className="text-muted">
              Leave blank for no expiration
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

// Usage Quota Modal Component
const UsageQuotaModal = ({ show, quota, contractNumber, onClose, onSave }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    quota_type: 'users',
    limit: 5,
    current_usage: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const QUOTA_TYPE_OPTIONS = [
    { value: 'users', label: 'Users' },
    { value: 'locations', label: 'Locations' },
    { value: 'api_calls', label: 'API Calls' },
    { value: 'sms', label: 'SMS Messages' },
    { value: 'email', label: 'Email Messages' }
  ];

  useEffect(() => {
    if (quota) {
      setFormData({
        quota_type: quota.quota_type || 'users',
        limit: quota.limit || 5,
        current_usage: quota.current_usage || 0
      });
    } else {
      setFormData({
        quota_type: 'users',
        limit: 5,
        current_usage: 0
      });
    }
  }, [quota, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'limit' || name === 'current_usage' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dataToSend = {
        ...formData,
        contract: contractNumber
      };

      if (quota) {
        await usageQuotasService.updateUsageQuota(quota.id, dataToSend);
      } else {
        await usageQuotasService.createUsageQuota(dataToSend);
      }
      
      onSave();
    } catch (err) {
      setError('Failed to save usage quota');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{quota ? 'Edit Usage Quota' : 'Add Usage Quota'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
          
          <Form.Group className="mb-3">
            <Form.Label>Quota Type <span className="text-danger">*</span></Form.Label>
            <Form.Select
              name="quota_type"
              value={formData.quota_type}
              onChange={handleChange}
              required
              disabled={!!quota} // Can't change type when editing
            >
              {QUOTA_TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Limit <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="number"
              name="limit"
              value={formData.limit}
              onChange={handleChange}
              required
              min="0"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Current Usage</Form.Label>
            <Form.Control
              type="number"
              name="current_usage"
              value={formData.current_usage}
              onChange={handleChange}
              min="0"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ContractDetails;