import React, { useState, useEffect } from 'react';
import { Grid, Box, Alert } from '@mui/material';
import { EmailList } from '../components/Email/EmailList';
import { EmailDetail } from '../components/Email/EmailDetail';
import { useAccessibility } from '../contexts/AccessibilityContext';
import type { EmailMessage } from '@/types/email';

export const EmailContainer: React.FC = () => {
  const { preferences } = useAccessibility();
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/emails');
      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }
      const data = await response.json();
      setEmails(data);
      setError(null);
    } catch (err) {
      setError('Error loading emails. Please try again later.');
      console.error('Error fetching emails:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSelect = (email: EmailMessage) => {
    setSelectedEmail(email);
    if (!email.is_read) {
      markEmailAsRead(email.id);
    }
  };

  const markEmailAsRead = async (emailId: number) => {
    try {
      const response = await fetch(`/api/emails/${emailId}/read`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to mark email as read');
      }
      setEmails(prevEmails =>
        prevEmails.map(email =>
          email.id === emailId ? { ...email, is_read: true } : email
        )
      );
    } catch (err) {
      console.error('Error marking email as read:', err);
    }
  };

  const handleReply = async () => {
    if (!selectedEmail) return;

    try {
      // Get AI-assisted reply suggestions
      const response = await fetch(`/api/emails/${selectedEmail.id}/reply-suggestions`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Failed to get reply suggestions');
      }
      const suggestions = await response.json();
      
      // Here you would typically open a reply composer with the suggestions
      console.log('Reply suggestions:', suggestions);
    } catch (err) {
      console.error('Error getting reply suggestions:', err);
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: '100vw',
        overflow: 'hidden',
      }}
    >
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            fontSize: preferences.fontSize * 0.875,
          }}
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid
          item
          xs={12}
          md={selectedEmail ? 4 : 12}
          sx={{
            transition: preferences.reducedMotion ? 'none' : 'all 0.3s ease',
          }}
        >
          <EmailList
            emails={emails}
            loading={loading}
            onSelectEmail={handleEmailSelect}
            onMarkRead={markEmailAsRead}
          />
        </Grid>

        {selectedEmail && (
          <Grid
            item
            xs={12}
            md={8}
            sx={{
              transition: preferences.reducedMotion ? 'none' : 'all 0.3s ease',
            }}
          >
            <EmailDetail
              email={selectedEmail}
              onReply={handleReply}
              onMarkRead={() => markEmailAsRead(selectedEmail.id)}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
}; 