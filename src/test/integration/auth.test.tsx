import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { Login } from '@/components/Auth/Login';
import { ForgotPassword } from '@/components/Auth/ForgotPassword';
import { ResetPassword } from '@/components/Auth/ResetPassword';

describe('Authentication Flow', () => {
  it('allows user to login', async () => {
    render(<Login />);
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard');
    });
  });

  it('handles forgot password flow', async () => {
    render(<ForgotPassword />);
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }));
    
    await waitFor(() => {
      expect(screen.getByText('Reset link sent')).toBeInTheDocument();
    });
  });

  it('handles password reset', async () => {
    render(<ResetPassword />, { route: '/reset-password/valid-token' });
    
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'NewPassword123!' }
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'NewPassword123!' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
  });
}); 