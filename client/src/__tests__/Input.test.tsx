import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Input } from '../components/common/Input';

describe('Input Component', () => {
  it('should render label and input field correctly', () => {
    render(<Input label="Username" name="username" placeholder="Enter username" required />);

    expect(screen.getByLabelText('Username *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
  });

  it('should display error message and set accessibility attributes when invalid', () => {
    render(<Input label="Email" name="email" error="Please enter a valid email address" />);

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');

    const errorMsg = screen.getByRole('alert');
    expect(errorMsg).toHaveTextContent('Please enter a valid email address');

    // Check that input is described by the error message element
    const errorId = errorMsg.getAttribute('id');
    expect(input).toHaveAttribute('aria-describedby', errorId);
  });

  it('should link help text to input via aria-describedby', () => {
    render(<Input label="Password" name="password" helpText="Minimum 8 characters" />);

    const input = screen.getByLabelText('Password');
    const helpText = screen.getByText('Minimum 8 characters');
    const helpId = helpText.getAttribute('id');

    expect(input).toHaveAttribute('aria-describedby', helpId);
  });
});
