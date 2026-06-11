import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';

export const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    label: string;
    color: string;
  }>({
    score: 0,
    label: 'Very Weak',
    color: '#ef4444',
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Live password strength checker
  useEffect(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    let label = 'Very Weak';
    let color = 'var(--danger)'; // red

    if (password.length === 0) {
      score = 0;
      label = '';
    } else if (score >= 4) {
      label = 'Strong';
      color = 'var(--success)'; // green
    } else if (score >= 3) {
      label = 'Medium';
      color = 'var(--warning)'; // orange
    } else {
      label = 'Weak';
      color = 'var(--danger)'; // red
    }

    setPasswordStrength({ score, label, color });
  }, [password]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (passwordStrength.score < 3) {
      setErrorMsg('Password is too weak. Please include numbers and letters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await register({ name, email, password });
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrorMsg(error.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {errorMsg && <Alert type="error" message={errorMsg} onDismiss={() => setErrorMsg(null)} />}

      <Input
        label="Full Name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Jane Doe"
        required
        autoComplete="name"
      />

      <Input
        label="Email Address"
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        autoComplete="email"
      />

      <div className="password-input-wrapper" style={{ position: 'relative' }}>
        <Input
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="new-password"
          helpText="Minimum 8 characters with letters and numbers."
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          style={{
            position: 'absolute',
            right: '12px',
            top: '40px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>

        {password.length > 0 && (
          <div
            className="password-strength-bar-wrapper"
            style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            aria-live="polite"
          >
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Strength:</span>
            <div
              style={{
                height: '6px',
                width: '100px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(passwordStrength.score / 5) * 100}%`,
                  backgroundColor: passwordStrength.color,
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: passwordStrength.color }}>
              {passwordStrength.label}
            </span>
          </div>
        )}
      </div>

      <Input
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="••••••••"
        required
        autoComplete="new-password"
      />

      <div className="form-submit-container" style={{ marginTop: '1.5rem' }}>
        <Button type="submit" isLoading={isLoading} disabled={isLoading} style={{ width: '100%' }}>
          Create Account
        </Button>
      </div>

      <p
        className="auth-redirect-text"
        style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}
      >
        Already have an account?{' '}
        <Link
          to="/login"
          className="auth-link"
          style={{ color: 'var(--accent-primary)', fontWeight: 600 }}
        >
          Sign in here
        </Link>
      </p>
    </form>
  );
};
