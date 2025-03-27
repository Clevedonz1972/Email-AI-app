import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { AccessibilityProvider } from '../../contexts/AccessibilityContext';
import { OnboardingTutorial } from '../../components/Onboarding/OnboardingTutorial';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AccessibilityProvider>
      <ThemeProvider theme={createTheme()}>
        {component}
      </ThemeProvider>
    </AccessibilityProvider>
  );
};

describe('OnboardingTutorial', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    mockOnComplete.mockClear();
  });

  it('renders welcome screen initially', () => {
    renderWithProviders(
      <OnboardingTutorial open={true} onComplete={mockOnComplete} />
    );
    expect(screen.getByText('Welcome to Your Email Assistant')).toBeInTheDocument();
  });

  it('navigates through steps correctly', () => {
    renderWithProviders(
      <OnboardingTutorial open={true} onComplete={mockOnComplete} />
    );

    // Start at welcome screen
    expect(screen.getByText('Welcome to Your Email Assistant')).toBeInTheDocument();

    // Go to accessibility settings
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Accessibility Settings')).toBeInTheDocument();

    // Go to stress management
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Stress Management')).toBeInTheDocument();

    // Go to final screen
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Ready to Start')).toBeInTheDocument();
  });

  it('saves preferences on completion', () => {
    renderWithProviders(
      <OnboardingTutorial open={true} onComplete={mockOnComplete} />
    );

    // Navigate to accessibility settings
    fireEvent.click(screen.getByText('Next'));

    // Toggle some preferences
    fireEvent.click(screen.getByLabelText('High Contrast Mode'));
    fireEvent.click(screen.getByLabelText('Reduce Motion'));

    // Complete the tutorial
    fireEvent.click(screen.getByText('Next')); // To stress management
    fireEvent.click(screen.getByText('Next')); // To final screen
    fireEvent.click(screen.getByText('Finish'));

    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('allows navigation back to previous steps', () => {
    renderWithProviders(
      <OnboardingTutorial open={true} onComplete={mockOnComplete} />
    );

    // Go forward two steps
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Stress Management')).toBeInTheDocument();

    // Go back one step
    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByText('Accessibility Settings')).toBeInTheDocument();
  });

  it('updates stress management preferences', () => {
    renderWithProviders(
      <OnboardingTutorial open={true} onComplete={mockOnComplete} />
    );

    // Navigate to stress management
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));

    // Toggle preferences
    fireEvent.click(screen.getByLabelText('Show Stress Level Indicators'));
    fireEvent.click(screen.getByLabelText('Break Reminders'));
    fireEvent.click(screen.getByLabelText('Enable Quiet Hours'));

    // Complete the tutorial
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Finish'));

    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('maintains state between steps', () => {
    renderWithProviders(
      <OnboardingTutorial open={true} onComplete={mockOnComplete} />
    );

    // Set preferences in accessibility step
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByLabelText('High Contrast Mode'));

    // Go to next step and back
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Back'));

    // Check if preference is still selected
    expect(screen.getByLabelText('High Contrast Mode')).toBeChecked();
  });
}); 