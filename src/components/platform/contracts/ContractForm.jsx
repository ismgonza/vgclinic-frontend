import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import accountsService from '../../../services/accounts.service';
import usersService from '../../../services/users.service';
import plansService from '../../../services/plans.service';

const ContractForm = ({ contract, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    plan: '',  // Start with empty string
    contract_type: 'account',
    account: '',  // Start with empty string
    user: '',
    status: 'pending',
    is_trial: false,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    price_override: '',
    billing_period: 'monthly',
    auto_renew: false,
    notes: ''
  });

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch plans, accounts, and users in parallel
        const [plansResponse, accountsResponse, usersResponse] = await Promise.all([
          plansService.getPlans(),
          accountsService.getAccounts(),
          usersService.getUsers()
        ]);
        
        setPlans(plansResponse);
        setAccounts(accountsResponse);
        setUsers(usersResponse);
        
        // Don't set default selections - let user choose
      } catch (error) {
        console.error('Error fetching form data:', error);
        setError('Error loading form data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // If a contract is provided (for editing), populate the form
  useEffect(() => {
    if (contract) {
      setFormData({
        plan: contract.plan || '',
        contract_type: contract.contract_type || 'account',
        account: contract.account || '',
        user: contract.user || '',
        status: contract.status || 'pending',
        is_trial: contract.is_trial || false,
        start_date: contract.start_date ? new Date(contract.start_date).toISOString().split('T')[0] : '',
        end_date: contract.end_date ? new Date(contract.end_date).toISOString().split('T')[0] : '',
        price_override: contract.price_override || '',
        billing_period: contract.billing_period || 'monthly',
        auto_renew: contract.auto_renew || false,
        notes: contract.notes || ''
      });
    }
  }, [contract]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    
    // Special handling for number fields
    if (type === 'number' && value !== '') {
      newValue = parseFloat(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // If contract type changes, reset the target selection
    if (name === 'contract_type') {
      setFormData(prev => ({
        ...prev,
        account: '',  // Reset to empty
        user: ''      // Reset to empty
      }));
    }
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.plan) {
      setError('Please select a plan');
      return false;
    }
    
    if (formData.contract_type === 'account' && !formData.account) {
      setError('Please select an account');
      return false;
    }
    
    if (formData.contract_type === 'user' && !formData.user) {
      setError('Please select a user');
      return false;
    }
    
    if (!formData.start_date) {
      setError('Please select a start date');
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      // Prepare data for API
      const apiData = { ...formData };
      
      // Clear account or user based on contract type
      if (apiData.contract_type === 'account') {
        delete apiData.user;
      } else {
        delete apiData.account;
      }
      
      // Convert empty strings to null for nullable fields
      if (apiData.end_date === '') apiData.end_date = null;
      if (apiData.price_override === '') apiData.price_override = null;
      
      await onSave(apiData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Error saving contract. Please try again.');
    }
  };

  // Get billing period options
  const billingPeriodOptions = [
    { value: 'monthly', label: t('Monthly') },
    { value: 'quarterly', label: t('Quarterly') },
    { value: 'biannual', label: t('Bi-Annual') },
    { value: 'annual', label: t('Annual') }
  ];

  // Get status options
  const statusOptions = [
    { value: 'pending', label: t('Pending') },
    { value: 'active', label: t('Active') },
    { value: 'suspended', label: t('Suspended') },
    { value: 'terminated', label: t('Terminated') }
  ];

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading form data...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        {contract ? t('Edit Contract') : t('New Contract')}
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          {contract && (
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>Contract Number</Form.Label>
              <Col sm={9}>
                <Form.Control
                  type="text"
                  value={contract.contract_number}
                  disabled
                />
                <Form.Text className="text-muted">
                  Auto-generated contract number
                </Form.Text>
              </Col>
            </Form.Group>
          )}

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>Plan <span className="text-danger">*</span></Form.Label>
            <Col sm={9}>
              <Form.Select
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                required
                className={!formData.plan ? 'is-invalid' : ''}
              >
                <option value="">-- Select a plan --</option>
                {plans.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - ${plan.base_price}/{plan.billing_period}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>Contract Type</Form.Label>
            <Col sm={9}>
              <Form.Select
                name="contract_type"
                value={formData.contract_type}
                onChange={handleChange}
                required
              >
                <option value="account">Account Contract</option>
                <option value="user">User Contract</option>
              </Form.Select>
            </Col>
          </Form.Group>

          {formData.contract_type === 'account' && (
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>Account <span className="text-danger">*</span></Form.Label>
              <Col sm={9}>
                <Form.Select
                  name="account"
                  value={formData.account}
                  onChange={handleChange}
                  required
                  className={formData.contract_type === 'account' && !formData.account ? 'is-invalid' : ''}
                >
                  <option value="">-- Select an account --</option>
                  {accounts.map(account => (
                    <option key={account.account_id} value={account.account_id}>
                      {account.account_name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Form.Group>
          )}

          {formData.contract_type === 'user' && (
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>User <span className="text-danger">*</span></Form.Label>
              <Col sm={9}>
                <Form.Select
                  name="user"
                  value={formData.user}
                  onChange={handleChange}
                  required
                  className={formData.contract_type === 'user' && !formData.user ? 'is-invalid' : ''}
                >
                  <option value="">-- Select a user --</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Form.Group>
          )}

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>Status</Form.Label>
            <Col sm={9}>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Col sm={{ span: 9, offset: 3 }}>
              <Form.Check
                type="checkbox"
                id="is_trial"
                name="is_trial"
                label="Is Trial Contract"
                checked={formData.is_trial}
                onChange={handleChange}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>Start Date <span className="text-danger">*</span></Form.Label>
            <Col sm={9}>
              <Form.Control
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>End Date</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
              />
              <Form.Text className="text-muted">
                Leave blank for contracts without an end date
              </Form.Text>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>Price Override</Form.Label>
            <Col sm={9}>
              <Form.Control
                type="number"
                step="0.01"
                name="price_override"
                value={formData.price_override}
                onChange={handleChange}
                placeholder="Leave blank to use plan price"
              />
              <Form.Text className="text-muted">
                Custom price for this contract (if different from plan price)
              </Form.Text>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>Billing Period</Form.Label>
            <Col sm={9}>
              <Form.Select
                name="billing_period"
                value={formData.billing_period}
                onChange={handleChange}
                required
              >
                {billingPeriodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Col sm={{ span: 9, offset: 3 }}>
              <Form.Check
                type="checkbox"
                id="auto_renew"
                name="auto_renew"
                label="Auto Renew"
                checked={formData.auto_renew}
                onChange={handleChange}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>Notes</Form.Label>
            <Col sm={9}>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Optional notes about this contract"
              />
            </Col>
          </Form.Group>

          <Row className="mt-4">
            <Col className="d-flex justify-content-end">
              <Button 
                variant="secondary" 
                onClick={onCancel} 
                className="me-2"
              >
                {t('Cancel')}
              </Button>
              <Button 
                variant="primary" 
                type="submit"
              >
                {contract ? t('Update Contract') : t('Create Contract')}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ContractForm;