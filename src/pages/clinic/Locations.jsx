// src/pages/clinic/Locations.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faMapMarkerAlt, faPhone, faEnvelope, faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { AccountContext } from '../../contexts/AccountContext';
import locationsService from '../../services/locations.service';
import LocationForm from '../../components/clinic/LocationForm';
import RoomsModal from '../../components/clinic/RoomsModal';


const Locations = () => {
  const { t } = useTranslation();
  const { selectedAccount } = useContext(AccountContext);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showRoomsModal, setShowRoomsModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Fetch branches when component mounts or account changes
  useEffect(() => {
    if (selectedAccount) {
      fetchBranches();
    } else {
      // Clear branches if no account selected
      setBranches([]);
      setLoading(false);
    }
  }, [selectedAccount]);

  const fetchBranches = async () => {
    if (!selectedAccount) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Set account context for API call
      const accountHeaders = {
        'X-Account-Context': selectedAccount.account_id
      };
      
      const data = await locationsService.getBranches(accountHeaders);
      setBranches(data);
      
      console.log('Loaded branches for account:', selectedAccount.account_name);
      console.log('Branches count:', data.length);
      
    } catch (err) {
      console.error('Error fetching branches:', err);
      setError('Error loading locations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setCurrentBranch(null);
    setShowForm(true);
  };

  const handleEditClick = (branch) => {
    setCurrentBranch(branch);
    setShowForm(true);
  };

  const handleDeleteClick = (branch) => {
    setBranchToDelete(branch);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await locationsService.deleteBranch(branchToDelete.id);
      setBranches(branches.filter(b => b.id !== branchToDelete.id));
      setShowDeleteModal(false);
      setBranchToDelete(null);
      setSuccessMessage('Location deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting branch:', err);
      setError('Error deleting location. Please try again.');
    }
  };

  const handleFormSave = async () => {
    await fetchBranches();
    setShowForm(false);
    setSuccessMessage(currentBranch 
      ? 'Location updated successfully' 
      : 'Location created successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge bg="success">{t('locations.active')}</Badge>
    ) : (
      <Badge bg="secondary">{t('locations.inactive')}</Badge>
    );
  };

  const handleManageRoomsClick = (branch) => {
    setSelectedBranch(branch);
    setShowRoomsModal(true);
  };

  // Show message if no account selected
  if (!selectedAccount) {
    return (
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <h1 className="h3">{t('locations.title')}</h1>
          </Col>
        </Row>
        <Alert variant="info">
          {t('locations.selectAccountFirst') || 'Please select a clinic first to view locations.'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {showForm ? (
        <div>
          <Button 
            variant="outline-secondary" 
            className="mb-3"
            onClick={handleFormCancel}
          >
            {t('locations.back')}
          </Button>
          <LocationForm 
            location={currentBranch} 
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <>
          <Row className="mb-4">
            <Col>
              <h1 className="h3">{t('locations.title')}</h1>
              <p className="text-muted">{t('locations.description')}</p>
            </Col>
            <Col xs="auto">
              <Button variant="primary" onClick={handleAddClick}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                {t('locations.newLocation')}
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
                {/* <span><strong>{selectedAccount.account_name}</strong>: {t('locations.locationsListTitle')}</span> */}
                <span>{t('locations.locationsListTitle')}</span>
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
              ) : branches.length === 0 ? (
                <Alert variant="info">{t('locations.noLocations')}</Alert>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>{t('locations.locationName')}</th>
                      <th>{t('locations.contact')}</th>
                      <th>{t('locations.address')}</th>
                      <th>{t('locations.room')}</th>
                      <th>{t('locations.status')}</th>
                      <th>{t('locations.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branches.map(branch => (
                      <tr key={branch.id}>
                        <td>
                          <div>
                            <strong>{branch.name}</strong>
                            {branch.account_details && (
                              <div className="text-muted small">
                                {branch.account_details.account_name}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="small">
                            <a href={`mailto:${branch.email}`} className="text-decoration-none">
                              <FontAwesomeIcon icon={faEnvelope} className="me-1" />
                              {branch.email}
                            </a>
                            <br />
                            <a href={`tel:${branch.phone}`} className="text-decoration-none">
                              <FontAwesomeIcon icon={faPhone} className="me-1" />
                              {branch.phone}
                            </a>
                          </div>
                        </td>
                        <td>
                          <div className="small">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1 text-muted" />
                            {branch.province}, {branch.canton}
                            <br />
                            <span className="text-muted">{branch.district}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            <FontAwesomeIcon icon={faDoorOpen} className="me-1" />
                            {branch.rooms ? branch.rooms.length : 0} {t('locations.room')}
                          </span>
                        </td>
                        <td>{getStatusBadge(branch.is_active)}</td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-1"
                            title={t('locations.manageRooms')}
                            onClick={() => handleManageRoomsClick(branch)}
                          >
                            <FontAwesomeIcon icon={faDoorOpen} />
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            className="me-1"
                            title="Edit Location"
                            onClick={() => handleEditClick(branch)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            title="Delete Location"
                            onClick={() => handleDeleteClick(branch)}
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
          <RoomsModal
            show={showRoomsModal}
            branch={selectedBranch}
            onClose={() => setShowRoomsModal(false)}
          />
          
          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>{t('locations.delete')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {t('locations.confirmDelete')}
              {branchToDelete && (
                <p className="mt-2 fw-bold">{branchToDelete.name}</p>
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

export default Locations;