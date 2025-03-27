import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { EmailMessage, EmailStats, StressLevel } from '@/types/email';
import { AIService } from '@/services/ai/aiService';
import { logger } from '@/utils/logger';
import { emailService } from '@/services/emailService';
import { mockEmails } from '@/services/mockData';

export interface EmailContextType {
  emails: EmailMessage[];
  loading: boolean;
  error: string | null;
  emailStats: EmailStats;
  processing: boolean;
  progress: number;
  selectedEmail: EmailMessage | null;
  setSelectedEmail: (email: EmailMessage | null) => void;
  processEmails: (emails: EmailMessage[]) => Promise<EmailMessage[]>;
  fetchEmails: (params: { category: string; stressLevel: StressLevel | 'ALL' }) => Promise<void>;
  refreshEmails: () => Promise<void>;
  getStressReport: () => Promise<void>;
  stressReport: any | null;
  stressReportLoading: boolean;
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
  const [emailStats, setEmailStats] = useState<EmailStats>(defaultStats);
  const [useMockData, setUseMockData] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [stressReport, setStressReport] = useState<any | null>(null);
  const [stressReportLoading, setStressReportLoading] = useState(false);
  const [lastParams, setLastParams] = useState<{ category: string; stressLevel: StressLevel | 'ALL' }>({
    category: 'all',
    stressLevel: 'ALL'
  });

  // Load initial test emails
  useEffect(() => {
    fetchEmails({ category: 'all', stressLevel: 'ALL' });
  }, []);

  // Calculate email stats
  useEffect(() => {
    if (emails.length > 0) {
      const unreadCount = emails.filter(email => !email.is_read).length;
      const highPriorityCount = emails.filter(email => email.priority === 'HIGH').length;
      const mediumPriorityCount = emails.filter(email => email.priority === 'MEDIUM').length;
      const lowPriorityCount = emails.filter(email => email.priority === 'LOW').length;
      
      // Get urgent emails (high priority and unread)
      const urgentEmails = emails.filter(
        email => email.priority === 'HIGH' && !email.is_read
      ).slice(0, 3); // Top 3 urgent emails
      
      // Get emails requiring action
      const actionRequired = emails.filter(
        email => email.action_required === true
      ).slice(0, 5); // Top 5 action required emails
      
      // Determine overall priority
      let overallPriority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      if (highPriorityCount > 0) {
        overallPriority = 'HIGH';
      } else if (mediumPriorityCount > 0) {
        overallPriority = 'MEDIUM';
      }
      
      setEmailStats({
        total: emails.length,
        unread: unreadCount,
        priority: overallPriority,
        categories: {
          inbox: emails.filter(email => email.category === 'inbox').length,
          sent: emails.filter(email => email.category === 'sent').length,
          draft: emails.filter(email => email.category === 'draft').length,
          trash: emails.filter(email => email.category === 'trash').length
        },
        high: highPriorityCount,
        medium: mediumPriorityCount,
        low: lowPriorityCount,
        urgentEmails,
        actionRequired
      });
    }
  }, [emails]);

  // Fetch emails from the API
  const fetchEmails = useCallback(async (params: { category: string; stressLevel: StressLevel | 'ALL' }) => {
    setLoading(true);
    setError(null);
    setLastParams(params);
    
    try {
      // Attempt to fetch emails from the API
      // The emailService will handle API errors and fallback to mock data if needed
      const fetchedEmails = await emailService.getTestEmails();
      
      // Update state with the fetched emails (either real or mock)
      setEmails(fetchedEmails);
      
      // We can detect if the response is mock data by comparing structures
      // This approach allows the service to control when to use mock data
      const isMockData = JSON.stringify(fetchedEmails.slice(0, 1)) === JSON.stringify(mockEmails.slice(0, 1));
      setUseMockData(isMockData);
      
      // Log appropriate message based on data source
      if (isMockData) {
        console.info('Using mock email data - this will be replaced with real API data in production');
      } else {
        logger.info('Successfully connected to email API', { count: fetchedEmails.length });
      }
    } catch (err) {
      // This should rarely happen since emailService handles most errors internally
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch emails';
      console.error('Unhandled error in email context:', errorMessage);
      logger.error(new Error(errorMessage), { params });
      
      // Fall back to mock data as a last resort
      setEmails(mockEmails);
      setUseMockData(true);
      setError('Error connecting to email service. Using sample data for now.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh emails with the last used parameters
  const refreshEmails = useCallback(async () => {
    return fetchEmails(lastParams);
  }, [fetchEmails, lastParams]);

  // Get stress report from the API
  const getStressReport = useCallback(async () => {
    setStressReportLoading(true);
    try {
      const report = await emailService.getStressReport();
      setStressReport(report);
    } catch (err) {
      console.error('Error fetching stress report:', err);
      // Fallback mock stress report
      setStressReport({
        overallStress: 'MEDIUM',
        needsBreak: false,
        recommendations: [
          'Consider taking short breaks between checking high-stress emails',
          'Try to batch process similar emails to reduce context switching'
        ],
        stressBreakdown: {
          high: 2,
          medium: 5,
          low: 10
        }
      });
    } finally {
      setStressReportLoading(false);
    }
  }, []);

  // Process emails with AI
  const processEmails = useCallback(async (emailsToProcess: EmailMessage[]) => {
    setProcessing(true);
    setProgress(0);
    
    try {
      const processedEmails: EmailMessage[] = [];
      const totalEmails = emailsToProcess.length;
      
      for (let i = 0; i < totalEmails; i++) {
        const email = emailsToProcess[i];
        
        try {
          // Skip already processed emails
          if (email.processed) {
            processedEmails.push(email);
            setProgress(Math.round(((i + 1) / totalEmails) * 100));
            continue;
          }
          
          // Process email with AI
          const analysis = await AIService.analyzeEmail(email.content);
          
          const processedEmail: EmailMessage = {
            ...email,
            stress_level: analysis.stress_level,
            priority: analysis.priority,
            processed: true,
            summary: analysis.summary,
            action_items: analysis.action_items,
            sentiment_score: analysis.sentiment_score,
          };
          
          processedEmails.push(processedEmail);
        } catch (err) {
          logger.error('Error processing email', { emailId: email.id, error: err });
          processedEmails.push({
            ...email,
            processed: false
          });
        }
        
        setProgress(Math.round(((i + 1) / totalEmails) * 100));
      }
      
      // Update emails state with processed emails
      setEmails(emails => {
        const updatedEmails = [...emails];
        
        processedEmails.forEach(processedEmail => {
          const index = updatedEmails.findIndex(e => e.id === processedEmail.id);
          if (index !== -1) {
            updatedEmails[index] = processedEmail;
          }
        });
        
        return updatedEmails;
      });
      
      return processedEmails;
    } catch (err) {
      logger.error('Error in batch email processing', { error: err });
      throw err;
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  }, []);

  const contextValue: EmailContextType = {
    emails,
    loading,
    error,
    emailStats,
    processing,
    progress,
    selectedEmail,
    setSelectedEmail,
    processEmails,
    fetchEmails,
    refreshEmails,
    getStressReport,
    stressReport,
    stressReportLoading
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