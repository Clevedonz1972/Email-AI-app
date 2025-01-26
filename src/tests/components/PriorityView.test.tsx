import React from 'react';
import { render, screen } from '@testing-library/react';
import { PriorityView } from '../../components/Dashboard/PriorityView';
import { useEmailProcessing } from '../../hooks/useEmailProcessing';

jest.mock('../../hooks/useEmailProcessing');

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

  beforeEach(() => {
    (useEmailProcessing as jest.Mock).mockReturnValue({
      emailStats: mockEmailStats
    });
  });

  it('displays urgent items correctly', () => {
    render(<PriorityView />);
    expect(screen.getByText('Urgent (3)')).toBeInTheDocument();
    expect(screen.getByText('Urgent Meeting')).toBeInTheDocument();
  });

  it('shows priority distribution', () => {
    render(<PriorityView />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '16.67'); // (3/18) * 100
  });
}); 