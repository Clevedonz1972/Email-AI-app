import { render, screen, waitFor } from '@/test/utils';
import { StressIndicator } from '@/components/StressLevel/StressIndicator';
import userEvent from '@testing-library/user-event';

describe('Email Stress Analysis', () => {
  it('displays appropriate stress level indicators', async () => {
    render(<StressIndicator level="HIGH" showLabel enableSound />);
    
    // Check visual indicator
    const indicator = screen.getByRole('status');
    expect(indicator).toHaveAttribute('aria-label', 'high stress');
    
    // Check color for accessibility
    const style = window.getComputedStyle(indicator);
    expect(style.backgroundColor).toMatch(/^#ff/); // Should be a red shade
  });

  it('provides clear feedback for screen readers', () => {
    render(<StressIndicator level="HIGH" showLabel />);
    
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('high stress');
  });

  it('handles user interactions appropriately', async () => {
    const user = userEvent.setup();
    const onMuteChange = jest.fn();
    render(<StressIndicator level="HIGH" showLabel enableSound onMuteChange={onMuteChange} />);
    
    // Show detailed info on hover/focus
    const indicator = screen.getByRole('status');
    await user.hover(indicator);
    
    expect(await screen.findByRole('tooltip')).toHaveTextContent('high stress');

    // Test mute functionality
    const muteButton = screen.getByRole('button');
    await user.click(muteButton);
    expect(onMuteChange).toHaveBeenCalledWith(true);
  });

  it('updates stress level when level changes', async () => {
    const { rerender } = render(
      <StressIndicator level="HIGH" showLabel />
    );

    // Initial high stress
    expect(screen.getByRole('status')).toHaveTextContent('high');

    // Update to low stress
    rerender(<StressIndicator level="LOW" showLabel />);

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('low');
    });
  });
}); 