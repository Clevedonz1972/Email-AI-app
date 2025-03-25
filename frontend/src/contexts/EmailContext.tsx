import React, { createContext, useContext, useState, useCallback } from 'react';
import type { EmailMessage, StressLevel } from '../types/email';
import { emailService } from '../services/emailService';

interface EmailContextType {
  emails: EmailMessage[];
  loading: boolean;
  error: string | null;
  fetchEmails: (options?: { category?: string; stressLevel?: StressLevel }) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  flagEmail: (id: string) => Promise<void>;
}

const EmailContext = createContext<EmailContextType | undefined>(undefined);

export const EmailProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmails = useCallback(async (options?: { category?: string; stressLevel?: StressLevel }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await emailService.getEmails(options);
      setEmails(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await emailService.markAsRead(id);
      setEmails(prevEmails =>
        prevEmails.map(email =>
          email.id === id ? { ...email, is_read: true } : email
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark email as read');
    }
  }, []);

  const flagEmail = useCallback(async (id: string) => {
    try {
      await emailService.flagEmail(id);
      setEmails(prevEmails =>
        prevEmails.map(email =>
          email.id === id ? { ...email, priority: 'HIGH' } : email
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to flag email');
    }
  }, []);

  return (
    <EmailContext.Provider
      value={{
        emails,
        loading,
        error,
        fetchEmails,
        markAsRead,
        flagEmail,
      }}
    >
      {children}
    </EmailContext.Provider>
  );
};

export const useEmailContext = () => {
  const context = useContext(EmailContext);
  if (context === undefined) {
    throw new Error('useEmailContext must be used within an EmailProvider');
  }
  return context;
}; 