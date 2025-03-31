export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type StressLevel = Priority | 'all';
export type Category = 'inbox' | 'sent' | 'draft' | 'trash';

export interface EmailSender {
  email: string;
  name?: string;
}

export interface ActionItem {
  id: string;
  description: string;
  completed: boolean;
}

export interface EmailMessage {
  id: number;
  subject: string;
  content: string;
  preview: string;
  sender: {
    email: string;
    name: string;
  };
  timestamp: string;
  priority: Priority;
  stress_level: StressLevel;
  is_read: boolean;
  category: Category;
  processed: boolean;
  action_required?: boolean;
  summary?: string;
  action_items?: Array<{
    id: string;
    description: string;
    completed: boolean;
  }>;
  sentiment_score: number;
  ai_summary?: string;
  ai_emotional_tone?: string;
  ai_suggested_action?: any;
  embedding_id?: string;
}

export interface EmailSummary {
  summary: string;
  priority: Priority;
  stress_level: StressLevel;
  action_required?: boolean;
}

export interface EmailStats {
  total: number;
  unread: number;
  priority: Priority;
  categories: Record<Category, number>;
  high: number;
  medium: number;
  low: number;
  urgentEmails: EmailMessage[];
  actionRequired: EmailMessage[];
}

export interface EmailAnalysis {
  summary: string;
  stress_level: StressLevel;
  priority: Priority;
  action_items: ActionItem[];
  sentiment_score: number;
  emotional_tone?: string;
  explicit_expectations?: string[];
  implicit_expectations?: string[];
  suggested_actions?: Array<{
    action: string;
    steps?: string[];
    deadline?: string;
    effort_level?: StressLevel;
  }>;
  suggested_response?: string;
  needs_immediate_attention?: boolean;
} 