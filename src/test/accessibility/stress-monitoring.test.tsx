import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { StressDashboard } from '@/components/Dashboard/StressDashboard';
import { EmailStressIndicator } from '@/components/Email/EmailStressIndicator';
import { mockEmails } from '@/test/utils/mockData';
import { runNeurodivergentChecks } from '../a11y/neurodivergentChecks';
import type { EmailMessage } from '@/types/email';

expect.extend(toHaveNoViolations);

describe('Stress Monitoring Accessibility', () => {
  describe('StressDashboard', () => {
    it('meets WCAG accessibility standards', async () => {
      const { container } = render(<StressDashboard emails={mockEmails} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides clear visual stress indicators', () => {
      render(<StressDashboard emails={mockEmails} />);
      
      const indicators = screen.getAllByTestId('stress-indicator');
      indicators.forEach(indicator => {
        // Check for proper ARIA labels
        expect(indicator).toHaveAttribute('aria-label');
        // Check for proper role
        expect(indicator).toHaveAttribute('role', 'status');
      });
    });

    it('supports keyboard navigation for stress management features', async () => {
      await runNeurodivergentChecks(
        <StressDashboard emails={mockEmails} />,
        { checkFocusOrder: true }
      );
    });

    it('maintains color contrast for stress indicators', async () => {
      await runNeurodivergentChecks(
        <StressDashboard emails={mockEmails} />,
        { checkColorContrast: true }
      );
    });
  });

  describe('EmailStressIndicator', () => {
    const mockEmail: EmailMessage = mockEmails[0];

    it('provides appropriate ARIA labels for stress levels', () => {
      render(<EmailStressIndicator email={mockEmail} />);
      
      const indicator = screen.getByRole('status');
      expect(indicator).toHaveAttribute(
        'aria-label',
        expect.stringContaining(mockEmail.stress_level.toLowerCase())
      );
    });

    it('handles focus states appropriately', async () => {
      const { container } = render(<EmailStressIndicator email={mockEmail} />);
      
      const indicator = screen.getByTestId('stress-indicator');
      indicator.focus();
      
      expect(document.activeElement).toBe(indicator);
      expect(indicator).toHaveAttribute('tabindex', '0');
    });

    it('provides clear tooltips for additional context', async () => {
      render(<EmailStressIndicator email={mockEmail} />);
      
      const indicator = screen.getByTestId('stress-indicator');
      fireEvent.mouseEnter(indicator);
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('supports screen reader announcements for stress changes', async () => {
      const { rerender } = render(<EmailStressIndicator email={mockEmail} />);
      
      // Update stress level
      const updatedEmail = {
        ...mockEmail,
        stress_level: 'LOW' as const
      };
      
      rerender(<EmailStressIndicator email={updatedEmail} />);
      
      const announcement = screen.getByRole('status');
      expect(announcement).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Stress Management Features', () => {
    it('provides accessible controls for stress management', async () => {
      render(<StressDashboard emails={mockEmails} />);
      
      const controls = screen.getAllByRole('button');
      controls.forEach(control => {
        expect(control).toHaveAttribute('aria-label');
        expect(control).not.toHaveAttribute('aria-hidden');
      });
    });

    it('maintains functionality with assistive technologies', async () => {
      render(<StressDashboard emails={mockEmails} />);
      
      const interactiveElements = screen.getAllByRole('button');
      interactiveElements.forEach(element => {
        element.focus();
        fireEvent.keyDown(element, { key: 'Enter' });
        // Ensure the element responds to keyboard interaction
        expect(element).toHaveAttribute('aria-pressed');
      });
    });

    it('provides clear feedback for stress level changes', async () => {
      render(<StressDashboard emails={mockEmails} />);
      
      const stressControls = screen.getAllByRole('radio', { name: /stress level/i });
      fireEvent.click(stressControls[0]);
      
      await waitFor(() => {
        const feedback = screen.getByRole('alert');
        expect(feedback).toBeInTheDocument();
        expect(feedback).toHaveAttribute('aria-live', 'assertive');
      });
    });
  });
}); 