import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmailReply } from '../EmailReply';
import { useAI } from '../../../hooks/useAI';

jest.mock('../../../hooks/useAI');

describe('EmailReply', () => {
  const mockOriginalEmail = {
    subject: 'Test Subject',
    content: 'Test content',
    sender: 'test@example.com'
  };

  const mockOnClose = jest.fn();
  const mockOnSend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders reply dialog with original email subject', () => {
    render(
      <EmailReply
        open={true}
        onClose={mockOnClose}
        originalEmail={mockOriginalEmail}
        onSend={mockOnSend}
      />
    );

    expect(screen.getByText(`Reply to: ${mockOriginalEmail.subject}`)).toBeInTheDocument();
  });

  it('generates reply when generate button is clicked', async () => {
    const mockGenerateReply = jest.fn().mockResolvedValue('Generated reply');
    (useAI as jest.Mock).mockReturnValue({
      generateReply: mockGenerateReply,
      loading: false,
      error: null
    });

    render(
      <EmailReply
        open={true}
        onClose={mockOnClose}
        originalEmail={mockOriginalEmail}
        onSend={mockOnSend}
      />
    );

    fireEvent.click(screen.getByText('Generate Reply'));

    await waitFor(() => {
      expect(mockGenerateReply).toHaveBeenCalledWith(mockOriginalEmail.content);
    });
  });
}); 