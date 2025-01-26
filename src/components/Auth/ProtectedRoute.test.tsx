import { render, screen } from '../../test/test-utils';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

// Mock the auth context
jest.mock('../../contexts/AuthContext');

describe('ProtectedRoute', () => {
  it('shows loading spinner when authenticating', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      loading: true
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      loading: false
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
}); 