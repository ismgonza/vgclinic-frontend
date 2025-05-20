// src/pages/platform/services/Plans.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import PlansList from '../../../components/platform/services/PlansList';
import PlanForm from '../../../components/platform/services/PlanForm';

const Plans = () => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState([]);
  const [services, setServices] = useState([]);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Fetch plans, services, and features
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [plansRes, servicesRes, featuresRes] = await Promise.all([
          axios.get('/api/services/plans/'),
          axios.get('/api/services/services/'),
          axios.get('/api/services/features/')
        ]);
        setPlans(plansRes.data);
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

  const handleAddPlan = () => {
    setEditingPlan(null);
    setIsFormOpen(true);
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setIsFormOpen(true);
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm(t('plans.confirmDelete'))) {
      try {
        await axios.delete(`/api/services/plans/${planId}/`);
        setPlans(plans.filter(p => p.id !== planId));
      } catch (err) {
        console.error('Error deleting plan:', err);
        setError(t('common.errorDeleting'));
      }
    }
  };

  const handleSavePlan = async (planData) => {
    try {
      let updatedPlans;
      if (editingPlan) {
        // Update existing plan
        const response = await axios.put(`/api/services/plans/${editingPlan.id}/`, planData);
        updatedPlans = plans.map(p => 
          p.id === editingPlan.id ? response.data : p
        );
      } else {
        // Create new plan
        const response = await axios.post('/api/services/plans/', planData);
        updatedPlans = [...plans, response.data];
      }
      setPlans(updatedPlans);
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error saving plan:', err);
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
          <h1>{t('plans.title')}</h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/platform/services">{t('services.title')}</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {t('plans.title')}
              </li>
            </ol>
          </nav>
        </div>
        
        <button 
          className="btn btn-primary" 
          onClick={handleAddPlan}
        >
          {t('plans.addPlan')}
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
        <PlansList 
          plans={plans} 
          onEdit={handleEditPlan} 
          onDelete={handleDeletePlan} 
        />
      )}

      {isFormOpen && (
        <PlanForm
          show={isFormOpen}
          plan={editingPlan}
          services={services}
          features={features}
          onSave={handleSavePlan}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default Plans;