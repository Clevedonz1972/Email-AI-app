import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to ASTI
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          AI-powered email and communication management to reduce stress and improve productivity.
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          {isAuthenticated ? (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                size="large"
                onClick={() => navigate('/login')}
              >
                Log In
              </Button>
              <Button 
                variant="outlined" 
                color="primary"
                size="large"
                onClick={() => navigate('/register')}
              >
                Register
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
}; 