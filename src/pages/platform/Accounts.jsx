// src/pages/platform/Accounts.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faCheck, faTimes, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import accountsService from '../../services/accounts.service';
import AccountForm from '../../components/platform/AccountForm';

const Accounts = () => {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

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
      setError(t('common.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setCurrentAccount(null);
    setShowForm(true);
  };

  const handleEditClick = (account) => {
    setCurrentAccount(account);
    setShowForm(true);
  };

  const handleDeleteClick = (account) => {
    setAccountToDelete(account);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await accountsService.deleteAccount(accountToDelete.account_id);
      setAccounts(accounts.filter(a => a.account_id !== accountToDelete.account_id));
      setShowDeleteModal(false);
      setAccountToDelete(null);
      setSuccessMessage(t('accounts.accountDeleted'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(t('common.errorDeleting'));
    }
  };

  const handleFormSave = async () => {
    await fetchAccounts();
    setShowForm(false);
    setSuccessMessage(currentAccount 
      ? t('accounts.accountUpdated') 
      : t('accounts.accountCreated'));
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleFormCancel = () => {
    setShowForm(false);
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
      {showForm ? (
        <div>
          <Button 
            variant="outline-secondary" 
            className="mb-3"
            onClick={handleFormCancel}
          >
            {t('accounts.back')}
          </Button>
          <AccountForm 
            account={currentAccount} 
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <>
          <Row className="mb-4">
            <Col>
              <h1 className="h3">{t('accounts.title')}</h1>
              <p className="text-muted">{t('accounts.description')}</p>
            </Col>
            <Col xs="auto">
              <Button variant="primary" onClick={handleAddClick}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                {t('accounts.newAccount')}
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
                <span>{t('accounts.title')}</span>
                <div>
                  {/* Add filter/search controls here in the future */}
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" variant="primary" />
                  <p className="mt-3">{t('common.loading')}...</p>
                </div>
              ) : accounts.length === 0 ? (
                <Alert variant="info">{t('accounts.noAccounts')}</Alert>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>{t('accounts.accountName')}</th>
                      <th>{t('accounts.email')}</th>
                      <th>{t('accounts.phone')}</th>
                      <th>{t('accounts.status')}</th>
                      <th>{t('accounts.platAcc')}</th>
                      <th>{t('accounts.created')}</th>
                      <th>{t('accounts.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map(account => (
                      <tr key={account.account_id}>
                        <td>{account.account_name}</td>
                        <td>
                          <a href={`mailto:${account.account_email}`} title={t('accounts.sendEmail')}>
                            <FontAwesomeIcon icon={faEnvelope} className="me-1" />
                            {account.account_email}
                          </a>
                        </td>
                        <td>
                          {account.account_phone && (
                            <a href={`tel:${account.account_phone}`} title={t('accounts.call')}>
                              <FontAwesomeIcon icon={faPhone} className="me-1" />
                              {account.account_phone}
                            </a>
                          )}
                        </td>
                        <td>{getStatusBadge(account.account_status)}</td>
                        <td className="text-center">
                          {account.is_platform_account ? (
                            <FontAwesomeIcon icon={faCheck} className="text-success" />
                          ) : (
                            <FontAwesomeIcon icon={faTimes} className="text-danger" />
                          )}
                        </td>
                        <td>{formatDate(account.account_created_at)}</td>
                        <td>
                          <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            className="me-1"
                            title={t('accounts.edit')}
                            onClick={() => handleEditClick(account)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            title={t('accounts.delete')}
                            onClick={() => handleDeleteClick(account)}
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
          
          {/* Delete Confirmation Modal */}
          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>{t('accounts.delete')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {t('accounts.confirmDelete')}
              {accountToDelete && (
                <p className="mt-2 fw-bold">{accountToDelete.account_name}</p>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                {t('common.cancel')}
              </Button>
              <Button variant="danger" onClick={handleDeleteConfirm}>
                {t('common.confirm')}
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </Container>
  );
};

export default Accounts;