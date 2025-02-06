import { useState, useCallback } from 'react';
import { AIService } from '@/services/ai/aiService';
import type { EmailSummary } from '@/types/email';

interface UseAIReturn {
  analyzeEmail: (content: string) => Promise<EmailSummary | null>;
  generateReply: (content: string) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

export const useAI = (): UseAIReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeEmail = useCallback(async (content: string): Promise<EmailSummary | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await AIService.summarizeEmail(content);
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Analysis failed');
      }
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze email';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateReply = useCallback(async (content: string): Promise<string | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await AIService.generateReply(content);
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Reply generation failed');
      }
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate reply';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    analyzeEmail,
    generateReply,
    loading,
    error
  };
}; 