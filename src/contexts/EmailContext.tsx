import React, { createContext, useContext, useState, useCallback } from 'react';
import type { EmailMessage, EmailStats, StressLevel } from '@/types/email';
import { AIService } from '@/services/ai/aiService';
import { logger } from '@/utils/logger';

export interface EmailContextType {
  emails: EmailMessage[];
  loading: boolean;
  error: string | null;
  emailStats: EmailStats;
  processing: boolean;
  progress: number;
  processEmails: (emails: EmailMessage[]) => Promise<EmailMessage[]>;
  fetchEmails: (params: { category: string; stressLevel: StressLevel }) => Promise<void>;
}

// Default stats to prevent undefined errors
const defaultStats: EmailStats = {
  total: 0,
  unread: 0,
  priority: 'LOW',
  categories: {
    inbox: 0,
    sent: 0,
    draft: 0,
    trash: 0
  },
  high: 0,
  medium: 0,
  low: 0,
  urgentEmails: [],
  actionRequired: []
};

export const EmailContext = createContext<EmailContextType | undefined>(undefined);

export const EmailProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [emailStats] = useState<EmailStats>(defaultStats);

  // Fetch Emails
  const fetchEmails = useCallback(async (params: { category: string; stressLevel: StressLevel }) => {
    setLoading(true);
    try {
      // TODO: Implement real email fetch logic
      console.log(`Fetching emails with category=${params.category} and stressLevel=${params.stressLevel}`);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch emails';
      setError(errorMessage);
      logger.error(new Error(errorMessage), { params });
    } finally {
      setLoading(false);
    }
  }, []);

  // Process Emails with AI
  const processEmails = useCallback(async (emailsToProcess: EmailMessage[]): Promise<EmailMessage[]> => {
    setProcessing(true);
    const processed: EmailMessage[] = [];

    try {
      for (let i = 0; i < emailsToProcess.length; i++) {
        const email = emailsToProcess[i];
        const analysis = await AIService.summarizeEmail(email.content);

        if (analysis.success && analysis.data) {
          processed.push({
            ...email,
            summary: analysis.data.summary,
            priority: analysis.data.priority,
            stress_level: analysis.data.stress_level as StressLevel,
            processed: true
          });
        }

        setProgress(Math.round(((i + 1) / emailsToProcess.length) * 100));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Email processing failed';
      logger.error(new Error(errorMessage), { emailCount: emailsToProcess.length });
      throw err;
    } finally {
      setProcessing(false);
      setProgress(0);
    }

    return processed;
  }, []);

  const contextValue: EmailContextType = {
    emails,
    loading,
    error,
    emailStats,
    processing,
    progress,
    processEmails,
    fetchEmails
  };

  return (
    <EmailContext.Provider value={contextValue}>
      {children}
    </EmailContext.Provider>
  );
};

export const useEmailContext = (): EmailContextType => {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error('useEmailContext must be used within an EmailProvider');
  }
  return context;
};