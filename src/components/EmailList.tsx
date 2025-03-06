import React from 'react';
import type { EmailMessage } from '@/types/email';

interface EmailListProps {
  emails: EmailMessage[];
  loading?: boolean;
}

const EmailList: React.FC<EmailListProps> = ({ emails, loading = false }) => {
  return (
    <div 
      role="feed" 
      aria-busy={loading}
      aria-label="Email list"
    >
      {emails.map((email: EmailMessage) => (
        <article 
          key={email.id}
          aria-labelledby={`email-${email.id}-title`}
        >
          {/* Email content */}
        </article>
      ))}
    </div>
  );
};

export default EmailList; 