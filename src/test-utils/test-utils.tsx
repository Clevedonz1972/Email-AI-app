import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { EmailProvider } from '@/contexts/EmailContext';
import { theme } from '@/theme';
import type { EmailMessage, EmailSender } from '@/types/email';

interface WrapperProps {
  children: React.ReactNode;
}

const AllTheProviders: React.FC<WrapperProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <EmailProvider>
        {children}
      </EmailProvider>
    </ThemeProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options = {}
) => rtlRender(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Create a reusable mock sender
export const mockSender: EmailSender = {
  email: 'test@example.com',
  name: 'Test User'
};

export const mockEmails: EmailMessage[] = [
  {
    id: '1',
    subject: 'Test Email',
    content: 'Test content',
    sender: mockSender,
    preview: 'Test preview',
    timestamp: new Date().toISOString(),
    priority: 'MEDIUM',
    is_read: false,
    category: 'inbox',
    processed: false,
    stress_level: 'LOW'
  }
]; 