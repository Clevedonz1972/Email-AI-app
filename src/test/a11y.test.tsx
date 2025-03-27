import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Login } from '../components/Auth/Login';
import { Dashboard } from '../components/Dashboard/Dashboard';
import { EmailReply } from '../components/EmailReply/EmailReply';
import type { EmailMessage } from '../types/email';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('Login page should have no accessibility violations', async () => {
    const { container } = render(<Login />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Dashboard should have no accessibility violations', async () => {
    const { container } = render(<Dashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Email reply dialog should have no accessibility violations', async () => {
    const mockEmail: EmailMessage = {
      id: 1,
      subject: 'Test',
      content: 'Test content',
      sender: {
        email: 'test@example.com',
        name: 'Test User'
      },
      preview: 'Test preview',
      timestamp: new Date().toISOString(),
      priority: 'MEDIUM',
      is_read: false,
      category: 'inbox',
      processed: false,
      stress_level: 'LOW',
      sentiment_score: 0.5
    };

    const { container } = render(
      <EmailReply
        open={true}
        onClose={() => {}}
        originalEmail={mockEmail}
        onSend={async () => {}}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 