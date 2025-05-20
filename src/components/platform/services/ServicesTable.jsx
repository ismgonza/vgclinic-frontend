import React from 'react';
import { useTranslation } from 'react-i18next';

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
    <div className="table-responsive">
      <table className="table table-striped table-hover">
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
                <button 
                  className="btn btn-sm btn-outline-primary me-1" 
                  onClick={() => onEdit(service)}
                >
                  <i className="bi bi-pencil"></i>
                </button>
                <button 
                  className="btn btn-sm btn-outline-danger" 
                  onClick={() => onDelete(service.id)}
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

export default ServicesTable;