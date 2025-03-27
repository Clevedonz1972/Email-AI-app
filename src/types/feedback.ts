export interface Feedback {
  id: string;
  type: 'bug' | 'feature' | 'improvement' | 'other';
  content: string;
  category?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface FeedbackData {
  type: Feedback['type'];
  content: string;
  category?: string;
  metadata?: Record<string, unknown>;
} 