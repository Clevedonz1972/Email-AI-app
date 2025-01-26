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

    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByText(/register/i)).toBeInTheDocument();
  });

  it('shows user email and logout button when authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { email: 'test@example.com' }
    });

    render(<Navbar />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
  });

  it('toggles theme when theme button is clicked', () => {
    render(<Navbar />);
    
    const themeButton = screen.getByLabelText(/switch to dark mode/i);
    fireEvent.click(themeButton);
    
    expect(screen.getByLabelText(/switch to light mode/i)).toBeInTheDocument();
  });
}); 