import { useState, useCallback } from 'react';
import { useAI } from './useAI';
import { logger } from '../utils/logger';
import { EmailContent, ProcessedEmail } from '../types';

export const useEmailProcessing = () => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { analyzeEmail } = useAI();

  const processEmails = useCallback(async (emails: EmailContent[]) => {
    setProcessing(true);
    const results: ProcessedEmail[] = [];
    
    try {
      for (let i = 0; i < emails.length; i++) {
        const email = emails[i];
        const startTime = performance.now();
        
        const analysis = await analyzeEmail(email.content);
        
        const processingTime = performance.now() - startTime;
        logger.log('info', 'Email Processing Time', {
          emailId: email.id,
          processingTime,
          analysisSuccess: !!analysis
        });

        if (analysis) {
          results.push({
            ...email,
            summary: analysis.summary,
            priority: analysis.priority,
            processingTime
          });
        }

        setProgress((i + 1) / emails.length * 100);
      }
    } catch (error) {
      logger.log('error', 'Email Processing Failed', { error });
      throw error;
    } finally {
      setProcessing(false);
      setProgress(0);
    }

    return results;
  }, [analyzeEmail]);

  return {
    processEmails,
    processing,
    progress
  };
}; 