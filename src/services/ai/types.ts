import type { Priority } from '@/types/email';

export interface EmailSummary {
  summary: string;
  priority: Priority;
  stress_level: string;
  action_required: boolean;
}

export interface ReplyContent {
  content: string;
}

export interface AIResponse<T = EmailSummary | ReplyContent> {
  success: boolean;
  data?: T;
  error?: string;
} 