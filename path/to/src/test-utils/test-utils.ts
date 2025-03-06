import type { EmailMessage, EmailSender } from '@/types/email';

// Create a reusable mock sender
export const mockSender: EmailSender = {
  email: 'test@example.com',
  name: 'Test User'
};

// Example mock emails
export const mockEmails: EmailMessage[] = [
  {
    id: '1',
    sender: { name: 'Test User', email: 'test@example.com' },
    subject: 'Test Email',
    content: 'Test content',
    preview: 'Test preview',
    timestamp: new Date().toISOString(),
    priority: 'MEDIUM',
    is_read: false,
    category: 'inbox',
    processed: false,
    stress_level: 'LOW'
  }
  // Add more mock emails as needed
];

// Custom render function with providers if needed
export function render(ui: React.ReactElement, options = {}) {
  // Implement render logic here, possibly wrapping with Providers
  // Example:
  // return rtlRender(ui, { wrapper: TestWrapper, ...options });
} 