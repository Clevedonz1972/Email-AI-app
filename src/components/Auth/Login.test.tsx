import { render, screen, fireEvent, waitFor } from '../../test/test-utils';
import { Login } from './Login';
import { useAuth } from '../../contexts/AuthContext';

jest.mock('../../contexts/AuthContext');

describe('Login', () => {
  it('renders login form correctly', () => {
    render(<Login />);
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    const mockLogin = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ login: mockLogin });

    render(<Login />);
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    expect(screen.getByText('Invalid Email or Password')).toBeInTheDocument();
  });
}); 