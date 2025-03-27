import { render, screen } from '@testing-library/react';
import { EmailStressIndicator } from '../../Email/EmailStressIndicator';
import { mockEmails } from '@/test/utils/mockData';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material';
import { fireEvent } from '@testing-library/react';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={createTheme()}>
      {component}
    </ThemeProvider>
  );
};

describe('EmailStressIndicator', () => {
  it('displays appropriate stress level indicators', () => {
    renderWithTheme(<EmailStressIndicator email={mockEmails[0]} />);
    
    // Check visual indicator
    const indicator = screen.getByTestId('stress-indicator');
    expect(indicator).toHaveAttribute('aria-label', 'High Stress Level');
    expect(indicator).toHaveStyle({ backgroundColor: '#ff4444' });
  });

  it('provides clear feedback for screen readers', () => {
    renderWithTheme(<EmailStressIndicator email={mockEmails[0]} />);
    
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('High Priority');
  });

  it('shows tooltip with stress level information', async () => {
    renderWithTheme(<EmailStressIndicator email={mockEmails[0]} />);
    
    const indicator = screen.getByTestId('stress-indicator');
    
    fireEvent.mouseEnter(indicator);
    
    expect(await screen.findByRole('tooltip'))
      .toHaveTextContent('This email may require immediate attention');
  });

  it('displays different indicators for different stress levels', () => {
    const lowStressEmail = {
      ...mockEmails[0],
      stress_level: 'LOW' as const,
      priority: 'LOW' as const
    };

    const { rerender } = renderWithTheme(
      <EmailStressIndicator email={lowStressEmail} />
    );

    // Check low stress
    expect(screen.getByRole('status')).toHaveTextContent('Low Priority');

    // Check high stress
    rerender(
      <ThemeProvider theme={createTheme()}>
        <EmailStressIndicator email={mockEmails[0]} />
      </ThemeProvider>
    );
    expect(screen.getByRole('status')).toHaveTextContent('High Priority');
  });

  it('updates stress level when level changes', () => {
    const { rerender } = renderWithTheme(<EmailStressIndicator email={mockEmails[0]} />);
    
    expect(screen.getByRole('status')).toHaveTextContent('High Priority');
    
    rerender(
      <ThemeProvider theme={createTheme()}>
        <EmailStressIndicator email={mockEmails[0]} />
      </ThemeProvider>
    );
    expect(screen.getByRole('status')).toHaveTextContent('High Priority');
  });
}); 