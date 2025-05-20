// src/pages/platform/services/Services.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Services = () => {
  const { t } = useTranslation();

  return (
    <div className="container mt-4">
      <h1>{t('services.title')}</h1>
      <p>{t('services.description')}</p>

      <div className="row mt-4">
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">{t('features.title')}</h5>
              <p className="card-text">{t('features.description')}</p>
              <Link to="/platform/services/features" className="btn btn-primary">
                {t('features.manage')}
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">{t('services.servicesTitle')}</h5>
              <p className="card-text">{t('services.serviceDescription')}</p>
              <Link to="/platform/services/services" className="btn btn-primary">
                {t('services.manage')}
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">{t('plans.title')}</h5>
              <p className="card-text">{t('plans.description')}</p>
              <Link to="/platform/services/plans" className="btn btn-primary">
                {t('plans.manage')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;