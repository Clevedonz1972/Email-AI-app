import axios, { AxiosError } from 'axios';
import { EmailSummary, AIResponse } from './types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export class AIService {
  private static async retryOperation<T>(
    operation: () => Promise<T>,
    retries: number = MAX_RETRIES
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0 && error instanceof AxiosError) {
        // Only retry on network errors or 5xx server errors
        if (!error.response || error.response.status >= 500) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return this.retryOperation(operation, retries - 1);
        }
      }
      throw error;
    }
  }

  static async summarizeEmail(emailContent: string): Promise<AIResponse> {
    try {
      const response = await this.retryOperation(() => 
        axios.post(
          `${API_BASE_URL}/api/ai/summarize`,
          { content: emailContent },
          { withCredentials: true }
        )
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('AI Summarization failed:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  static async getPriority(emailContent: string): Promise<AIResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/ai/priority`,
        { content: emailContent },
        { withCredentials: true }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('AI Priority analysis failed:', error);
      return {
        success: false,
        error: 'Failed to analyze email priority'
      };
    }
  }

  private static getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
      if (error.response?.status === 429) {
        return 'Rate limit exceeded. Please try again later.';
      }
      return error.response?.data?.error || error.message;
    }
    return 'An unexpected error occurred';
  }
} 