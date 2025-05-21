// src/components/platform/services/ServicesTable.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const ServicesTable = ({ services, onEdit, onDelete }) => {
  const { t } = useTranslation();

  if (!services.length) {
    return (
      <div className="text-center my-5">
        <p>{t('services.noServices')}</p>
      </div>
    );
  }

  return (
    <Table responsive hover>
      <thead>
        <tr>
          <th>{t('services.name')}</th>
          <th>{t('services.code')}</th>
          <th>{t('services.features')}</th>
          <th>{t('services.status')}</th>
          <th>{t('common.actions')}</th>
        </tr>
      </thead>
      <tbody>
        {services.map((service) => (
          <tr key={service.id}>
            <td>{service.name}</td>
            <td>{service.code}</td>
            <td>
              {service.features_list && service.features_list.map(feature => (
                <span 
                  key={feature.id}
                  className="badge bg-secondary me-1 mb-1"
                >
                  {feature.name}
                </span>
              ))}
            </td>
            <td>
              <span 
                className={`badge ${service.is_active ? 'bg-success' : 'bg-secondary'}`}
              >
                {service.is_active ? t('common.active') : t('common.inactive')}
              </span>
            </td>
            <td>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="me-1"
                title={t('common.edit')}
                onClick={() => onEdit(service)}
              >
                <FontAwesomeIcon icon={faEdit} />
              </Button>
              <Button 
                variant="outline-danger" 
                size="sm"
                title={t('common.delete')}
                onClick={() => onDelete(service)}
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

export default ServicesTable;