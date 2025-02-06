import React from 'react';
import { Grid, Paper } from '@mui/material';
import { EmailList } from '@/components/EmailList/EmailList';
import { ErrorBoundary } from '@/ErrorBoundary';

// Dashboard component renders a grid with an EmailList inside a Paper.
// We pass an empty array as the required "emails" prop to EmailList.
const Dashboard: React.FC = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <EmailList emails={[]} />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard;