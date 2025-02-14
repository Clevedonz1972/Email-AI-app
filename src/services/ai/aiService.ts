import { logger } from '@/utils/logger';
import type { EmailSummary } from '@/types/email';

interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ToneAnalysis {
  stressLevel: number;
  tone: string;
  suggestions?: string[];
}

export class AIService {
  private static readonly API_URL = process.env.REACT_APP_AI_API_URL;

  static async summarizeEmail(content: string): Promise<AIResponse<EmailSummary>> {
    try {
      const response = await fetch(`${this.API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return { success: true, data: data as EmailSummary };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze email';
      logger.error(new Error(errorMessage), { content: content.substring(0, 100) });
      return { success: false, error: errorMessage };
    }
  }

  static async generateReply(content: string): Promise<AIResponse<string>> {
    try {
      const response = await fetch(`${this.API_URL}/generate-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.reply };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate reply';
      logger.error(new Error(errorMessage), { content: content.substring(0, 100) });
      return { success: false, error: errorMessage };
    }
  }

  static async simplifyContent(content: string): Promise<AIResponse<string>> {
    try {
      const response = await fetch(`${this.API_URL}/simplify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.simplified };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to simplify content';
      logger.error(new Error(errorMessage), { content: content.substring(0, 100) });
      return { success: false, error: errorMessage };
    }
  }

  static async analyzeTone(content: string): Promise<AIResponse<ToneAnalysis>> {
    try {
      const response = await fetch(`${this.API_URL}/analyze-tone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return { success: true, data: data as ToneAnalysis };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze tone';
      logger.error(new Error(errorMessage), { content: content.substring(0, 100) });
      return { success: false, error: errorMessage };
    }
  }
} 