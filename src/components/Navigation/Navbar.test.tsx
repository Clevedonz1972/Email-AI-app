import { render, screen, fireEvent } from '../../test/test-utils';
import { Navbar } from './Navbar';
import { useAuth } from '../../contexts/AuthContext';

jest.mock('../../contexts/AuthContext');

describe('Navbar', () => {
  it('shows login and register buttons when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null
    });

    render(<Navbar />);

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('shows user email and logout button when authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { email: 'test@example.com' }
    });

    render(<Navbar />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('toggles theme when theme button is clicked', () => {
    render(<Navbar />);
    
    const themeButton = screen.getByLabelText('Switch to Dark Mode');
    fireEvent.click(themeButton);
    
    expect(screen.getByLabelText('Switch to Light Mode')).toBeInTheDocument();
  });
}); 