import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from '@/components/Auth/Login';
import { server } from '../../mocks/server';
import { http } from 'msw';
import { API_URL } from '@/config';

describe('Login Component', () => {
  it('renders login form', () => {
    render(<Login />);
    
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('shows validation errors for invalid inputs', async () => {
    render(<Login />);
    
    // Try to submit empty form
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    render(<Login />);
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Password123!' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard');
    });
  });

  it('handles login error', async () => {
    // Override the default handler for this test
    server.use(
      http.post(`${API_URL}/auth/login`, () => {
        return new Response(
          JSON.stringify({ message: 'Invalid credentials' }),
          { status: 401 }
        );
      })
    );
    
    render(<Login />);
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'wrong@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'WrongPassword123!' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    
    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  });

  it('handles network error', async () => {
    // Simulate network error
    server.use(
      http.post(`${API_URL}/auth/login`, () => {
        return Response.error();
      })
    );
    
    render(<Login />);
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Password123!' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    
    expect(await screen.findByText('Network error')).toBeInTheDocument();
  });

  it('maintains accessibility features under load', async () => {
    render(<Login />);
    
    // Check that form controls are properly labeled
    expect(screen.getByLabelText('Email')).toHaveFocus();
    
    // Check that error messages are announced to screen readers
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    
    const errorMessage = await screen.findByText('Email is required');
    expect(errorMessage).toHaveAttribute('role', 'alert');
  });
}); 