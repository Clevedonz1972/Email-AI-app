import { useCallback } from 'react';
import { useEmailContext } from '@/contexts/EmailContext';
import type { EmailMessage } from '@/types/email';

export const useEmailProcessing = () => {
  const { emails, processEmails } = useEmailContext();

  const processEmailBatch = useCallback(async (emailsToProcess: readonly EmailMessage[]) => {
    return processEmails(emailsToProcess);
  }, [processEmails]);

  return {
    processEmails: processEmailBatch,
    emails
  };
}; 