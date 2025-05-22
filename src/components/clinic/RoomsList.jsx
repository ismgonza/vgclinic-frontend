// src/components/clinic/RoomsList.jsx
import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const RoomsList = ({ rooms, onEdit, onDelete }) => {
  const { t } = useTranslation();

  if (!rooms || rooms.length === 0) {
    return (
      <div className="text-center my-3">
        <p>{t('rooms.noRooms')}</p>
      </div>
    );
  }

  return (
    <Table responsive hover className="mt-3">
      <thead>
        <tr>
          <th>{t('rooms.roomName')}</th>
          <th>{t('common.status')}</th>
          <th>{t('rooms.private')}</th>
          <th>{t('common.actions')}</th>
        </tr>
      </thead>
      <tbody>
        {rooms.map(room => (
          <tr key={room.id}>
            <td>{room.name}</td>
            <td>
              <Badge bg={room.is_active ? 'success' : 'secondary'}>
                {room.is_active ? t('common.active') : t('common.inactive')}
              </Badge>
            </td>
            <td>
              <Badge bg={room.is_private ? 'info' : 'light'} text={room.is_private ? 'white' : 'dark'}>
                {room.is_private ? t('common.yes') : t('common.no')}
              </Badge>
            </td>
            <td>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="me-1"
                onClick={() => onEdit(room)}
              >
                <FontAwesomeIcon icon={faEdit} />
              </Button>
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={() => onDelete(room)}
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default RoomsList;