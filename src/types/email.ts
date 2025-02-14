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
  id: string;
  sender: EmailSender;
  subject: string;
  content: string;
  preview: string;
  timestamp: string;
  priority: Priority;
  is_read: boolean;
  category: Category;
  processed: boolean;
  stress_level: StressLevel;
  summary?: string;
  action_required?: boolean;
  action_items?: ActionItem[];
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