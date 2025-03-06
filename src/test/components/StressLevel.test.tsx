import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { AccessibilityProvider } from '../../contexts/AccessibilityContext';
import { StressIndicator } from '../../components/StressLevel/StressIndicator';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AccessibilityProvider>
      <ThemeProvider theme={createTheme()}>
        {component}
      </ThemeProvider>
    </AccessibilityProvider>
  );
};

describe('StressIndicator', () => {
  const mockProps = {
    level: 'HIGH' as const,
    showAlert: true,
    onMute: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays stress level correctly', () => {
    renderWithProviders(<StressIndicator {...mockProps} />);
    
    const indicator = screen.getByRole('status');
    expect(indicator).toHaveAttribute('aria-label', 'High Stress Level');
    expect(indicator).toHaveStyle({ backgroundColor: '#ff0000' }); // Red for high stress
  });

  it('handles muting alerts', () => {
    renderWithProviders(<StressIndicator {...mockProps} />);
    
    const muteButton = screen.getByRole('button', { name: 'Mute Alerts' });
    fireEvent.click(muteButton);
    
    expect(mockProps.onMute).toHaveBeenCalled();
  });

  it('respects accessibility preferences', () => {
    renderWithProviders(
      <StressIndicator
        {...mockProps}
        level="MEDIUM"
      />
    );
    
    const indicator = screen.getByRole('status');
    expect(indicator).toHaveAttribute('aria-live', 'polite');
    expect(indicator).toHaveStyle({ transition: 'all 0.3s ease' }); // Smooth transitions
  });

  it('shows warning icon for high stress', () => {
    renderWithProviders(<StressIndicator level="HIGH" />);
    expect(screen.getByTestId('WarningIcon')).toBeInTheDocument();
  });

  it('applies correct color based on stress level', () => {
    const { container } = renderWithProviders(<StressIndicator level="LOW" />);
    const chip = container.querySelector('.MuiChip-root');
    expect(chip).toHaveStyle({ backgroundColor: expect.stringContaining('success') });
  });

  it('respects high contrast preference', () => {
    const { container } = renderWithProviders(
      <StressIndicator level="MEDIUM" />
    );
    // TODO: Add test after implementing high contrast theme
  });

  it('respects size prop', () => {
    const { container } = renderWithProviders(
      <StressIndicator level="LOW" size="small" />
    );
    const chip = container.querySelector('.MuiChip-root');
    expect(chip).toHaveClass('MuiChip-sizeSmall');
  });

  it('hides label when showLabel is false', () => {
    renderWithProviders(<StressIndicator level="LOW" showLabel={false} />);
    expect(screen.queryByText('Low Stress')).not.toBeInTheDocument();
  });
}); 