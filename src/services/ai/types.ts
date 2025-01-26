export interface EmailSummary {
  original: string;
  summary: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  suggestedActions?: string[];
}

export interface AIResponse {
  success: boolean;
  data?: EmailSummary;
  error?: string;
} 