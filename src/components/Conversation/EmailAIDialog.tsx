import React, { useState, useEffect } from 'react';
import { Box, Grid, Divider, Paper, Typography, Chip, Stack } from '@mui/material';
import { SpeakToMe } from './SpeakToMe';
import { EmailMessage } from '@/types/email';
import { useDashboardContext } from '@/contexts/DashboardContext';
import { format, parseISO } from 'date-fns';

interface EmailAIDialogProps {
  open: boolean;
  onClose: () => void;
  email?: EmailMessage;
}

export const EmailAIDialog: React.FC<EmailAIDialogProps> = ({ 
  open, 
  onClose, 
  email 
}) => {
  const { contextEmail } = useDashboardContext();
  const activeEmail = email || (contextEmail || undefined);
  const [initialMessage, setInitialMessage] = useState<string | null>(null);

  // Generate a helpful initial message based on the email
  useEffect(() => {
    if (activeEmail && open) {
      // Clear any previous message
      setInitialMessage(null);
      
      // Set a timeout to avoid immediate reset when reopening with same email
      const timeout = setTimeout(() => {
        setInitialMessage("I'm here to help with this email. What would you like to know?");
      }, 200);
      
      return () => clearTimeout(timeout);
    }
  }, [activeEmail, open]);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'PPp'); // Format like "Apr 29, 2022, 1:45 PM"
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Unknown date';
    }
  };

  return (
    <Grid container sx={{ height: '100%' }}>
      {/* Left Panel - Email Content */}
      <Grid item xs={12} md={5} lg={4}>
        <Paper 
          elevation={0} 
          sx={{ 
            height: '100%', 
            borderRight: '1px solid', 
            borderColor: 'divider',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {activeEmail ? (
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  From: {activeEmail.sender.name} ({activeEmail.sender.email})
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Date: {formatDate(activeEmail.timestamp)}
                </Typography>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                {activeEmail.subject}
              </Typography>
              
              {/* Show category as a chip if it exists */}
              {activeEmail.category && (
                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
                  <Chip 
                    label={activeEmail.category} 
                    size="small" 
                    variant="outlined" 
                  />
                </Stack>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {activeEmail.content}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                No email selected. The AI can still help you with general questions.
              </Typography>
            </Box>
          )}
        </Paper>
      </Grid>

      {/* Right Panel - AI Chat */}
      <Grid item xs={12} md={7} lg={8}>
        <SpeakToMe 
          open={open} 
          onClose={onClose} 
          contextEmail={activeEmail}
          initialMessage={initialMessage}
        />
      </Grid>
    </Grid>
  );
}; 