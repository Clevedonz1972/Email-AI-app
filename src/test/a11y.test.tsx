import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Login } from '../components/Auth/Login';
import { Dashboard } from '../components/Dashboard/Dashboard';
import { EmailReply } from '../components/EmailReply/EmailReply';

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
    const { container } = render(
      <EmailReply
        open={true}
        onClose={() => {}}
        originalEmail={{
          subject: 'Test',
          content: 'Test content',
          sender: 'test@example.com'
        }}
        onSend={async () => {}}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 