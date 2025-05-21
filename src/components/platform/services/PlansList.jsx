// src/components/platform/services/PlansList.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const PlansList = ({ plans, onEdit, onDelete }) => {
  const { t } = useTranslation();

  if (!plans.length) {
    return (
      <div className="text-center my-5">
        <p>{t('plans.noPlans')}</p>
      </div>
    );
  }

  return (
    <Table responsive hover>
      <thead>
        <tr>
          <th>{t('plans.name')}</th>
          <th>{t('plans.code')}</th>
          <th>{t('plans.planType')}</th>
          <th>{t('plans.price')}</th>
          <th>{t('plans.billingPeriod')}</th>
          <th>{t('plans.status')}</th>
          <th>{t('common.actions')}</th>
        </tr>
      </thead>
      <tbody>
        {plans.map((plan) => (
          <tr key={plan.id}>
            <td>{plan.name}</td>
            <td>{plan.code}</td>
            <td>{t(`plans.planTypes.${plan.plan_type}`)}</td>
            <td>${plan.base_price}</td>
            <td>{t(`plans.billingPeriods.${plan.billing_period}`)}</td>
            <td>
              <span 
                className={`badge ${plan.is_active ? 'bg-success' : 'bg-secondary'}`}
              >
                {plan.is_active ? t('common.active') : t('common.inactive')}
              </span>
            </td>
            <td>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="me-1"
                title={t('common.edit')}
                onClick={() => onEdit(plan)}
              >
                <FontAwesomeIcon icon={faEdit} />
              </Button>
              <Button 
                variant="outline-danger" 
                size="sm"
                title={t('common.delete')}
                onClick={() => onDelete(plan)}
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

export default PlansList;