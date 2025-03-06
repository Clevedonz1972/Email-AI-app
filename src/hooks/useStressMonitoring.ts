import { useState, useEffect } from 'react';
import { EmailMessage } from '@/types/email';

export function useStressMonitoring(emails: EmailMessage[]) {
  const [overallStressLevel, setOverallStressLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const [needsBreak, setNeedsBreak] = useState(false);

  useEffect(() => {
    // Calculate stress based on email priorities and user's current state
    const highStressEmails = emails.filter(e => e.stress_level === 'HIGH').length;
    const totalEmails = emails.length;
    
    if (highStressEmails / totalEmails > 0.3) {
      setOverallStressLevel('HIGH');
      setNeedsBreak(true);
    } else if (highStressEmails / totalEmails > 0.1) {
      setOverallStressLevel('MEDIUM');
    }
  }, [emails]);

  return {
    overallStressLevel,
    needsBreak,
    highPriorityCount: emails.filter(e => e.priority === 'HIGH').length,
    unreadCount: emails.filter(e => !e.is_read).length
  };
} 