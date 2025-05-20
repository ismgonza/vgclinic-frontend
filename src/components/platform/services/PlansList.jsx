// src/components/platform/services/PlansList.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

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
    <div className="table-responsive">
      <table className="table table-striped table-hover">
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
                <button 
                  className="btn btn-sm btn-outline-primary me-1" 
                  onClick={() => onEdit(plan)}
                >
                  <i className="bi bi-pencil"></i>
                </button>
                <button 
                  className="btn btn-sm btn-outline-danger" 
                  onClick={() => onDelete(plan.id)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlansList;