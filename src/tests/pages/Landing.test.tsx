import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Landing } from '../../pages/Landing';
import { AccessibilityProvider } from '../../contexts/AccessibilityContext';
import { AuthProvider } from '../../contexts/AuthContext';
import { createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

// Test wrapper with all required providers
const renderWithProviders = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(
    <BrowserRouter>
      <AuthProvider>
        <AccessibilityProvider>
          <ThemeProvider theme={theme}>
            {ui}
          </ThemeProvider>
        </AccessibilityProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Landing Page', () => {
  it('should render the Neurodiversity logo', () => {
    renderWithProviders(<Landing />);
    const logo = screen.getByAltText('Neurodiversity Ltd');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/assets/Neurodivarsity ltd logo.png');
  });

  it('should display the main heading', () => {
    renderWithProviders(<Landing />);
    const heading = screen.getByRole('heading', { name: /welcome to asti/i, level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('should display the new subheading', () => {
    renderWithProviders(<Landing />);
    const subheading = screen.getByText(/meet your brain's new best friend/i);
    expect(subheading).toBeInTheDocument();
  });

  it('should render login and register buttons for unauthenticated users', () => {
    // Mock the AuthContext to simulate an unauthenticated user
    jest.spyOn(require('../../contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      isAuthenticated: false,
    }));

    renderWithProviders(<Landing />);
    
    const loginButton = screen.getByRole('button', { name: /log in/i });
    const registerButton = screen.getByRole('button', { name: /register/i });
    
    expect(loginButton).toBeInTheDocument();
    expect(registerButton).toBeInTheDocument();
  });

  it('should render dashboard button for authenticated users', () => {
    // Mock the AuthContext to simulate an authenticated user
    jest.spyOn(require('../../contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      isAuthenticated: true,
    }));

    renderWithProviders(<Landing />);
    
    const dashboardButton = screen.getByRole('button', { name: /go to dashboard/i });
    expect(dashboardButton).toBeInTheDocument();
  });

  it('should not have any accessibility violations', async () => {
    const { container } = renderWithProviders(<Landing />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should include a footer with attribution', () => {
    renderWithProviders(<Landing />);
    const footer = screen.getByText(/powered by neurodiversity ltd/i);
    expect(footer).toBeInTheDocument();
  });

  it('should have proper ARIA labels on interactive elements', () => {
    // Mock unauthenticated user
    jest.spyOn(require('../../contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      isAuthenticated: false,
    }));

    renderWithProviders(<Landing />);
    
    const loginButton = screen.getByLabelText('Log in to your account');
    const registerButton = screen.getByLabelText('Create a new account');
    
    expect(loginButton).toBeInTheDocument();
    expect(registerButton).toBeInTheDocument();
  });
}); 