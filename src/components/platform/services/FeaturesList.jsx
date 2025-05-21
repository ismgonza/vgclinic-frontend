// src/components/platform/services/FeaturesList.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const FeaturesList = ({ features, onEdit, onDelete }) => {
  const { t } = useTranslation();

  if (!features.length) {
    return (
      <div className="text-center my-5">
        <p>{t('features.noFeatures')}</p>
      </div>
    );
  }

  return (
    <Table responsive hover>
      <thead>
        <tr>
          <th>{t('features.name')}</th>
          <th>{t('features.code')}</th>
          <th>{t('features.category')}</th>
          <th>{t('features.status')}</th>
          <th>{t('common.actions')}</th>
        </tr>
      </thead>
      <tbody>
        {features.map((feature) => (
          <tr key={feature.id}>
            <td>{feature.name}</td>
            <td>{feature.code}</td>
            <td>{t(`features.categories.${feature.category}`)}</td>
            <td>
              <span 
                className={`badge ${feature.is_active ? 'bg-success' : 'bg-secondary'}`}
              >
                {feature.is_active ? t('common.active') : t('common.inactive')}
              </span>
            </td>
            <td>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="me-1"
                title={t('common.edit')}
                onClick={() => onEdit(feature)}
              >
                <FontAwesomeIcon icon={faEdit} />
              </Button>
              <Button 
                variant="outline-danger" 
                size="sm"
                title={t('common.delete')}
                onClick={() => onDelete(feature)}
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

export default FeaturesList;