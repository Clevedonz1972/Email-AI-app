import { useCallback } from 'react';
import { useEmailContext } from '@/contexts/EmailContext';
import type { EmailMessage } from '@/types/email';
import type { SensoryPreferences } from '@/types/preferences';

export const useEmailProcessing = () => {
  const { emails, processEmails, emailStats } = useEmailContext();

  const processEmailBatch = useCallback(async (emailsToProcess: EmailMessage[]) => {
    return processEmails(emailsToProcess);
  }, [processEmails]);

  return {
    processEmails: processEmailBatch,
    emails,
    emailStats
  };
}; 