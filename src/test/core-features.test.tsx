import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { StressDashboard } from '@/components/StressLevel/StressDashboard';
import { mockEmails } from '@/test/utils/mockData';
import { EmailContext } from '@/contexts/EmailContext';
import type { EmailStats } from '@/types/email';

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

describe('Core Features', () => {
  describe('Stress Management', () => {
    it('clearly indicates email stress levels', async () => {
      render(
        <EmailContext.Provider value={mockEmailContext}>
          <StressDashboard emails={mockEmails} />
        </EmailContext.Provider>
      );
      
      // Check stress indicators are visible and clear
      const stressIndicators = screen.getAllByRole('status');
      expect(stressIndicators.length).toBeGreaterThan(0);
      
      // Verify accessibility
      stressIndicators.forEach(indicator => {
        expect(indicator).toHaveAttribute('aria-label');
        expect(indicator).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('allows stress threshold customization', async () => {
      const user = userEvent.setup();
      render(
        <EmailContext.Provider value={mockEmailContext}>
          <StressDashboard emails={mockEmails} />
        </EmailContext.Provider>
      );
      
      // Open settings
      await user.click(screen.getByRole('button', { name: 'settings' }));
      
      // Adjust thresholds
      const thresholdSlider = screen.getByRole('slider', { name: 'stress threshold' });
      await user.click(thresholdSlider);
      
      // Verify changes are saved
      expect(screen.getByText('settings saved')).toBeInTheDocument();
    });
  });

  describe('Email Processing', () => {
    it('processes and categorizes emails effectively', async () => {
      render(
        <EmailContext.Provider value={mockEmailContext}>
          <StressDashboard emails={mockEmails} />
        </EmailContext.Provider>
      );
      
      // Check categorization
      expect(screen.getByText('high priority')).toBeInTheDocument();
      expect(screen.getByText('low stress')).toBeInTheDocument();
    });
  });

  describe('Accessibility Features', () => {
    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(
        <EmailContext.Provider value={mockEmailContext}>
          <StressDashboard emails={mockEmails} />
        </EmailContext.Provider>
      );
      
      // Test tab navigation
      await user.tab();
      expect(screen.getByRole('button', { name: 'settings' })).toHaveFocus();
    });

    it('respects user preferences', async () => {
      render(
        <EmailContext.Provider value={mockEmailContext}>
          <StressDashboard emails={mockEmails} />
        </EmailContext.Provider>
      );
      
      const stressIndicators = screen.getAllByTestId('animate');
      stressIndicators.forEach(indicator => {
        expect(indicator).toHaveAttribute('data-reduced-motion');
      });
    });
  });
}); 