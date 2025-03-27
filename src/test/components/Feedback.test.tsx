import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { AccessibilityProvider } from '../../contexts/AccessibilityContext';
import { QuickFeedback } from '../../components/Feedback/QuickFeedback';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AccessibilityProvider>
      <ThemeProvider theme={createTheme()}>
        {component}
      </ThemeProvider>
    </AccessibilityProvider>
  );
};

describe('QuickFeedback', () => {
  const mockOnFeedbackSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders feedback buttons correctly', () => {
    renderWithProviders(
      <QuickFeedback
        feedbackType="suggestion"
        onFeedbackSubmit={mockOnFeedbackSubmit}
      />
    );

    expect(screen.getByRole('button', { name: 'Helpful' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Not Helpful' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Report Issue' })).toBeInTheDocument();
  });

  it('handles quick feedback submission', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Feedback submitted' })
    });

    renderWithProviders(
      <QuickFeedback
        feedbackType="suggestion"
        onFeedbackSubmit={mockOnFeedbackSubmit}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Helpful' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/feedback/quick',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            type: 'suggestion',
            isPositive: true,
            timestamp: expect.any(String)
          })
        })
      );
    });
  });

  it('opens detailed feedback form', () => {
    renderWithProviders(
      <QuickFeedback
        feedbackType="accessibility"
        onFeedbackSubmit={mockOnFeedbackSubmit}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Report Issue' }));
    expect(screen.getByText('Provide Detailed Feedback')).toBeInTheDocument();
  });

  it('handles detailed feedback submission', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Feedback submitted' })
    });

    renderWithProviders(
      <QuickFeedback
        feedbackType="stress_level"
        onFeedbackSubmit={mockOnFeedbackSubmit}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Report Issue' }));
    
    fireEvent.change(screen.getByPlaceholderText('Describe the issue'), {
      target: { value: 'Test issue description' }
    });

    // Submit the detailed feedback
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/feedback/detailed',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            type: 'stress_level',
            feedback: 'Test issue description',
            timestamp: expect.any(String)
          })
        })
      );
    });

    expect(mockOnFeedbackSubmit).toHaveBeenCalled();
  });

  it('handles feedback submission errors', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(
      <QuickFeedback
        feedbackType="suggestion"
        onFeedbackSubmit={mockOnFeedbackSubmit}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Helpful' }));

    await waitFor(() => {
      expect(screen.getByText('Failed to submit feedback. Please try again.')).toBeInTheDocument();
    });

    expect(mockOnFeedbackSubmit).not.toHaveBeenCalled();
  });

  it('respects font size preference', () => {
    const { container } = renderWithProviders(
      <QuickFeedback feedbackType="suggestion" />
    );
    
    const buttons = container.querySelectorAll('.MuiIconButton-root');
    buttons.forEach(button => {
      expect(button).toHaveStyle({ fontSize: expect.any(String) });
    });
  });
}); 