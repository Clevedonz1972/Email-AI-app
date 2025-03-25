import { logger } from '@/utils/logger';
import type { EmailSummary, EmailAnalysis, StressLevel } from '@/types/email';

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

  static async analyzeEmail(content: string): Promise<EmailAnalysis> {
    try {
      // In a real implementation, we would call the API
      // For now, we'll simulate with some mock analysis
      logger.info('Analyzing email content', { contentLength: content.length });
      
      // Simple analysis based on content
      const wordCount = content.split(/\s+/).length;
      const containsUrgentWords = /urgent|asap|immediately|emergency|critical|deadline/i.test(content);
      const containsPositiveWords = /thanks|appreciate|great|good|excellent/i.test(content);
      
      // Determine stress level based on content
      let stress_level: StressLevel = 'LOW';
      if (containsUrgentWords || content.includes('!')) {
        stress_level = wordCount > 100 ? 'HIGH' : 'MEDIUM';
      } else if (content.length > 500) {
        stress_level = 'MEDIUM';
      }
      
      // Determine sentiment score (-5 to 5)
      let sentiment_score = 0;
      if (containsPositiveWords) sentiment_score += 2;
      if (containsUrgentWords) sentiment_score -= 2;
      if (content.includes('!')) sentiment_score -= 1;
      
      // Simple summary generation
      const firstSentence = content.split(/[.!?]/)[0].trim();
      const summary = firstSentence.length > 50 
        ? firstSentence.substring(0, 50) + '...' 
        : firstSentence;
      
      // Extract action items
      const actionItems: string[] = [];
      if (content.toLowerCase().includes('please')) {
        const sentences = content.split(/[.!?]/);
        for (const sentence of sentences) {
          if (sentence.toLowerCase().includes('please')) {
            actionItems.push(sentence.trim());
          }
        }
      }
      
      // Convert string action items to proper ActionItem objects
      const formattedActionItems = actionItems.slice(0, 3).map((item, index) => ({
        id: `action-${index}`,
        description: item,
        completed: false
      }));
      
      // Wait to simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        stress_level,
        sentiment_score,
        summary,
        action_items: formattedActionItems,
        priority: containsUrgentWords ? 'HIGH' : (wordCount > 100 ? 'MEDIUM' : 'LOW')
      };
    } catch (error) {
      logger.error('Error analyzing email', { error });
      // Return a default analysis in case of error
      return {
        stress_level: 'MEDIUM',
        sentiment_score: 0,
        summary: 'Unable to analyze email content.',
        action_items: [],
        priority: 'MEDIUM'
      };
    }
  }

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