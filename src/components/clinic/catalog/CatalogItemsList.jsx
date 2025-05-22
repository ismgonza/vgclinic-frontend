// src/components/clinic/catalog/CatalogItemsList.jsx
import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const CatalogItemsList = ({ items, onEdit, onDelete }) => {
  const { t } = useTranslation();

  if (!items || items.length === 0) {
    return (
      <div className="text-center my-5">
        <p>{t('catalog.noItems')}</p>
      </div>
    );
  }

  // Format price to 2 decimals with currency symbol
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  return (
    <Table responsive hover>
      <thead>
        <tr>
          <th>{t('catalog.code')}</th>
          <th>{t('catalog.name')}</th>
          <th>{t('catalog.specialty')}</th>
          <th>{t('catalog.price')}</th>
          <th>{t('catalog.variablePrice')}</th>
          <th>{t('catalog.status')}</th>
          <th>{t('common.actions')}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.code}</td>
            <td>{item.name}</td>
            <td>{item.specialty_details?.name || item.specialty}</td>
            <td>{formatPrice(item.price)}</td>
            <td>
              {item.is_variable_price ? (
                <Badge bg="info">{t('common.yes')}</Badge>
              ) : (
                <Badge bg="secondary">{t('common.no')}</Badge>
              )}
            </td>
            <td>
              <Badge bg={item.is_active ? 'success' : 'secondary'}>
                {item.is_active ? t('common.active') : t('common.inactive')}
              </Badge>
            </td>
            <td>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="me-1"
                title={t('common.edit')}
                onClick={() => onEdit(item)}
              >
                <FontAwesomeIcon icon={faEdit} />
              </Button>
              <Button 
                variant="outline-danger" 
                size="sm"
                title={t('common.delete')}
                onClick={() => onDelete(item)}
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

export default CatalogItemsList;