import { screen, fireEvent } from '@testing-library/react';
import { render } from '@/test-utils/test-utils';
import { EmailList } from '../EmailList';
import { mockEmails } from '@/test-utils/test-utils';
import type { EmailMessage, EmailSender } from '@/types/email';

describe('EmailList', () => {
  const mockSender: EmailSender = {
    email: 'test@example.com',
    name: 'Test User'
  };

  const mockEmails: EmailMessage[] = [
    {
      id: '1',
      subject: 'Test',
      content: 'Test content',
      sender: mockSender,  // Using proper EmailSender type
      preview: 'Test preview',
      timestamp: '2024-02-20T12:00:00Z',
      priority: 'HIGH',
      is_read: false,
      category: 'inbox',
      processed: true,
      stress_level: 'HIGH'
    }
  ];

  it('renders loading state correctly', () => {
    render(<EmailList emails={[]} isLoading={true} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders empty state correctly', () => {
    render(<EmailList emails={[]} />);
    expect(screen.getByText(/no emails to display/i)).toBeInTheDocument();
  });

  it('renders emails correctly', () => {
    render(<EmailList emails={mockEmails} />);
    
    mockEmails.forEach(email => {
      expect(screen.getByText(email.subject)).toBeInTheDocument();
      expect(screen.getByText(email.preview)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(email.sender.name))).toBeInTheDocument();
    });
  });

  it('handles email actions correctly', () => {
    const onMarkRead = jest.fn();
    const onFlag = jest.fn();

    render(
      <EmailList 
        emails={mockEmails}
        onMarkRead={onMarkRead}
        onFlag={onFlag}
      />
    );

    const firstEmail = mockEmails[0];
    const markReadButton = screen.getAllByLabelText(/mark as read/i)[0];
    const flagButton = screen.getAllByLabelText(/flag as urgent/i)[0];

    fireEvent.click(markReadButton);
    expect(onMarkRead).toHaveBeenCalledWith(firstEmail.id);

    fireEvent.click(flagButton);
    expect(onFlag).toHaveBeenCalledWith(firstEmail.id);
  });
});

const mockEmail: EmailMessage = {
  id: '1',
  sender: {
    name: 'Test User',
    email: 'test@example.com'
  },
  subject: 'Test Email',
  preview: 'Test preview',
  timestamp: new Date().toISOString(),
  priority: 'MEDIUM',
  is_read: false,
  category: 'inbox',
  content: 'Test content',
  processed: false,
  stress_level: 'LOW'
}; 