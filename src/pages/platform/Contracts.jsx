import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faEye, faRedo } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import contractsService from '../../services/contracts.service';
import ContractForm from '../../components/platform/contracts/ContractForm';

const Contracts = () => {
  const { t } = useTranslation();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentContract, setCurrentContract] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contractToDelete, setContractToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const data = await contractsService.getContracts();
      setContracts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching contracts:', err);
      setError(t('Error loading contracts. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setCurrentContract(null);
    setShowForm(true);
  };

  const handleEditClick = (contract) => {
    setCurrentContract(contract);
    setShowForm(true);
  };

  const handleDeleteClick = (contract) => {
    setContractToDelete(contract);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await contractsService.deleteContract(contractToDelete.contract_number);
      setContracts(contracts.filter(c => c.contract_number !== contractToDelete.contract_number));
      setShowDeleteModal(false);
      setContractToDelete(null);
      setSuccessMessage(t('Contract deleted successfully'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting contract:', err);
      setError(t('Error deleting contract. Please try again.'));
    }
  };

  const handleFormSave = async (contractData) => {
    try {
      setError(null);
      
      if (currentContract) {
        // Update existing contract
        await contractsService.updateContract(currentContract.contract_number, contractData);
        setSuccessMessage(t('Contract updated successfully'));
      } else {
        // Create new contract
        const result = await contractsService.createContract(contractData);
        console.log('Contract created successfully:', result);
        setSuccessMessage(t('Contract created successfully'));
      }
      
      await fetchContracts();
      setShowForm(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving contract:', err);
      
      // Check if there's a specific error message from the server
      if (err.response?.data) {
        const errorData = err.response.data;
        let errorMessage = 'Error saving contract: ';
        
        if (typeof errorData === 'string') {
          errorMessage += errorData;
        } else if (typeof errorData === 'object') {
          // Handle field-specific errors
          const errors = Object.entries(errorData)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return `${field}: ${messages.join(', ')}`;
              }
              return `${field}: ${messages}`;
            })
            .join('; ');
          errorMessage += errors;
        } else {
          errorMessage += 'Please check your input and try again.';
        }
        
        setError(errorMessage);
      } else {
        setError(t('Error saving contract. Please try again.'));
      }
      
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const handleRenewClick = async (contract) => {
    try {
      await contractsService.renewContract(contract.contract_number);
      await fetchContracts();
      setSuccessMessage(t('Contract renewed successfully'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error renewing contract:', err);
      setError(t('Error renewing contract. Please try again.'));
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

  return (
    <Container fluid className="py-4">
      {showForm ? (
        <div>
          <Button 
            variant="outline-secondary" 
            className="mb-3"
            onClick={handleFormCancel}
          >
            {t('Back to Contracts')}
          </Button>
          <ContractForm 
            contract={currentContract} 
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <>
          <Row className="mb-4">
            <Col>
              <h1 className="h3">{t('Contracts Management')}</h1>
              <p className="text-muted">{t('View and manage platform contracts')}</p>
            </Col>
            <Col xs="auto">
              <Button variant="primary" onClick={handleAddClick}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                {t('New Contract')}
              </Button>
            </Col>
          </Row>

          {successMessage && (
            <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
              {successMessage}
            </Alert>
          )}

          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}

          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <span>{t('Contracts')}</span>
                <div>
                  {/* Add filter/search controls here in the future */}
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" variant="primary" />
                  <p className="mt-3">{t('Loading')}...</p>
                </div>
              ) : contracts.length === 0 ? (
                <Alert variant="info">{t('No contracts found. Create your first contract to get started.')}</Alert>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>{t('Account')}</th>
                      <th>{t('Plan')}</th>
                      <th>{t('Start Date')}</th>
                      <th>{t('End Date')}</th>
                      <th>{t('Status')}</th>
                      <th>{t('Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map(contract => (
                      <tr key={contract.contract_number}>
                        <td>
                          {contract.contract_type === 'account' 
                            ? (contract.account_details?.account_name || 'Unknown Account') 
                            : (contract.user_details?.email || 'Unknown User')}
                        </td>
                        <td>{contract.plan_details?.name}</td>
                        <td>{formatDate(contract.start_date)}</td>
                        <td>{formatDate(contract.end_date)}</td>
                        <td>{getStatusBadge(contract.status)}</td>
                        <td>
                          {/* <Button 
                            variant="outline-info" 
                            size="sm" 
                            className="me-1"
                            title={t('View Details')}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </Button> */}
                          <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            className="me-1"
                            title={t('Edit Contract')}
                            onClick={() => handleEditClick(contract)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            className="me-1"
                            title={t('Delete Contract')}
                            onClick={() => handleDeleteClick(contract)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                          {contract.status !== 'active' && (
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              title={t('Renew Contract')}
                              onClick={() => handleRenewClick(contract)}
                            >
                              <FontAwesomeIcon icon={faRedo} />
                            </Button>
                          )}
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
              <Modal.Title>{t('Delete Contract')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {t('Are you sure you want to delete this contract?')}
              {contractToDelete && (
                <p className="mt-2 fw-bold">
                  {contractToDelete.contract_type === 'account' 
                    ? contractToDelete.account_details?.account_name 
                    : contractToDelete.user_details?.email} - {contractToDelete.plan_details?.name}
                </p>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                {t('Cancel')}
              </Button>
              <Button variant="danger" onClick={handleDeleteConfirm}>
                {t('Confirm')}
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </Container>
  );
};

export default Contracts;