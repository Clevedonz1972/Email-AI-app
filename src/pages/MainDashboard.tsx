import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const MainDashboard: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Main Dashboard
        </Typography>
        <Typography variant="body1">
          Welcome to your unified dashboard. Choose an app from the navigation menu.
        </Typography>
      </Box>
    </Container>
  );
};

export default MainDashboard; 