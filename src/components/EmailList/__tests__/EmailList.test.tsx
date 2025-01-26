import { screen, fireEvent, within } from '@testing-library/react';
import { render } from '../../../test-utils/test-utils';
import { EmailList } from '../EmailList';
import { mockEmails } from '../../../test-utils/test-utils';

describe('EmailList', () => {
  it('renders all emails with correct information', () => {
    render(<EmailList emails={mockEmails} />);
    
    mockEmails.forEach(email => {
      // Check if sender name is displayed
      expect(screen.getByText(email.sender.name)).toBeInTheDocument();
      
      // Check if subject is displayed
      expect(screen.getByText(email.subject)).toBeInTheDocument();
      
      // Check if preview is displayed
      expect(screen.getByText(email.preview)).toBeInTheDocument();
    });
  });

  it('displays priority indicators correctly', () => {
    render(<EmailList emails={mockEmails} />);
    
    // High priority email should have an error icon
    const highPriorityEmail = mockEmails.find(e => e.priority === 'HIGH');
    const emailCard = screen.getByText(highPriorityEmail!.subject).closest('div');
    expect(emailCard).toHaveStyle({
      borderLeft: expect.stringContaining('FF6B6B'),
    });
  });

  it('handles email actions correctly', () => {
    const mockHandleMarkRead = jest.fn();
    const mockHandleFlag = jest.fn();
    
    render(
      <EmailList 
        emails={mockEmails}
        onMarkRead={mockHandleMarkRead}
        onFlag={mockHandleFlag}
      />
    );
    
    // Get the first email's action buttons
    const firstEmail = screen.getByText(mockEmails[0].subject).closest('div');
    const markReadButton = within(firstEmail!).getByLabelText('mark as read');
    const flagButton = within(firstEmail!).getByLabelText('flag as urgent');
    
    // Test mark as read action
    fireEvent.click(markReadButton);
    expect(mockHandleMarkRead).toHaveBeenCalledWith(mockEmails[0].id);
    
    // Test flag action
    fireEvent.click(flagButton);
    expect(mockHandleFlag).toHaveBeenCalledWith(mockEmails[0].id);
  });

  it('is keyboard navigable', () => {
    render(<EmailList emails={mockEmails} />);
    
    // Focus first email
    const firstEmailCard = screen.getByText(mockEmails[0].subject).closest('div');
    firstEmailCard?.focus();
    expect(document.activeElement).toBe(firstEmailCard);
    
    // Test tab navigation through action buttons
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('tabIndex', '0');
    });
  });
}); 