import React from 'react';
import { Box, CircularProgress, Typography, List } from '@mui/material';
import { EmailCard } from '../EmailCard/EmailCard';
import type { EmailMessage } from '@/types/email';

interface EmailListProps {
  emails: readonly EmailMessage[];
  isLoading?: boolean;
  onMarkRead?: (id: string) => void;
  onFlag?: (id: string) => void;
}

export const EmailList: React.FC<EmailListProps> = ({
  emails,
  isLoading = false,
  onMarkRead,
  onFlag
}) => {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!emails.length) {
    return (
      <Box p={3} textAlign="center">
        <Typography color="textSecondary">
          No emails to display
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {emails.map((email) => (
        <EmailCard
          key={email.id}
          email={email}
          onMarkRead={onMarkRead}
          onFlag={onFlag}
        />
      ))}
    </List>
  );
}; 