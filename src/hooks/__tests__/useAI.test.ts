import { renderHook, act } from '@testing-library/react-hooks';
import { AIService } from '@/services/ai/aiService';
import { useAI } from '../useAI';
import { logger } from '@/utils/logger';

// Mock dependencies
jest.mock('@/services/ai/aiService');
jest.mock('@/utils/logger');

const mockAIService = AIService as jest.Mocked<typeof AIService>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('useAI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully analyzes email on first attempt', async () => {
    const mockResponse = {
      success: true,
      data: { summary: 'Test summary', priority: 'HIGH' }
    };

    mockAIService.summarizeEmail.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useAI());

    let response;
    await act(async () => {
      response = await result.current.analyzeEmail('Test content');
    });

    expect(response).toEqual(mockResponse.data);
    expect(mockAIService.summarizeEmail).toHaveBeenCalledTimes(1);
    expect(result.current.userErrorMessage).toBeNull();
  });

  it('retries network error and succeeds on second attempt', async () => {
    const networkError = new TypeError('Failed to fetch: network error');
    const mockResponse = {
      success: true,
      data: { summary: 'Test summary', priority: 'HIGH' }
    };

    mockAIService.summarizeEmail
      .mockRejectedValueOnce(networkError)
      .mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useAI());

    let response;
    await act(async () => {
      response = await result.current.analyzeEmail('Test content');
    });

    expect(response).toEqual(mockResponse.data);
    expect(mockAIService.summarizeEmail).toHaveBeenCalledTimes(2);
    expect(result.current.userErrorMessage).toBeNull();
  });

  it('stops retrying after one attempt for 5xx server error', async () => {
    const serverError = new Response(null, { status: 500 });
    
    mockAIService.generateReply
      .mockRejectedValueOnce(serverError)
      .mockRejectedValueOnce(serverError);

    const { result } = renderHook(() => useAI());

    let response;
    await act(async () => {
      response = await result.current.generateReply('Test content');
    });

    expect(response).toBeNull();
    expect(mockAIService.generateReply).toHaveBeenCalledTimes(2); // Initial + 1 retry
    expect(result.current.userErrorMessage).toBe('Unable to generate reply');
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('handles timeout correctly', async () => {
    // Mock a slow response that will trigger timeout
    mockAIService.summarizeEmail.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(resolve, 11000))
    );

    const { result } = renderHook(() => useAI());

    let response;
    await act(async () => {
      response = await result.current.analyzeEmail('Test content');
    });

    expect(response).toBeNull();
    expect(result.current.userErrorMessage).toBe(
      'The AI service is taking too long to respond. Please try again.'
    );
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Email analysis failed',
      expect.objectContaining({
        wasAborted: true
      })
    );
  });
}); 