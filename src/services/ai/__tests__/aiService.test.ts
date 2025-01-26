import { AIService } from '../aiService';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('summarizeEmail', () => {
    it('should successfully summarize email content', async () => {
      const mockResponse = {
        data: {
          summary: 'Test summary',
          priority: 'HIGH',
          actions: ['Action 1', 'Action 2']
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await AIService.summarizeEmail('Test email content');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should retry on network errors', async () => {
      mockedAxios.post
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: { summary: 'Test summary' } });

      const result = await AIService.summarizeEmail('Test content');

      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
    });
  });
}); 