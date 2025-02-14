import React from 'react';
import { render, screen } from '@testing-library/react';
import { neurodivergentTestHelpers } from '../helpers/neurodivergentTestHelpers';
import { EmailComposer } from '../../components/Email/EmailComposer';
import { AccessibilitySettings } from '../../components/Settings/AccessibilitySettings';
import { mockSender } from '../../test-utils/test-utils';
import type { EmailComposerProps } from '../../components/Email/EmailComposer';

const defaultProps: EmailComposerProps = {
  initialValues: {
    subject: 'Test',
    content: 'Test content',
    sender: mockSender
  },
  onSend: async () => {}
};

describe('Accessibility Test Suite', () => {
  describe('Email Composer', () => {
    it('supports keyboard-only navigation', async () => {
      const { container } = render(<EmailComposer {...defaultProps} />);
      await neurodivergentTestHelpers.checkKeyboardNavigation(container);
    });

    it('provides clear error recovery steps', async () => {
      render(<EmailComposer {...defaultProps} />);
      
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
      const { container } = render(<EmailComposer {...defaultProps} />);
      await neurodivergentTestHelpers.checkContentClarity(container);
    });
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(
        <EmailComposer
          initialValues={{
            subject: 'Test',
            content: 'Test content',
            sender: mockSender  // Use proper EmailSender object
          }}
          onSend={async () => {}}
        />
      );
      // ... test logic
    });

    // ... other tests with similar fixes
  });
}); 