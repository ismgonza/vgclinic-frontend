// src/components/clinic/RoomsModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import locationsService from '../../services/locations.service';
import RoomsList from './RoomsList';
import RoomForm from './RoomForm';

const RoomsModal = ({ show, branch, onClose }) => {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (show && branch) {
      fetchRooms();
    }
  }, [show, branch]);

  const fetchRooms = async () => {
    if (!branch) return;
    
    try {
      setLoading(true);
      const data = await locationsService.getRooms(branch.id);
      setRooms(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(t('common.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setCurrentRoom(null);
    setShowForm(true);
  };

  const handleEditClick = (room) => {
    setCurrentRoom(room);
    setShowForm(true);
  };

  const handleDeleteClick = (room) => {
    setRoomToDelete(room);
    setShowDeleteModal(true);
  };

  const handleFormSave = async (roomData) => {
    try {
      if (currentRoom) {
        await locationsService.updateRoom(currentRoom.id, roomData);
        setSuccessMessage(t('rooms.roomUpdated'));
      } else {
        await locationsService.createRoom(roomData);
        setSuccessMessage(t('rooms.roomCreated'));
      }
      
      await fetchRooms();
      setShowForm(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving room:', err);
      setError(t('common.errorSaving'));
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await locationsService.deleteRoom(roomToDelete.id);
      setRooms(rooms.filter(r => r.id !== roomToDelete.id));
      setShowDeleteModal(false);
      setRoomToDelete(null);
      setSuccessMessage(t('rooms.roomDeleted'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting room:', err);
      setError(t('common.errorDeleting'));
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      size="lg"
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {branch ? t('rooms.title') + ': ' + branch.name : t('rooms.title')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}
        
        {successMessage && (
          <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
            {successMessage}
          </Alert>
        )}
        
        <div className="d-flex justify-content-between mb-3">
          <p className="text-muted">{t('rooms.description')}</p>
          <Button 
            variant="primary" 
            size="sm"
            onClick={handleAddClick}
          >
            <FontAwesomeIcon icon={faPlus} className="me-1" />
            {t('rooms.newRoom')}
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" role="status" variant="primary" />
            <p className="mt-2">{t('common.loading')}...</p>
          </div>
        ) : (
          <RoomsList 
            rooms={rooms} 
            onEdit={handleEditClick} 
            onDelete={handleDeleteClick} 
          />
        )}
        
        {/* Room Form */}
        {branch && (
          <RoomForm 
            show={showForm}
            room={currentRoom}
            branchId={branch.id}
            onSave={handleFormSave}
            onClose={() => setShowForm(false)}
          />
        )}
        
        {/* Delete Confirmation */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{t('common.delete')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {t('rooms.confirmDelete')}
            {roomToDelete && (
              <p className="mt-2 fw-bold">{roomToDelete.name}</p>
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
      </Modal.Body>
      <Modal.Footer>

      </Modal.Footer>
    </Modal>
  );
};

export default RoomsModal;