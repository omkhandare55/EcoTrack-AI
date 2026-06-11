import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  label = 'Loading...',
  className = '',
}) => {
  return (
    <div className={`spinner-container ${className}`} role="status" aria-live="polite">
      <div className={`spinner spinner-${size}`} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
};
