import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PriorityView } from '../../components/Dashboard/PriorityView';
import { useEmailProcessing } from '../../hooks/useEmailProcessing';
import { useSensoryPreferences } from '../../hooks/useSensoryPreferences';

jest.mock('../../hooks/useEmailProcessing');
jest.mock('../../hooks/useSensoryPreferences');

describe('PriorityView', () => {
  const mockEmailStats = {
    high: 3,
    medium: 5,
    low: 10,
    total: 18,
    urgentEmails: [
      { id: '1', subject: 'Urgent Meeting', summary: 'Team meeting at 2 PM' }
    ],
    actionRequired: [
      { id: '1', description: 'Respond to client proposal' }
    ]
  };

  const mockPreferences = {
    highContrast: false,
    reducedMotion: false,
    fontScale: 1,
    readingSpeed: 'medium'
  };

  beforeEach(() => {
    (useEmailProcessing as jest.Mock).mockReturnValue({
      emailStats: mockEmailStats
    });
    (useSensoryPreferences as jest.Mock).mockReturnValue({
      preferences: mockPreferences
    });
  });

  it('displays urgent items correctly', () => {
    render(<PriorityView />);
    expect(screen.getByText('Urgent (3)')).toBeInTheDocument();
    expect(screen.getByText('Urgent Meeting')).toBeInTheDocument();
  });

  it('handles audio feedback toggle', () => {
    render(<PriorityView />);
    const audioSwitch = screen.getByRole('switch', { name: 'Audio Feedback' });
    fireEvent.click(audioSwitch);
    expect(audioSwitch).toBeChecked();
  });

  it('applies high contrast mode when enabled', () => {
    (useSensoryPreferences as jest.Mock).mockReturnValue({
      preferences: { ...mockPreferences, highContrast: true }
    });
    render(<PriorityView />);
    const paper = screen.getByRole('region');
    expect(paper).toHaveStyle({ backgroundColor: '#000' });
  });

  it('handles expand/collapse correctly', () => {
    render(<PriorityView />);
    const expandButton = screen.getByLabelText('Show less');
    fireEvent.click(expandButton);
    expect(screen.queryByText('Urgent Meeting')).not.toBeVisible();
  });
}); 