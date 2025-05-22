// src/components/clinic/TreatmentsList.jsx
import React from 'react';
import { Table, Button, Badge, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const TreatmentsList = ({ treatments, onStatusChange, onViewTreatment, loading }) => {
  const { t } = useTranslation();

  // Format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    const timeStr = date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    if (isToday) {
      return `Today, ${timeStr}`;
    } else {
      const dateStr = date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric' 
      });
      return `${dateStr}, ${timeStr}`;
    }
  };

  // Calculate patient age
  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'primary';
      case 'IN_PROGRESS':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      case 'CANCELED':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Get billing badge variant
  const getBillingBadgeVariant = (status) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PARTIAL':
        return 'warning';
      case 'PENDING':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Status options for dropdown
  const statusOptions = [
    { value: 'SCHEDULED', label: t('treatments.status.SCHEDULED') },
    { value: 'IN_PROGRESS', label: t('treatments.status.IN_PROGRESS') },
    { value: 'COMPLETED', label: t('treatments.status.COMPLETED') },
    { value: 'CANCELED', label: t('treatments.status.CANCELED') }
  ];

  // Handle status change
  const handleStatusChange = (treatmentId, newStatus) => {
    onStatusChange(treatmentId, newStatus);
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">{t('common.loading')}...</span>
        </div>
      </div>
    );
  }

  if (!treatments || treatments.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">{t('treatments.noTreatments')}</p>
      </div>
    );
  }

  return (
    <Table responsive hover className="treatments-table">
      <thead>
        <tr>
          <th>{t('treatments.fields.patient')}</th>
          <th>{t('treatments.fields.treatment')}</th>
          <th>{t('treatments.fields.doctor')}</th>
          <th>{t('treatments.fields.branch')}</th>
          <th>{t('treatments.fields.status')}</th>
          <th>{t('treatments.fields.billing')}</th>
          <th>{t('common.actions')}</th>
        </tr>
      </thead>
      <tbody>
        {treatments.map((treatment) => (
          <tr key={treatment.id}>
            {/* Patient Column */}
            <td className="patient-cell">
              <div className="patient-info">
                <div className="patient-name fw-bold">
                  {treatment.patient_details?.full_name || 
                   `${treatment.patient_details?.first_name} ${treatment.patient_details?.last_name1} ${treatment.patient_details?.last_name2 || ''}`.trim()
                  }
                  {treatment.patient_details?.birth_date && (
                    <span className="text-muted"> ({calculateAge(treatment.patient_details.birth_date)})</span>
                  )}
                </div>
                <div className="patient-id text-muted small">
                  ID: {treatment.patient_details?.id_number || 'N/A'}
                </div>
                <div className="patient-phone text-muted small">
                  {treatment.patient_details?.phones && treatment.patient_details.phones.length > 0 ? (
                    `Ph: ${treatment.patient_details.phones[0].phone_number}`
                  ) : (
                    'Ph: N/A'
                  )}
                </div>
              </div>
            </td>

            {/* Treatment Column */}
            <td className="treatment-cell">
              <div className="treatment-name fw-bold">
                {treatment.catalog_item_details?.name || 'Treatment'}
              </div>
              <div className="treatment-date text-muted small">
                {formatDateTime(treatment.scheduled_date)}
              </div>
            </td>

            {/* Doctor Column */}
            <td className="doctor-cell">
              <div className="doctor-name">
                {treatment.doctor_details ? 
                  `${treatment.doctor_details.first_name} ${treatment.doctor_details.last_name}` : 
                  'N/A'
                }
              </div>
            </td>

            {/* Branch Column */}
            <td className="branch-cell">
              <div className="branch-name">
                {treatment.location_details?.name || 'N/A'}
              </div>
            </td>

            {/* Status Column */}
            <td className="status-cell">
              <Form.Select
                size="sm"
                value={treatment.status}
                onChange={(e) => handleStatusChange(treatment.id, e.target.value)}
                className={`status-select status-${treatment.status.toLowerCase()}`}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </td>

            {/* Billing Column */}
            <td className="billing-cell">
              <Badge 
                bg={getBillingBadgeVariant(treatment.billing_status)}
                className="billing-badge"
              >
                {treatment.billing_status ? 
                  t(`treatments.billing.${treatment.billing_status}`) : 
                  t('treatments.billing.PENDING')
                }
              </Badge>
            </td>

            {/* Actions Column */}
            <td className="actions-cell">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => onViewTreatment(treatment)}
                title={t('treatments.actions.view')}
              >
                <FontAwesomeIcon icon={faEye} />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TreatmentsList;