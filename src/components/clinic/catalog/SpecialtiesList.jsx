// src/components/clinic/catalog/SpecialtiesList.jsx
import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faList } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const SpecialtiesList = ({ specialties, onEdit, onDelete, onManageItems }) => {
  const { t } = useTranslation();

  if (!specialties || specialties.length === 0) {
    return (
      <div className="text-center my-5">
        <p>{t('catalog.noSpecialties')}</p>
      </div>
    );
  }

  return (
    <Table responsive hover>
      <thead>
        <tr>
          <th>{t('catalog.code')}</th>
          <th>{t('common.name')}</th>
          <th>{t('common.account')}</th>
          <th>{t('common.status')}</th>
          <th>{t('common.actions')}</th>
        </tr>
      </thead>
      <tbody>
        {specialties.map((specialty) => (
          <tr key={specialty.id}>
            <td>{specialty.code}</td>
            <td>{specialty.name}</td>
            <td>{specialty.account_details?.account_name || specialty.account}</td>
            <td>
              <Badge bg={specialty.is_active ? 'success' : 'secondary'}>
                {specialty.is_active ? t('common.active') : t('common.inactive')}
              </Badge>
            </td>
            <td>
              <Button 
                variant="outline-info" 
                size="sm" 
                className="me-1"
                title={t('catalog.manageItems')}
                onClick={() => onManageItems(specialty)}
              >
                <FontAwesomeIcon icon={faList} />
              </Button>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="me-1"
                title={t('common.edit')}
                onClick={() => onEdit(specialty)}
              >
                <FontAwesomeIcon icon={faEdit} />
              </Button>
              <Button 
                variant="outline-danger" 
                size="sm"
                title={t('common.delete')}
                onClick={() => onDelete(specialty)}
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

export default SpecialtiesList;