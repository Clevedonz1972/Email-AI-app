import { renderHook, act } from '@testing-library/react';
import { useEmailProcessing } from '../useEmailProcessing';
import type { EmailMessage, EmailSummary } from '@/types/email';

const mockEmail: EmailMessage = {
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
  stress_level: 'MEDIUM'
};

const mockAIService = {
  analyzeEmail: jest.fn(),
  generateReply: jest.fn(),
  loading: false,
  error: null
};

describe('useEmailProcessing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process emails correctly', async () => {
    const mockSummary: EmailSummary = {
      summary: 'Test summary',
      priority: 'HIGH',
      stress_level: 'HIGH'
    };

    mockAIService.analyzeEmail.mockResolvedValue({
      success: true,
      data: mockSummary
    });
    mockAIService.generateReply.mockResolvedValue({
      success: true,
      data: 'Test reply'
    });

    const { result } = renderHook(() => useEmailProcessing());

    let processedEmails;
    await act(async () => {
      processedEmails = await result.current.processEmails([mockEmail]);
    });

    expect(processedEmails?.[0]).toEqual(expect.objectContaining({
      ...mockEmail,
      summary: 'Test summary',
      priority: 'HIGH',
      stress_level: 'HIGH',
      processed: true
    }));
  });
}); 