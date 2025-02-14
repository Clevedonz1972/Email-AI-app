import { useState, useCallback } from 'react';
import { AIService } from '@/services/ai/aiService';
import { logger } from '@/utils/logger';
import type { EmailSummary } from '@/types/email';

interface UseAIReturn {
  analyzeEmail: (content: string) => Promise<EmailSummary | null>;
  generateReply: (content: string) => Promise<string | null>;
  isLoading: boolean;
  userErrorMessage: string | null;
}

const NETWORK_MAX_RETRIES = 3;
const SERVER_MAX_RETRIES = 1;
const RETRY_DELAY = 1000; // 1 second
const REQUEST_TIMEOUT = 10000; // 10 seconds

type RetryableErrorType = 'network' | 'server' | 'none';

const getErrorType = (error: unknown): RetryableErrorType => {
  if (error instanceof Error) {
    if (error.name === 'TypeError' && error.message.includes('network')) {
      return 'network';
    }
    if (error instanceof Response && error.status >= 500) {
      return 'server';
    }
  }
  return 'none';
};

const getMaxRetries = (errorType: RetryableErrorType): number => {
  switch (errorType) {
    case 'network':
      return NETWORK_MAX_RETRIES;
    case 'server':
      return SERVER_MAX_RETRIES;
    default:
      return 0;
  }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useAI = (): UseAIReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [userErrorMessage, setUserErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const executeWithRetry = async <T>(
    operation: () => Promise<T>,
    signal: AbortSignal
  ): Promise<T> => {
    let lastError: unknown;
    let attempts = 0;

    while (true) {
      try {
        if (signal.aborted) {
          throw new Error('Request timed out');
        }

        return await operation();
      } catch (error) {
        lastError = error;
        const errorType = getErrorType(error);
        const maxRetries = getMaxRetries(errorType);

        if (attempts < maxRetries) {
          attempts++;
          await delay(RETRY_DELAY * attempts); // Exponential backoff
          continue;
        }

        throw error;
      }
    }
  };

  const executeWithTimeout = async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      return await executeWithRetry(operation, controller.signal);
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const analyzeEmail = useCallback(async (content: string): Promise<EmailSummary | null> => {
    setIsLoading(true);
    setUserErrorMessage(null);

    try {
      const result = await AIService.summarizeEmail(content);
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to analyze email');
      }
      return result.data;
    } catch (error) {
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        return analyzeEmail(content);
      }
      // Log detailed error for developers
      logger.error('Email analysis failed', {
        error,
        contentPreview: content.substring(0, 100),
        wasAborted: error instanceof Error && error.message === 'Request timed out'
      });

      // Set user-friendly error message
      let userMessage = 'Unable to analyze email';
      if (error instanceof Error) {
        if (error.message === 'Request timed out') {
          userMessage = 'The AI service is taking too long to respond. Please try again.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          userMessage = 'Could not connect to AI service. Please check your internet connection.';
        }
      }
      setUserErrorMessage(userMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [retryCount, maxRetries]);

  const generateReply = useCallback(async (content: string): Promise<string | null> => {
    setIsLoading(true);
    setUserErrorMessage(null);

    try {
      const result = await AIService.generateReply(content);
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to generate reply');
      }
      return result.data;
    } catch (error) {
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        return generateReply(content);
      }
      // Log detailed error for developers
      logger.error('Reply generation failed', {
        error,
        contentPreview: content.substring(0, 100),
        wasAborted: error instanceof Error && error.message === 'Request timed out'
      });

      // Set user-friendly error message
      let userMessage = 'Unable to generate reply';
      if (error instanceof Error) {
        if (error.message === 'Request timed out') {
          userMessage = 'The AI service is taking too long to respond. Please try again.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          userMessage = 'Could not connect to AI service. Please check your internet connection.';
        }
      }
      setUserErrorMessage(userMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [retryCount, maxRetries]);

  return {
    analyzeEmail,
    generateReply,
    isLoading,
    userErrorMessage
  };
}; 