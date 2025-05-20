// src/pages/platform/Users.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faCheck, faTimes, faEnvelope, faUser, faUserTie, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import usersService from '../../services/users.service';
import UserForm from '../../components/platform/UserForm';

const Users = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersService.getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(t('common.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setCurrentUser(null);
    setShowForm(true);
  };

  const handleEditClick = (user) => {
    setCurrentUser(user);
    setShowForm(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await usersService.deleteUser(userToDelete.id);
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
      setSuccessMessage(t('users.userDeleted'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(t('common.errorDeleting'));
    }
  };

  const handleFormSave = async () => {
    await fetchUsers();
    setShowForm(false);
    setSuccessMessage(currentUser 
      ? t('users.userUpdated') 
      : t('users.userCreated'));
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const getIdTypeBadge = (idType) => {
    const variants = {
      '01': 'info',
      '02': 'secondary',
    };
    
    const labels = {
      '01': t('users.idTypeCedulaShort'),
      '02': t('users.idTypeDimexShort'),
    };
    
    return (
      <Badge bg={variants[idType] || 'secondary'}>
        {labels[idType] || idType}
      </Badge>
    );
  };

  const getActiveBadge = (isActive) => {
    return isActive ? (
      <Badge bg="success">{t('users.active')}</Badge>
    ) : (
      <Badge bg="danger">{t('users.inactive')}</Badge>
    );
  };

  const getUserRoleIcon = (user) => {
    if (user.is_superuser) {
      return <FontAwesomeIcon icon={faUserShield} title={t('users.superuser')} className="text-danger" />;
    } else if (user.is_staff) {
      return <FontAwesomeIcon icon={faUserTie} title={t('users.staff')} className="text-primary" />;
    } else {
      return <FontAwesomeIcon icon={faUser} title={t('users.regularUser')} className="text-secondary" />;
    }
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
            {t('users.back')}
          </Button>
          <UserForm 
            user={currentUser} 
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <>
          <Row className="mb-4">
            <Col>
              <h1 className="h3">{t('users.title')}</h1>
              <p className="text-muted">{t('users.description')}</p>
            </Col>
            <Col xs="auto">
              <Button variant="primary" onClick={handleAddClick}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                {t('users.newUser')}
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
                <span>{t('users.title')}</span>
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
              ) : users.length === 0 ? (
                <Alert variant="info">{t('users.noUsers')}</Alert>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>{t('users.name')}</th>
                      <th>{t('users.email')}</th>
                      <th>{t('users.role')}</th>
                      <th>{t('users.idType')}</th>
                      <th>{t('users.idNumber')}</th>
                      <th>{t('users.status')}</th>
                      <th>{t('users.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.first_name} {user.last_name}</td>
                        <td>
                          <a href={`mailto:${user.email}`} title={t('users.sendEmail')}>
                            <FontAwesomeIcon icon={faEnvelope} className="me-1" />
                            {user.email}
                          </a>
                        </td>
                        <td className="text-center">
                          {getUserRoleIcon(user)}
                        </td>
                        <td>{getIdTypeBadge(user.id_type)}</td>
                        <td>{user.id_number}</td>
                        <td>{getActiveBadge(user.is_active)}</td>
                        <td>
                          <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            className="me-1"
                            title={t('users.edit')}
                            onClick={() => handleEditClick(user)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            title={t('users.delete')}
                            onClick={() => handleDeleteClick(user)}
                            disabled={user.is_superuser} // Prevent deleting superusers
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
              <Modal.Title>{t('users.delete')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {t('users.confirmDelete')}
              {userToDelete && (
                <p className="mt-2 fw-bold">{userToDelete.first_name} {userToDelete.last_name} ({userToDelete.email})</p>
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

export default Users;