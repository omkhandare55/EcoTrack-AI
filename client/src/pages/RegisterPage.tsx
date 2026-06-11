import React from 'react';
import { RegisterForm } from '../components/forms/RegisterForm';
import { Card } from '../components/common/Card';

export const RegisterPage: React.FC = () => {
  return (
    <div className="auth-page-container">
      <div className="auth-card-wrapper">
        <div className="auth-branding" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '3rem' }} aria-hidden="true">
            🌱
          </span>
          <h1
            className="auth-title"
            style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}
          >
            Join EcoTrack AI
          </h1>
          <p
            className="auth-subtitle"
            style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}
          >
            Start tracking and minimizing your carbon footprint today.
          </p>
        </div>

        <Card tagName="div">
          <RegisterForm />
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
