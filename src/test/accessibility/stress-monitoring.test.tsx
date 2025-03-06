import { render, screen } from '@/test/utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import { StressDashboard } from '@/components/StressLevel/StressDashboard';
import { mockEmails } from '@/test/utils/mockData';
import { EmailContext } from '@/contexts/EmailContext';
import type { EmailStats } from '@/types/email';
import { neurodivergentHelpers } from '@/tests/a11y/neurodivergentChecks';

expect.extend(toHaveNoViolations);

const mockEmailStats: EmailStats = {
  total: mockEmails.length,
  unread: mockEmails.filter(e => !e.is_read).length,
  priority: 'LOW',
  categories: {
    inbox: mockEmails.length,
    sent: 0,
    draft: 0,
    trash: 0
  },
  high: mockEmails.filter(e => e.stress_level === 'HIGH').length,
  medium: mockEmails.filter(e => e.stress_level === 'MEDIUM').length,
  low: mockEmails.filter(e => e.stress_level === 'LOW').length,
  urgentEmails: [],
  actionRequired: []
};

const mockEmailContext = {
  emails: mockEmails,
  loading: false,
  error: null,
  emailStats: mockEmailStats,
  processing: false,
  progress: 0,
  processEmails: jest.fn().mockResolvedValue(mockEmails),
  fetchEmails: jest.fn(),
  markAsRead: jest.fn(),
  flagEmail: jest.fn(),
  deleteEmail: jest.fn(),
  replyToEmail: jest.fn(),
  updateEmailCategory: jest.fn(),
  updateEmailPriority: jest.fn(),
};

describe('Stress Monitoring Accessibility', () => {
  it('meets WCAG AAA standards', async () => {
    const { container } = render(
      <EmailContext.Provider value={mockEmailContext}>
        <StressDashboard emails={mockEmails} />
      </EmailContext.Provider>
    );
    const results = await axe(container, {
      rules: {
        'color-contrast': { level: 'AAA' },
        'motion-animation': { enabled: true },
        'text-spacing': { enabled: true },
        'focus-order-semantics': { enabled: true }
      }
    });
    expect(results).toHaveNoViolations();
  });

  it('provides clear and customizable audio feedback', () => {
    render(
      <EmailContext.Provider value={mockEmailContext}>
        <StressDashboard emails={mockEmails} />
      </EmailContext.Provider>
    );
    
    const alerts = screen.getAllByRole('alert');
    alerts.forEach(alert => {
      expect(alert).toHaveAttribute('aria-live', 'polite');
      expect(alert).not.toHaveAttribute('aria-atomic', 'true');
      
      const volumeControl = screen.getByRole('slider', { name: 'Audio Volume' });
      expect(volumeControl).toBeInTheDocument();
      
      const speedControl = screen.getByRole('slider', { name: 'Audio Speed' });
      expect(speedControl).toBeInTheDocument();
    });
  });

  it('supports comprehensive motion control', () => {
    render(<StressDashboard emails={mockEmails} />);
    
    const animatedElements = screen.getAllByTestId('animate');
    animatedElements.forEach(element => {
      expect(element).toHaveAttribute('data-reduced-motion');
      expect(element).toHaveStyle({
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none'
        }
      });
      
      const motionControls = screen.getAllByRole('slider', { name: 'Animation Speed' });
      expect(motionControls.length).toBeGreaterThan(0);
      motionControls.forEach(control => {
        expect(control).toHaveAttribute('aria-label');
        expect(control).toHaveAttribute('min', '0');
        expect(control).toHaveAttribute('max', '100');
      });
    });
  });

  it('maintains readability with dynamic text customization', () => {
    render(<StressDashboard emails={mockEmails} />);
    
    const textElements = screen.getAllByRole('text');
    textElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      expect(styles.fontSize).toMatch('^\\d+(?:rem|em)$');
      expect(parseFloat(styles.lineHeight)).toBeGreaterThanOrEqual(1.5);
      
      expect(screen.getByRole('slider', { name: 'Letter Spacing' })).toBeInTheDocument();
      expect(screen.getByRole('slider', { name: 'Word Spacing' })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: 'Font Family' })).toBeInTheDocument();
    });
  });

  it('provides clear and customizable stress indicators', async () => {
    render(
      <EmailContext.Provider value={mockEmailContext}>
        <StressDashboard emails={mockEmails} />
      </EmailContext.Provider>
    );
    
    const stressIndicators = screen.getAllByTestId('stress-indicator');
    stressIndicators.forEach(indicator => {
      expect(indicator).toHaveAttribute('aria-label');
      expect(indicator).toHaveStyle({ padding: expect.any(String) });
      
      const pattern = indicator.querySelector('[data-testid="pattern"]');
      expect(pattern).toBeInTheDocument();
      
      const thresholdControls = screen.getAllByRole('slider', { name: 'Stress Threshold' });
      expect(thresholdControls.length).toBe(2);
    });
  });

  it('supports keyboard navigation and focus management', async () => {
    const { container } = render(
      <EmailContext.Provider value={mockEmailContext}>
        <StressDashboard emails={mockEmails} />
      </EmailContext.Provider>
    );

    await neurodivergentHelpers.checkKeyboardNavigation(container);
    
    const focusableElements = screen.getAllByRole('button');
    focusableElements.forEach(element => {
      expect(element).toHaveStyle({
        outline: expect.stringContaining('px'),
        outlineOffset: expect.stringContaining('px')
      });
    });
  });

  it('provides clear error recovery steps', async () => {
    render(
      <EmailContext.Provider value={mockEmailContext}>
        <StressDashboard emails={mockEmails} />
      </EmailContext.Provider>
    );

    const recoverySteps = [
      'Check your internet connection',
      'Refresh the dashboard',
      'Contact support if the issue persists'
    ];

    await neurodivergentHelpers.checkErrorRecovery(
      () => {
        mockEmailContext.fetchEmails.mockRejectedValueOnce(new Error('Network error'));
      },
      recoverySteps
    );
  });
}); 