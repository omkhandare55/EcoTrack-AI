import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  helpText?: string;
}

export const Input: React.FC<InputProps> = React.memo(
  ({
    label,
    name,
    type = 'text',
    error,
    helpText,
    required = false,
    id,
    className = '',
    ...props
  }) => {
    const inputId = id || `input-${name}`;
    const errorId = `${inputId}-error`;
    const helpId = `${inputId}-help`;

    let ariaDescribedBy = '';
    if (error) ariaDescribedBy += ` ${errorId}`;
    if (helpText) ariaDescribedBy += ` ${helpId}`;
    ariaDescribedBy = ariaDescribedBy.trim();

    return (
      <div className={`input-group ${error ? 'has-error' : ''} ${className}`}>
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && (
            <span className="label-required" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
        <input
          type={type}
          id={inputId}
          name={name}
          className="input-field"
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={ariaDescribedBy || undefined}
          {...props}
        />
        {helpText && !error && (
          <span id={helpId} className="input-help">
            {helpText}
          </span>
        )}
        {error && (
          <span id={errorId} className="input-error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
