import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '70vh',
        textAlign: 'center',
        padding: '2rem',
        color: 'var(--text-primary)',
      }}
    >
      <span style={{ fontSize: '5rem', marginBottom: '1.5rem' }} aria-hidden="true">
        🏜️
      </span>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
        404 - Page Not Found
      </h1>
      <p
        style={{
          color: 'var(--text-secondary)',
          maxWidth: '450px',
          marginBottom: '2rem',
          lineHeight: 1.6,
        }}
      >
        The page you are looking for might have been removed, had its name changed, or is
        temporarily unavailable.
      </p>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Button variant="primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>
          Go to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
