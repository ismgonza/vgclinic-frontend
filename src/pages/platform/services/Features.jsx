// src/pages/platform/services/Features.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import FeaturesList from '../../../components/platform/services/FeaturesList';
import FeatureForm from '../../../components/platform/services/FeatureForm';

const Features = () => {
  const { t } = useTranslation();
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);

  // Fetch features
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('/api/services/features/');
        setFeatures(response.data);
      } catch (err) {
        console.error('Error fetching features:', err);
        setError(t('common.errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  const handleAddFeature = () => {
    setEditingFeature(null);
    setIsFormOpen(true);
  };

  const handleEditFeature = (feature) => {
    setEditingFeature(feature);
    setIsFormOpen(true);
  };

  const handleDeleteFeature = async (featureId) => {
    if (window.confirm(t('features.confirmDelete'))) {
      try {
        await axios.delete(`/api/services/features/${featureId}/`);
        setFeatures(features.filter(f => f.id !== featureId));
      } catch (err) {
        console.error('Error deleting feature:', err);
        setError(t('common.errorDeleting'));
      }
    }
  };

  const handleSaveFeature = async (featureData) => {
    try {
      let updatedFeatures;
      if (editingFeature) {
        // Update existing feature
        const response = await axios.put(`/api/services/features/${editingFeature.id}/`, featureData);
        updatedFeatures = features.map(f => 
          f.id === editingFeature.id ? response.data : f
        );
      } else {
        // Create new feature
        const response = await axios.post('/api/services/features/', featureData);
        updatedFeatures = [...features, response.data];
      }
      setFeatures(updatedFeatures);
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error saving feature:', err);
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
          <h1>{t('features.title')}</h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/platform/services">{t('services.title')}</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {t('features.title')}
              </li>
            </ol>
          </nav>
        </div>
        
        <button 
          className="btn btn-primary" 
          onClick={handleAddFeature}
        >
          {t('features.addFeature')}
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
        <FeaturesList 
          features={features} 
          onEdit={handleEditFeature} 
          onDelete={handleDeleteFeature} 
        />
      )}

      {isFormOpen && (
        <FeatureForm
          show={isFormOpen}
          feature={editingFeature}
          onSave={handleSaveFeature}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default Features;