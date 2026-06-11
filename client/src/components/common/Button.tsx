import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  ariaLabel?: string;
}

export const Button: React.FC<ButtonProps> = React.memo(
  ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    type = 'button',
    ariaLabel,
    className = '',
    ...props
  }) => {
    const isBtnDisabled = disabled || isLoading;
    const btnClassName = `btn btn-${variant} btn-${size} ${isLoading ? 'btn-loading' : ''} ${className}`;

    return (
      <button
        type={type}
        className={btnClassName}
        disabled={isBtnDisabled}
        aria-disabled={isBtnDisabled}
        aria-busy={isLoading}
        aria-label={ariaLabel}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="spinner btn-spinner" role="status" aria-hidden="true" />
            <span className="sr-only">Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
