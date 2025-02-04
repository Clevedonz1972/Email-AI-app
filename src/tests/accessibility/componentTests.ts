import { render, screen } from '@testing-library/react';
import { runNeurodivergentChecks } from './neurodivergentChecks';
import { EmailComposer } from '../../components/Email/EmailComposer';
import { AccessibilitySettings } from '../../components/Settings/AccessibilitySettings';

describe('Accessibility Tests', () => {
  describe('EmailComposer', () => {
    it('meets neurodivergent accessibility requirements', async () => {
      await runNeurodivergentChecks(<EmailComposer />, {
        checkColorContrast: true,
        checkFocusOrder: true,
        checkAnimations: true,
        checkTextSpacing: true
      });
    });

    it('provides clear error messages', async () => {
      const { container } = render(<EmailComposer />);
      const errorMessages = container.querySelectorAll('[role="alert"]');
      
      errorMessages.forEach(message => {
        const style = window.getComputedStyle(message);
        expect(style.color).toHaveAdequateColorContrast(style.backgroundColor);
        expect(message).toHaveAppropriateSpacing();
      });
    });
  });

  describe('AccessibilitySettings', () => {
    it('has clear, understandable labels', () => {
      render(<AccessibilitySettings />);
      const labels = screen.getAllByRole('label');
      
      labels.forEach(label => {
        expect(label).toHaveAppropriateSpacing();
        expect(label).toHaveAdequateColorContrast('#FFFFFF');
      });
    });
  });
}); 