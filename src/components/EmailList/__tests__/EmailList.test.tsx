import { screen, fireEvent } from '@testing-library/react';
import { render } from '@/test-utils/test-utils';
import { EmailList } from '../EmailList';
import { mockEmails } from '@/test-utils/test-utils';
import type { EmailMessage } from '@/types/email';

describe('EmailList', () => {
  const mockSender = {
    email: 'test@example.com',
    name: 'Test User'
  };

  const mockEmails: EmailMessage[] = [
    {
      id: 1,
      subject: 'Test',
      content: 'Test content',
      sender: mockSender,
      preview: 'Test preview',
      timestamp: '2024-02-20T12:00:00Z',
      priority: 'HIGH',
      is_read: false,
      category: 'inbox',
      processed: true,
      stress_level: 'HIGH',
      sentiment_score: 0.5
    }
  ];

  it('renders loading state correctly', () => {
    render(<EmailList emails={[]} isLoading={true} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders empty state correctly', () => {
    render(<EmailList emails={[]} />);
    expect(screen.getByText('No Emails to Display')).toBeInTheDocument();
  });

  it('renders emails correctly', () => {
    render(<EmailList emails={mockEmails} />);
    
    mockEmails.forEach(email => {
      expect(screen.getByText(email.subject)).toBeInTheDocument();
      expect(screen.getByText(email.preview)).toBeInTheDocument();
      if (email.sender.name) {
        expect(screen.getByText(email.sender.name)).toBeInTheDocument();
      }
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
    const markReadButton = screen.getAllByLabelText('Mark as Read')[0];
    const flagButton = screen.getAllByLabelText('Flag as Urgent')[0];

    fireEvent.click(markReadButton);
    expect(onMarkRead).toHaveBeenCalledWith(firstEmail.id);

    fireEvent.click(flagButton);
    expect(onFlag).toHaveBeenCalledWith(firstEmail.id);
  });
});

const mockEmail: EmailMessage = {
  id: 1,
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
  stress_level: 'LOW',
  sentiment_score: 0.5
}; 