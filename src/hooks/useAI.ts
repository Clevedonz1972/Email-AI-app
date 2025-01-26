import { useState } from 'react';
import { AIService } from '../services/ai/aiService';
import { EmailSummary } from '../services/ai/types';

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeEmail = async (content: string): Promise<EmailSummary | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const [summaryResponse, priorityResponse] = await Promise.all([
        AIService.summarizeEmail(content),
        AIService.getPriority(content)
      ]);

      if (!summaryResponse.success || !priorityResponse.success) {
        throw new Error('Failed to analyze email');
      }

      return {
        original: content,
        summary: summaryResponse.data!.summary,
        priority: priorityResponse.data!.priority,
        suggestedActions: summaryResponse.data!.actions
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    analyzeEmail,
    loading,
    error
  };
}; 