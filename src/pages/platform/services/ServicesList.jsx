// src/pages/platform/services/ServicesList.jsx - Actual services management page
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ServicesTable from '../../../components/platform/services/ServicesTable';
import ServiceForm from '../../../components/platform/services/ServiceForm';

const ServicesList = () => {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Fetch services and features
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [servicesRes, featuresRes] = await Promise.all([
          axios.get('/api/services/services/'),
          axios.get('/api/services/features/')
        ]);
        setServices(servicesRes.data);
        setFeatures(featuresRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(t('common.errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  const handleAddService = () => {
    setEditingService(null);
    setIsFormOpen(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm(t('services.confirmDelete'))) {
      try {
        await axios.delete(`/api/services/services/${serviceId}/`);
        setServices(services.filter(s => s.id !== serviceId));
      } catch (err) {
        console.error('Error deleting service:', err);
        setError(t('common.errorDeleting'));
      }
    }
  };

  const handleSaveService = async (serviceData) => {
    try {
      let updatedServices;
      if (editingService) {
        // Update existing service
        const response = await axios.put(`/api/services/services/${editingService.id}/`, serviceData);
        updatedServices = services.map(s => 
          s.id === editingService.id ? response.data : s
        );
      } else {
        // Create new service
        const response = await axios.post('/api/services/services/', serviceData);
        updatedServices = [...services, response.data];
      }
      setServices(updatedServices);
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error saving service:', err);
      setError(t('common.errorSaving'));
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>{t('services.servicesTitle')}</h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/platform/services">{t('services.title')}</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {t('services.servicesTitle')}
              </li>
            </ol>
          </nav>
        </div>
        
        <button 
          className="btn btn-primary" 
          onClick={handleAddService}
        >
          {t('services.addService')}
        </button>
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">{t('common.loading')}</span>
          </div>
        </div>
      ) : (
        <ServicesTable
          services={services} 
          onEdit={handleEditService} 
          onDelete={handleDeleteService} 
        />
      )}

      {isFormOpen && (
        <ServiceForm
          show={isFormOpen}
          service={editingService}
          features={features}
          onSave={handleSaveService}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default ServicesList;