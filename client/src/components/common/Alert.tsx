import React from 'react';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  message,
  onDismiss,
  className = '',
}) => {
  const role = type === 'error' ? 'alert' : 'status';
  const ariaLive = type === 'error' ? 'assertive' : 'polite';

  return (
    <div className={`alert alert-${type} ${className}`} role={role} aria-live={ariaLive}>
      <div className="alert-content">
        <span className="alert-icon" aria-hidden="true">
          {type === 'success' && '✓'}
          {type === 'warning' && '⚠'}
          {type === 'error' && '✗'}
          {type === 'info' && 'ℹ'}
        </span>
        <p className="alert-message">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          className="alert-dismiss-btn"
          onClick={onDismiss}
          aria-label="Dismiss alert"
        >
          &times;
        </button>
      )}
    </div>
  );
};
