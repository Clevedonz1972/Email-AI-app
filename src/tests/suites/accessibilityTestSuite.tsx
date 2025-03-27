import React from 'react';
import { render, screen } from '@testing-library/react';
import { runNeurodivergentChecks, neurodivergentHelpers } from '../a11y/neurodivergentChecks';
import { EmailComposer } from '@/components/Email/EmailComposer';
import { AccessibilitySettings } from '@/components/Settings/AccessibilitySettings';
import { mockSender } from '@/test-utils/test-utils';
import type { EmailComposerProps } from '@/components/Email/EmailComposer';
import type { EmailSender } from '@/types/email';

const defaultProps: EmailComposerProps = {
  initialValues: {
    subject: 'Test',
    content: 'Test content',
    sender: mockSender
  },
  onSend: async () => {}
};

describe('Accessibility Test Suite', () => {
  const mockEmailSender: EmailSender = {
    name: 'Test Sender',
    email: 'test@example.com'
  };

  describe('Email Composer', () => {
    it('supports keyboard-only navigation', async () => {
      const { container } = render(<EmailComposer {...defaultProps} />);
      await neurodivergentHelpers.checkKeyboardNavigation(container);
    });

    it('provides clear error recovery steps', async () => {
      render(<EmailComposer {...defaultProps} />);
      
      const recoverySteps = [
        'Check the email address is correct',
        'Make sure you have an internet connection',
        'Try sending the email again'
      ];

      await neurodivergentHelpers.checkErrorRecovery(
        () => {
          const sendButton = screen.getByRole('button', { name: 'Send' });
          sendButton.click();
        },
        recoverySteps
      );
    });

    it('maintains content clarity and readability', async () => {
      const { container } = render(<EmailComposer {...defaultProps} />);
      await neurodivergentHelpers.checkContentClarity(container);
    });

    it('should render with accessibility features', () => {
      render(<EmailComposer {...defaultProps} />);
      // Test accessibility features
      expect(screen.getByRole('textbox', { name: /subject/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /content/i })).toBeInTheDocument();
    });
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<EmailComposer {...defaultProps} />);
      // Basic rendering checks
      expect(screen.getByRole('form')).toBeInTheDocument();
    });
  });
}); 