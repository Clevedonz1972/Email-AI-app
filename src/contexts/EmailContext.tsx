import React, { createContext, useContext, useState, useCallback } from 'react';
import type { EmailMessage, EmailStats, StressLevel } from '@/types/email';
import { AIService } from '@/services/ai/aiService';
import { logger } from '@/utils/logger';

export interface EmailContextType {
  emails: readonly EmailMessage[];
  loading: boolean;
  error: string | null;
  emailStats: EmailStats;
  processing: boolean;
  progress: number;
  processEmails: (emails: readonly EmailMessage[]) => Promise<readonly EmailMessage[]>;
  fetchEmails: (params: { category: string; stressLevel: StressLevel }) => Promise<void>;
}

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
  const [emails, setEmails] = useState<readonly EmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [emailStats] = useState<EmailStats>(defaultStats);

  const fetchEmails = useCallback(async (params: { category: string; stressLevel: StressLevel }) => {
    setLoading(true);
    try {
      // Implement your fetch logic here
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch emails';
      setError(errorMessage);
      logger.error(new Error(errorMessage), { params });
    } finally {
      setLoading(false);
    }
  }, []);

  const processEmails = useCallback(async (emailsToProcess: readonly EmailMessage[]): Promise<readonly EmailMessage[]> => {
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

        setProgress((i + 1) / emailsToProcess.length * 100);
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

  return (
    <EmailContext.Provider 
      value={{
        emails,
        loading,
        error,
        emailStats,
        processing,
        progress,
        setEmails,
        fetchEmails,
        processEmails
      }}
    >
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