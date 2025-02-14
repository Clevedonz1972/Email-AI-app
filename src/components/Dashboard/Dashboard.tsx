import React from 'react';
import { 
  Box, 
  Typography, 
  Container,
  Paper,
  Grid 
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { EmailList } from '../EmailList/EmailList';
import { useEmailContext } from '@/contexts/EmailContext';
import { SensorySettings } from '../Settings/SensorySettings';
import type { EmailMessage } from '@/types/email';
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary';

interface DashboardProps {
  emails: readonly EmailMessage[];  // Make sure this is readonly
  // ...
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { emails, loading } = useEmailContext();

  return (
    <ErrorBoundary>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
                Welcome, {user?.email}!
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <SensorySettings />
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <EmailList 
                emails={emails}
                isLoading={loading}
                onMarkRead={(id) => console.log('Mark as read:', id)}
                onFlag={(id) => console.log('Flag:', id)}
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </ErrorBoundary>
  );
}; 