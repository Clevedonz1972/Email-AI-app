import { useState, useCallback } from 'react';
import axios from 'axios';

interface AIResponse {
  success: boolean;
  content?: string;
  error?: string;
}

export const useAIAssistant = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleAIRequest = async (
    endpoint: string,
    content: string
  ): Promise<string | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await axios.post<AIResponse>(`${API_BASE_URL}/api/ai/${endpoint}`, {
        content,
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to generate response');
      }

      return response.data.content || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSuggestion = useCallback(async (content: string) => {
    return handleAIRequest('suggest', content);
  }, []);

  const simplifyContent = useCallback(async (content: string) => {
    return handleAIRequest('simplify', content);
  }, []);

  const checkTone = useCallback(async (content: string): Promise<number> => {
    try {
      const response = await axios.post<{ success: boolean; stress_level: number }>(
        `${API_BASE_URL}/api/ai/analyze-tone`,
        { content }
      );

      if (!response.data.success) {
        throw new Error('Failed to analyze tone');
      }

      return response.data.stress_level;
    } catch (err) {
      console.error('Error analyzing tone:', err);
      return 0;
    }
  }, []);

  return {
    generateSuggestion,
    simplifyContent,
    checkTone,
    isGenerating,
    error,
  };
}; 