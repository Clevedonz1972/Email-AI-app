import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { AccessibilityProvider } from '../../contexts/AccessibilityContext';
import { SimplifiedView } from '../../components/Email/SimplifiedView';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AccessibilityProvider>
      <ThemeProvider theme={createTheme()}>
        {component}
      </ThemeProvider>
    </AccessibilityProvider>
  );
};

describe('SimplifiedView', () => {
  const mockProps = {
    emailContent: 'Test email content',
    subject: 'Test Subject',
    sender: 'test@example.com',
    timestamp: '2024-01-01T12:00:00Z',
    stressLevel: 'MEDIUM' as const,
    onToggleView: jest.fn(),
    isSimplified: true,
  };

  it('renders email content and metadata correctly', () => {
    renderWithProviders(<SimplifiedView {...mockProps} />);
    
    expect(screen.getByText('Test Subject')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Test email content')).toBeInTheDocument();
    expect(screen.getByText('Stress Level: MEDIUM')).toBeInTheDocument();
  });

  it('toggles focus mode correctly', () => {
    renderWithProviders(<SimplifiedView {...mockProps} />);
    
    const focusModeSwitch = screen.getByRole('switch', { name: 'Focus Mode' });
    fireEvent.click(focusModeSwitch);
    
    expect(focusModeSwitch).toBeChecked();
  });

  it('handles view toggle correctly', () => {
    renderWithProviders(<SimplifiedView {...mockProps} />);
    
    const toggleButton = screen.getByRole('button', { name: 'Show Full View' });
    fireEvent.click(toggleButton);
    
    expect(mockProps.onToggleView).toHaveBeenCalled();
  });

  it('adjusts text size when clicking the text size button', () => {
    renderWithProviders(<SimplifiedView {...mockProps} />);
    
    const textSizeButton = screen.getByRole('button', { name: 'Adjust Text Size' });
    fireEvent.click(textSizeButton);
    
    const content = screen.getByText('Test email content');
    expect(content).toHaveStyle({ fontSize: expect.stringContaining('%') });
  });

  it('toggles high contrast mode', () => {
    renderWithProviders(<SimplifiedView {...mockProps} />);
    
    const contrastButton = screen.getByRole('button', { name: 'Toggle High Contrast' });
    fireEvent.click(contrastButton);
    
    const container = screen.getByText('Test email content').closest('div');
    expect(container).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it('hides metadata when simplified view is enabled', () => {
    renderWithProviders(
      <SimplifiedView
        {...mockProps}
        isSimplified={true}
      />
    );
    
    const toggleButton = screen.getByRole('button', { name: 'Show Full View' });
    expect(toggleButton).toBeInTheDocument();
  });

  it('handles different stress levels with appropriate colors', () => {
    const { rerender } = renderWithProviders(
      <SimplifiedView {...mockProps} stressLevel="HIGH" />
    );
    
    expect(screen.getByText('Stress Level: HIGH')).toBeInTheDocument();
    
    rerender(
      <AccessibilityProvider>
        <ThemeProvider theme={createTheme()}>
          <SimplifiedView {...mockProps} stressLevel="LOW" />
        </ThemeProvider>
      </AccessibilityProvider>
    );
    
    expect(screen.getByText('Stress Level: LOW')).toBeInTheDocument();
  });

  it('respects reduced motion preference', () => {
    renderWithProviders(<SimplifiedView {...mockProps} />);
    
    const container = screen.getByText('Test email content').closest('div');
    expect(container).toHaveStyle({ transition: expect.any(String) });
  });

  it('displays all relevant buttons and controls', () => {
    renderWithProviders(<SimplifiedView {...mockProps} />);
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Stress Level: MEDIUM')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Focus Mode' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show Full View' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Adjust Text Size' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Toggle High Contrast' })).toBeInTheDocument();
  });
}); 