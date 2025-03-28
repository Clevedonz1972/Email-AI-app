import React from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { EmailMessage } from '../../types/email';

export interface EmailAnalysisProps {
  email?: EmailMessage;
  analysis?: any;
  loading?: boolean;
  error?: string | null;
  onReply?: (replyText: string) => void;
}

export const EmailAnalysis: React.FC<EmailAnalysisProps> = ({
  email,
  analysis,
  loading = false,
  error = null,
  onReply
}) => {
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>Email Analysis</Typography>
      
      {loading && (
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress size={24} />
        </Box>
      )}
      
      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}
      
      {!loading && !error && analysis && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            Analysis is available for: {email?.subject}
          </Typography>
        </Box>
      )}
      
      {!loading && !error && !analysis && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            {email ? 'Analysis for: ' + email.subject : 'No email selected for analysis'}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default EmailAnalysis; 