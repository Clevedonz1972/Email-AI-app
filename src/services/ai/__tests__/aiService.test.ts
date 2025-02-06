import axios from 'axios';
import { AIService } from '../aiService';
import { logger } from '@/utils/logger';

jest.mock('axios');
jest.mock('@/utils/logger');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('summarizeEmail', () => {
    it('returns successful response when API call succeeds', async () => {
      const mockData = {
        summary: 'Test summary',
        priority: 'HIGH' as const,
        stress_level: 'HIGH',
        action_required: true
      };

      mockedAxios.post.mockResolvedValueOnce({ data: mockData });

      const result = await AIService.summarizeEmail('Test content');

      expect(result).toEqual({
        success: true,
        data: mockData
      });
    });

    it('handles API errors correctly', async () => {
      const error = new Error('API Error');
      mockedAxios.post.mockRejectedValueOnce(error);

      const result = await AIService.summarizeEmail('Test content');

      expect(result).toEqual({
        success: false,
        error: 'An unexpected error occurred'
      });
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('generateReply', () => {
    it('returns successful response when API call succeeds', async () => {
      const mockData = {
        content: 'Generated reply'
      };

      mockedAxios.post.mockResolvedValueOnce({ data: mockData });

      const result = await AIService.generateReply('Test content');

      expect(result).toEqual({
        success: true,
        data: mockData
      });
    });

    it('handles API errors correctly', async () => {
      const error = new Error('API Error');
      mockedAxios.post.mockRejectedValueOnce(error);

      const result = await AIService.generateReply('Test content');

      expect(result).toEqual({
        success: false,
        error: 'An unexpected error occurred'
      });
      expect(logger.error).toHaveBeenCalled();
    });
  });
}); 