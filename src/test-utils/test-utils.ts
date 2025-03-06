import React from 'react';
import { render as rtlRender, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { createTheme } from '@mui/material';
import type { EmailMessage, EmailSender } from '@/types/email';

// Create a reusable mock sender
export const mockSender: EmailSender = {
  email: 'test@example.com',
  name: 'Test User'
};

export const mockEmails: EmailMessage[] = [
  {
    id: 1,
    subject: "Welcome!",
    content: "Thank you for signing up.",
    preview: "Thank you for signing up.",
    sender: {
      email: "no-reply@example.com",
      name: "Example App"
    },
    timestamp: "2024-02-21T12:00:00Z",
    priority: "LOW",
    stress_level: "LOW",
    is_read: false,
    category: "inbox",
    processed: false,
    sentiment_score: 0.5
  }
  // Add more mock emails as needed
];

const defaultTheme = createTheme();

function Providers({ children }: { children: React.ReactNode }) {
  return React.createElement(
    ThemeProvider,
    { theme: defaultTheme },
    React.createElement(AccessibilityProvider, null, children)
  );
}

function render(ui: React.ReactElement, options = {}) {
  return rtlRender(ui, { wrapper: Providers, ...options });
}

// Re-export everything
export { render, screen, fireEvent, waitFor }; 