import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { EmailProvider } from '@/contexts/EmailContext';
import { theme } from '@/theme';
import type { EmailMessage } from '@/types/email';

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <EmailProvider>
        {children}
      </EmailProvider>
    </ThemeProvider>
  );
};

const render = (ui: React.ReactElement, options = {}) =>
  rtlRender(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { render };

export const mockEmails: readonly EmailMessage[] = [
  {
    id: '1',
    sender: {
      name: 'John Doe',
      email: 'john@example.com'
    },
    subject: 'Important Meeting',
    content: 'Meeting details...',
    preview: 'Meeting details...',
    timestamp: new Date().toISOString(),
    priority: 'HIGH',
    is_read: false,
    category: 'inbox',
    processed: true,
    stress_level: 'HIGH',
    summary: 'Urgent meeting discussion'
  }
]; 