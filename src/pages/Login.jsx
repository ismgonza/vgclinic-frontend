import React, { useState, useContext } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import './Login.css';

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false
    },
    validationSchema: Yup.object({
      email: Yup.string().email(t('login.invalidEmail')).required(t('login.required')),
      password: Yup.string().required(t('login.required')),
    }),
    onSubmit: async (values) => {
      try {
        setError('');
        setLoading(true);
        await login(values.email, values.password);
        navigate('/dashboard');
      } catch (err) {
        setError(t('login.failedSignIn'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <div className="user-icon">
          <FontAwesomeIcon icon={faUserCircle} size="4x" />
        </div>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={formik.handleSubmit}>
          <div className="input-group">
            <div className="input-icon">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <Form.Control
              type="email"
              name="email"
              placeholder={t('login.email')}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              isInvalid={formik.touched.email && formik.errors.email}
              className="login-input"
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <div className="error-message">{formik.errors.email}</div>
          )}
          
          <div className="input-group">
            <div className="input-icon">
              <FontAwesomeIcon icon={faLock} />
            </div>
            <Form.Control
              type="password"
              name="password"
              placeholder={t('login.password')}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              isInvalid={formik.touched.password && formik.errors.password}
              className="login-input"
            />
          </div>
          {formik.touched.password && formik.errors.password && (
            <div className="error-message">{formik.errors.password}</div>
          )}
          
          <div className="remember-forgot">
            <Form.Check 
              type="checkbox" 
              id="rememberMe"
              name="rememberMe"
              label={t('login.rememberMe')}
              onChange={formik.handleChange}
              checked={formik.values.rememberMe}
            />
            <a href="#forgot" className="forgot-link">{t('login.forgotPassword')}</a>
          </div>
          
          <Button 
            variant="primary" 
            type="submit" 
            className="login-button" 
            disabled={loading}
          >
            {t('login.loginButton')}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default Login;