import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Container, Typography, Grid, useTheme, Paper, Card, CardContent } from '@mui/material';
import { Email as EmailIcon, Psychology as PsychologyIcon, Insights as InsightsIcon, Schedule as ScheduleIcon } from '@mui/icons-material';

const LandingPage: React.FC = () => {
  const theme = useTheme();
  
  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          py: 10,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" gutterBottom>
            Email AI Assistant
          </Typography>
          <Typography variant="h5" paragraph>
            Reduce stress and increase productivity with AI-powered email management
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button 
              component={Link} 
              to="/login" 
              variant="contained" 
              color="secondary" 
              size="large"
              sx={{ mr: 2 }}
            >
              Log In
            </Button>
            <Button 
              component={Link} 
              to="/register" 
              variant="outlined" 
              color="inherit" 
              size="large"
            >
              Sign Up
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Features
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <EmailIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Smart Email Processing
                </Typography>
                <Typography>
                  Automatically categorize and prioritize your emails
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <PsychologyIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Stress Monitoring
                </Typography>
                <Typography>
                  Track and manage email-related stress levels
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <InsightsIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  AI Insights
                </Typography>
                <Typography>
                  Get actionable insights from your communication patterns
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Smart Scheduling
                </Typography>
                <Typography>
                  Automatically extract and manage calendar events
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box sx={{ backgroundColor: theme.palette.grey[100], py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Ready to transform your email experience?
          </Typography>
          <Button 
            component={Link} 
            to="/register" 
            variant="contained" 
            color="primary" 
            size="large"
            sx={{ mt: 3 }}
          >
            Get Started Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 