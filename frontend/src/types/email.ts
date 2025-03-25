// Types for email data

// Email priority levels
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

// Email stress levels
export type StressLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'all';

// Email categories
export type Category = 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'important' | 'work' | 'personal' | 'draft' | 'social' | 'alerts' | 'promotions';

// Contact information interface
export interface Contact {
  name: string;
  email: string;
}

// Action item interface
export interface ActionItem {
  id: string;
  description: string;
  completed: boolean;
  emailId?: string;
}

// Main email message interface
export interface EmailMessage {
  id: string;
  subject: string;
  content: string;
  preview: string;
  sender: Contact;
  recipient?: Contact;
  timestamp: string;
  is_read: boolean;
  processed: boolean;
  priority: Priority;
  category: Category;
  stress_level: StressLevel;
  sentiment_score: number;
  action_items?: string[] | ActionItem[];
  summary?: string;
  action_required?: boolean;
  is_processed?: boolean;
}

// Email analysis interface
export interface EmailAnalysis {
  stress_level: StressLevel;
  priority: Priority;
  summary: string;
  action_items: string[] | ActionItem[];
  sentiment_score: number;
}

// Email summary interface (used by AI service)
export interface EmailSummary {
  id: string;
  subject: string;
  preview: string;
  sender: Contact;
  timestamp: string;
  is_read: boolean;
  priority: Priority;
  stress_level: StressLevel;
}

// Interface for email reply options
export interface EmailReplyOption {
  id: number;
  tone: string;
  content: string;
  sentiment_score: number;
}

// Interface for stress report data
export interface StressReport {
  overall_stress: StressLevel;
  high_stress_emails: number;
  medium_stress_emails: number;
  low_stress_emails: number;
  needs_break: boolean;
  recommendations: string[];
  trigger_words_detected?: string[];
}

// Email statistics interface
export interface EmailStats {
  total: number;
  unread: number;
  priority: Priority;
  categories: {
    inbox: number;
    sent: number;
    draft: number;
    trash: number;
  };
  high: number;
  medium: number;
  low: number;
  urgentEmails: EmailMessage[];
  actionRequired: EmailMessage[];
}

export interface EmailComposerProps {
  onSend: (email: Omit<EmailMessage, 'id' | 'is_read' | 'processed'>) => Promise<void>;
  onClose: () => void;
  defaultRecipient?: string;
  defaultSubject?: string;
}

export interface EmailDetailProps {
  email: EmailMessage;
  onMarkRead?: (id: string) => void;
  onReply?: () => void;
  onSendReply?: (content: string) => void;
  onFlag?: (id: string) => void;
  onArchive?: (id: string) => void;
} 