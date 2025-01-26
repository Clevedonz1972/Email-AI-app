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

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
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
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <EmailList />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}; 