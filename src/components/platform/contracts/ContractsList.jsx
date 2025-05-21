// src/components/platform/contracts/ContractsList.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Table, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';

const ContractsList = ({ contracts, onView, onEdit, onDelete }) => {
  const { t } = useTranslation();

  if (!contracts.length) {
    return (
      <div className="text-center my-5">
        <p>{t('contracts.noContracts')}</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Table responsive hover>
      <thead>
        <tr>
          <th>{t('contracts.account')}</th>
          <th>{t('contracts.plan')}</th>
          <th>{t('contracts.startDate')}</th>
          <th>{t('contracts.endDate')}</th>
          <th>{t('contracts.status')}</th>
          <th>{t('common.actions')}</th>
        </tr>
      </thead>
      <tbody>
        {contracts.map((contract) => (
          <tr key={contract.id}>
            <td>{contract.account_name}</td>
            <td>{contract.plan_name}</td>
            <td>{formatDate(contract.start_date)}</td>
            <td>{formatDate(contract.end_date)}</td>
            <td>
              <Badge bg={getStatusBadgeVariant(contract.status)}>
                {t(`contracts.status${contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}`)}
              </Badge>
            </td>
            <td>
              <Button 
                variant="outline-info" 
                size="sm" 
                className="me-1"
                title={t('common.view')}
                onClick={() => onView(contract)}
              >
                <FontAwesomeIcon icon={faEye} />
              </Button>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="me-1"
                title={t('common.edit')}
                onClick={() => onEdit(contract)}
              >
                <FontAwesomeIcon icon={faEdit} />
              </Button>
              <Button 
                variant="outline-danger" 
                size="sm"
                title={t('common.delete')}
                onClick={() => onDelete(contract)}
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

// Helper function to determine badge variant based on status
const getStatusBadgeVariant = (status) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'success';
    case 'pending':
      return 'warning';
    case 'terminated':
      return 'danger';
    case 'suspended':
      return 'secondary';
    default:
      return 'info';
  }
};

export default ContractsList;