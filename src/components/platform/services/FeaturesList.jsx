// src/components/platform/services/FeaturesList.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

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
    <div className="table-responsive">
      <table className="table table-striped table-hover">
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
                <button 
                  className="btn btn-sm btn-outline-primary me-1" 
                  onClick={() => onEdit(feature)}
                >
                  <i className="bi bi-pencil"></i>
                </button>
                <button 
                  className="btn btn-sm btn-outline-danger" 
                  onClick={() => onDelete(feature.id)}
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

export default FeaturesList;