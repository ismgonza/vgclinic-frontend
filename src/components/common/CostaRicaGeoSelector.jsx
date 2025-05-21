import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const CostaRicaGeoSelector = ({ 
  formData, 
  onChange, 
  errors = {},
  required = false,
  colSize = { lg: 4, md: 4, sm: 12 }
}) => {
  const { t } = useTranslation();
  const [geoData, setGeoData] = useState(null);
  const [cantons, setCantons] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load geographic data
  useEffect(() => {
    fetch('/cr_geo_distribution.json')
      .then(response => response.json())
      .then(data => {
        setGeoData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading geographic data:', error);
        setLoading(false);
      });
  }, []);

  // Update cantons when province changes
  useEffect(() => {
    if (geoData && formData.province) {
      const provinceCantones = geoData[formData.province] || {};
      setCantons(Object.keys(provinceCantones));
      // Reset canton and district if province changed
      if (!Object.keys(provinceCantones).includes(formData.canton)) {
        onChange({ canton: '', district: '' });
        setDistricts([]);
      }
    } else {
      setCantons([]);
      setDistricts([]);
    }
  }, [formData.province, geoData]);

  // Update districts when canton changes
  useEffect(() => {
    if (geoData && formData.province && formData.canton) {
      const provinceData = geoData[formData.province] || {};
      const cantonDistritos = provinceData[formData.canton] || [];
      setDistricts(cantonDistritos);
      // Reset district if canton changed
      if (!cantonDistritos.includes(formData.district)) {
        onChange({ district: '' });
      }
    } else {
      setDistricts([]);
    }
  }, [formData.canton, formData.province, geoData]);

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  if (loading) {
    return <div>Loading geographic data...</div>;
  }

  return (
    <Row>
      <Col {...colSize}>
        <Form.Group className="mb-3">
          <Form.Label>
            {t('location.province')}
            {required && <span className="text-danger"> *</span>}
          </Form.Label>
          <Form.Select
            name="province"
            value={formData.province || ''}
            onChange={handleSelectChange}
            isInvalid={!!errors.province}
            required={required}
          >
            <option value="">{t('location.selectProvince')}</option>
            {geoData && Object.keys(geoData).map(province => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.province}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>

      <Col {...colSize}>
        <Form.Group className="mb-3">
          <Form.Label>
            {t('location.canton')}
            {required && <span className="text-danger"> *</span>}
          </Form.Label>
          <Form.Select
            name="canton"
            value={formData.canton || ''}
            onChange={handleSelectChange}
            isInvalid={!!errors.canton}
            required={required}
            disabled={!formData.province}
          >
            <option value="">{t('location.selectCanton')}</option>
            {cantons.map(canton => (
              <option key={canton} value={canton}>
                {canton}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.canton}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>

      <Col {...colSize}>
        <Form.Group className="mb-3">
          <Form.Label>
            {t('location.district')}
            {required && <span className="text-danger"> *</span>}
          </Form.Label>
          <Form.Select
            name="district"
            value={formData.district || ''}
            onChange={handleSelectChange}
            isInvalid={!!errors.district}
            required={required}
            disabled={!formData.canton}
          >
            <option value="">{t('location.selectDistrict')}</option>
            {districts.map(district => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.district}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
    </Row>
  );
};

export default CostaRicaGeoSelector;