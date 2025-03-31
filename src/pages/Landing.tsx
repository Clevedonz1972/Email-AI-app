import React from 'react';
import { Container, Box, Typography, Button, useTheme, useMediaQuery, Fade } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { preferences } = useAccessibility();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle background gradient */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: theme.palette.mode === 'dark'
              ? 'radial-gradient(circle at 30% 30%, rgba(75, 0, 130, 0.05), transparent 70%)'
              : 'radial-gradient(circle at 30% 30%, rgba(215, 190, 255, 0.2), transparent 70%)',
            zIndex: -1,
          }}
        />

        <Fade in={true} timeout={1000}>
          <Box sx={{ mb: 6 }}>
            {/* Neurodiversity Ltd Logo - clickable for authenticated users */}
            <Box 
              component="img"
              src="/assets/neurodivarsity-logo.png"
              alt="Neurodiversity Ltd"
              onClick={isAuthenticated ? () => navigate('/dashboard') : undefined}
              sx={{ 
                maxWidth: isMobile ? '200px' : '250px',
                height: 'auto',
                mb: 3,
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.08))',
                cursor: isAuthenticated ? 'pointer' : 'default',
                transition: 'transform 0.3s ease, filter 0.3s ease',
                '&:hover': isAuthenticated ? {
                  transform: 'scale(1.02)',
                  filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.15))'
                } : {}
              }}
              role={isAuthenticated ? "button" : undefined}
              aria-label={isAuthenticated ? "Go to dashboard" : undefined}
            />
          </Box>
        </Fade>

        <Fade in={true} timeout={1500}>
          <Box>
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom
              sx={{
                fontWeight: 'bold',
                letterSpacing: '-0.02em',
                mb: 3
              }}
            >
              Welcome to ASTI
            </Typography>
            
            {/* New inviting subheading */}
            <Typography 
              variant="h5" 
              color="primary" 
              sx={{ 
                fontWeight: 'medium',
                mb: 3,
                fontStyle: 'italic'
              }}
            >
              Meet your brain's new best friend
            </Typography>
            
            <Typography 
              variant="h6" 
              color="text.secondary" 
              paragraph
              sx={{
                maxWidth: '650px',
                mx: 'auto',
                mb: 5,
              }}
            >
              An AI-powered life support system for Neurodivergent thinkers
            </Typography>
          </Box>
        </Fade>
        
        <Fade in={true} timeout={2000}>
          <Box sx={{ mt: 2 }}>
            {!isAuthenticated && (
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  size="large"
                  onClick={() => navigate('/login')}
                  aria-label="Log in to your account"
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: '28px',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                >
                  Log In
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary"
                  size="large"
                  onClick={() => navigate('/register')}
                  aria-label="Create a new account"
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: '28px',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    borderWidth: '2px',
                    '&:hover': {
                      borderWidth: '2px',
                    }
                  }}
                >
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Fade>
        
        {/* Footer with attribution */}
        <Box sx={{ mt: 'auto', mb: 4, opacity: 0.7 }}>
          <Typography variant="body2" color="text.secondary">
            Powered by Neurodiversity Ltd — Supporting neurodivergent individuals
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}; 