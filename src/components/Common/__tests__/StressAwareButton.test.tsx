import { render, screen } from '@/test/utils';
import { StressAwareButton } from '../StressAwareButton';
import userEvent from '@testing-library/user-event';

describe('StressAwareButton', () => {
  it('indicates stress level visually and via aria', () => {
    render(
      <StressAwareButton 
        stressLevel="HIGH"
        aria-label="Save email"
      >
        Save
      </StressAwareButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-stress-level', 'HIGH');
    expect(button).toHaveAttribute('aria-label', 'Save email (Stress Level: HIGH)');
  });

  it('shows tooltip on hover/focus', async () => {
    const user = userEvent.setup();
    render(
      <StressAwareButton 
        tooltipText="This action may increase stress"
        stressLevel="HIGH"
      >
        Delete All
      </StressAwareButton>
    );

    const button = screen.getByRole('button');
    await user.hover(button);
    
    expect(await screen.findByRole('tooltip'))
      .toHaveTextContent('This action may increase stress');
  });

  it('has enhanced focus styles for accessibility', () => {
    render(
      <StressAwareButton stressLevel="HIGH">
        Important Action
      </StressAwareButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveStyle({
      transition: 'all 0.3s ease'
    });
  });
}); 