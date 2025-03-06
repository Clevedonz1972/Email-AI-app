import { render, screen, waitFor } from '@/test/utils';
import { StressDashboard } from '../StressDashboard';
import { mockEmails } from '@/test/utils/mockData';
import userEvent from '@testing-library/user-event';
import type { EmailMessage } from '@/types/email';

describe('Stress Dashboard', () => {
  it('displays overall stress level clearly', () => {
    render(<StressDashboard emails={mockEmails} />);
    
    // Check main stress indicator
    const mainIndicator = screen.getByRole('meter', { name: 'Stress Level' });
    expect(mainIndicator).toBeVisible();
    expect(mainIndicator).toHaveAttribute('aria-label', 'Current Stress Level');
  });

  it('provides clear visual patterns for stress trends', async () => {
    render(<StressDashboard emails={mockEmails} />);
    
    // Check trend visualization
    const trendGraph = screen.getByRole('img', { name: 'Stress Trend' });
    expect(trendGraph).toHaveAttribute('aria-describedby');
    
    // Ensure pattern is visible for color blind users
    const patterns = screen.getAllByRole('graphics-symbol');
    patterns.forEach(pattern => {
      expect(pattern).toHaveAttribute('aria-hidden', 'true');
      // Should use patterns/shapes, not just colors
      expect(pattern).toHaveAttribute('data-shape');
    });
  });

  it('handles focus management for neurodivergent users', async () => {
    const user = userEvent.setup();
    render(<StressDashboard emails={mockEmails} />);

    // Test keyboard navigation
    await user.tab();
    expect(screen.getByText('Daily Summary')).toHaveFocus();
    
    await user.tab();
    expect(screen.getByText('Stress Breakdown')).toHaveFocus();
    
    // Ensure no focus traps
    const allFocusable = screen.getAllByRole('button');
    expect(allFocusable.length).toBeGreaterThan(0);
  });

  it('provides clear breakdowns of stress sources', () => {
    render(<StressDashboard emails={mockEmails} />);
    
    // Check stress source categories
    const categories = screen.getAllByRole('listitem');
    categories.forEach(category => {
      // Each category should have clear labeling
      expect(category).toHaveAttribute('aria-label');
      // Should show both visual and numeric indicators
      expect(category).toHaveTextContent(/\d+/);
      expect(category).toHaveAttribute('data-stress-level');
    });
  });

  it('allows customization of stress thresholds', async () => {
    const user = userEvent.setup();
    render(<StressDashboard emails={mockEmails} />);
    
    // Open settings
    await user.click(screen.getByRole('button', { name: 'Customize' }));
    
    // Check threshold controls
    const thresholdControls = screen.getAllByRole('slider');
    expect(thresholdControls).toHaveLength(2); // Low-Medium and Medium-High thresholds
    
    // Adjust threshold
    await user.click(screen.getByLabelText('High Stress Threshold'));
    await user.keyboard('[ArrowRight]');
    
    // Should update immediately
    expect(screen.getByText('Threshold Updated')).toBeInTheDocument();
  });

  it('provides calming transitions between states', async () => {
    const { rerender } = render(<StressDashboard emails={mockEmails} />);
    
    // Get initial state
    const dashboard = screen.getByTestId('stress-dashboard');
    
    // Update with new data
    const updatedEmails: EmailMessage[] = [...mockEmails, {
      ...mockEmails[0],
      id: 3,
      stress_level: 'HIGH',
      priority: 'HIGH',
      category: 'inbox',
      processed: true,
      sentiment_score: 0.2
    }];
    
    rerender(<StressDashboard emails={updatedEmails} />);
    
    // Should have smooth transition class
    expect(dashboard).toHaveClass('transition-all');
    expect(dashboard).toHaveStyle({ transition: expect.stringContaining('ms') });
  });
}); 