import { useState, useCallback } from 'react';
import { AIService } from '@/services/ai/aiService';
import type { EmailSummary } from '@/types/email';

interface UseAIAssistantReturn {
  generateSuggestion: (content: string) => Promise<string | null>;
  simplifyContent: (content: string) => Promise<string | null>;
  checkTone: (content: string) => Promise<number>;
  isGenerating: boolean;
  error: string | null;
}

export const useAIAssistant = (): UseAIAssistantReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestion = useCallback(async (content: string): Promise<string | null> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await AIService.generateReply(content);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to generate suggestion');
      }
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate suggestion';
      setError(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const simplifyContent = useCallback(async (content: string): Promise<string | null> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await AIService.simplifyContent(content);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to simplify content');
      }
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to simplify content';
      setError(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const checkTone = useCallback(async (content: string): Promise<number> => {
    try {
      const response = await AIService.analyzeTone(content);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to analyze tone');
      }
      return response.data.stressLevel;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze tone');
      return 0;
    }
  }, []);

  return {
    generateSuggestion,
    simplifyContent,
    checkTone,
    isGenerating,
    error
  };
}; 