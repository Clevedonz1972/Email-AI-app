import type { EmailMessage, EmailSender } from '@/types/email';

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
    sender: mockSender,  // Use the proper EmailSender object
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
  // ... render logic
} 