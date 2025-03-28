import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Switch, 
  FormControlLabel,
  Divider,
  Paper,
  Alert,
  Snackbar
} from '@mui/material';
import OnboardingTutorial from '../components/Onboarding/OnboardingTutorial';
import { useNavigate } from 'react-router-dom';

const AdminOnboarding: React.FC = () => {
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState<boolean>(false);
  const [showOnboardingTutorial, setShowOnboardingTutorial] = useState<boolean>(false);
  const [notification, setNotification] = useState<{open: boolean, message: string, severity: 'success' | 'error' | 'info' | 'warning'}>({
    open: false,
    message: '',
    severity: 'info'
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Get current state from localStorage
    const isOnboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
    const isWelcomeMessageShown = localStorage.getItem('showWelcomeMessage') !== 'false';
    
    setOnboardingComplete(isOnboardingComplete);
    setShowWelcomeMessage(isWelcomeMessageShown);
  }, []);

  const handleResetOnboarding = () => {
    localStorage.removeItem('onboardingComplete');
    setOnboardingComplete(false);
    showNotification('Onboarding reset successfully. Users will see onboarding on next visit.', 'success');
  };

  const handleToggleWelcomeMessage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    localStorage.setItem('showWelcomeMessage', newValue ? 'true' : 'false');
    setShowWelcomeMessage(newValue);
    showNotification(
      newValue ? 'Welcome message enabled' : 'Welcome message disabled', 
      'success'
    );
  };

  const handleTestOnboarding = () => {
    setShowOnboardingTutorial(true);
  };

  const handleOnboardingComplete = () => {
    setShowOnboardingTutorial(false);
    showNotification('Onboarding test completed', 'success');
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification({...notification, open: false});
  };

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  const simulateNewUser = () => {
    localStorage.removeItem('onboardingComplete');
    localStorage.setItem('showWelcomeMessage', 'true');
    showNotification('New user state simulated. Visit dashboard to see onboarding.', 'success');
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Onboarding Controls
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          This panel allows administrators to manage and test onboarding experiences within the application.
        </Typography>
        <Button variant="outlined" onClick={navigateToDashboard} sx={{ mt: 1 }}>
          Return to Dashboard
        </Button>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current User Onboarding Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  Onboarding Completed:
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: onboardingComplete ? 'success.main' : 'error.main' 
                  }}
                >
                  {onboardingComplete ? 'Yes' : 'No'}
                </Typography>
              </Box>
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={showWelcomeMessage} 
                    onChange={handleToggleWelcomeMessage} 
                    color="primary"
                  />
                }
                label="Show Welcome Message"
              />

              <Divider sx={{ my: 2 }} />
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleResetOnboarding}
                fullWidth
                sx={{ mb: 2 }}
              >
                Reset Onboarding State
              </Button>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                This will reset the onboarding state for the current user, making the system think they are a new user.
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Testing Tools
              </Typography>
              <Button 
                variant="contained" 
                onClick={handleTestOnboarding}
                fullWidth
                sx={{ mb: 2 }}
              >
                Launch Onboarding Tutorial
              </Button>
              
              <Button 
                variant="outlined" 
                onClick={simulateNewUser}
                fullWidth
                sx={{ mb: 2 }}
              >
                Simulate New User
              </Button>
              
              <Alert severity="warning">
                The "Simulate New User" option resets onboarding state and enables the welcome message. Visit the dashboard afterward to see the onboarding experience.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {showOnboardingTutorial && (
        <OnboardingTutorial 
          open={showOnboardingTutorial} 
          onComplete={handleOnboardingComplete} 
          onClose={handleOnboardingComplete}
        />
      )}

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminOnboarding; 