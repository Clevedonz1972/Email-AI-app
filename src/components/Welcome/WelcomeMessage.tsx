import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';

interface WelcomeMessageProps {
  onStartTour?: () => void;
  onDismiss?: () => void;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({
  onStartTour = () => {},
  onDismiss = () => {}
}) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Welcome to ASTI Email Dashboard!
      </Typography>
      <Typography variant="body1" paragraph>
        This AI-powered dashboard helps you manage your emails and reduce stress.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button variant="contained" onClick={onStartTour}>
          Take Tour
        </Button>
        <Button variant="outlined" onClick={onDismiss}>
          Dismiss
        </Button>
      </Box>
    </Paper>
  );
};

export default WelcomeMessage; 