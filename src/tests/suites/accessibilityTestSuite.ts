import { render, screen } from '@testing-library/react';
import { neurodivergentTestHelpers } from '../helpers/neurodivergentTestHelpers';
import { EmailComposer } from '../../components/Email/EmailComposer';
import { AccessibilitySettings } from '../../components/Settings/AccessibilitySettings';

describe('Accessibility Test Suite', () => {
  describe('Email Composer', () => {
    it('supports keyboard-only navigation', async () => {
      const { container } = render(<EmailComposer />);
      await neurodivergentTestHelpers.checkKeyboardNavigation(container);
    });

    it('provides clear error recovery steps', async () => {
      render(<EmailComposer />);
      
      const recoverySteps = [
        'Check the email address is correct',
        'Make sure you have an internet connection',
        'Try sending the email again'
      ];

      await neurodivergentTestHelpers.checkErrorRecovery(
        () => {
          const sendButton = screen.getByRole('button', { name: /send/i });
          sendButton.click();
        },
        recoverySteps
      );
    });

    it('maintains content clarity and readability', async () => {
      const { container } = render(<EmailComposer />);
      await neurodivergentTestHelpers.checkContentClarity(container);
    });
  });
}); 