import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Snackbar,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { OnboardingTutorial } from '../../components/Onboarding/OnboardingTutorial';
import { OnboardingFlow } from '../../components/Onboarding/OnboardingFlow';
import { useAuth } from '../../contexts/AuthContext';

// Admin component for managing and testing onboarding flows
const OnboardingControls: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // States for different onboarding components
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [flowOpen, setFlowOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [onboardingType, setOnboardingType] = useState('tutorial');
  
  // Check localStorage for onboarding status
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(() => {
    return localStorage.getItem('onboardingComplete') === 'true';
  });
  
  // For showing welcome message
  const [welcomeMessageEnabled, setWelcomeMessageEnabled] = useState<boolean>(() => {
    return localStorage.getItem('showWelcomeMessage') === 'true';
  });

  // Force update onboarding status when localStorage changes
  useEffect(() => {
    const updateFromStorage = () => {
      setOnboardingComplete(localStorage.getItem('onboardingComplete') === 'true');
      setWelcomeMessageEnabled(localStorage.getItem('showWelcomeMessage') === 'true');
    };
    
    window.addEventListener('storage', updateFromStorage);
    return () => window.removeEventListener('storage', updateFromStorage);
  }, []);

  // Reset onboarding status
  const resetOnboarding = () => {
    localStorage.removeItem('onboardingComplete');
    setOnboardingComplete(false);
    setSnackbarMessage('Onboarding status reset. New users will see the onboarding flow.');
    setShowSnackbar(true);
  };

  // Toggle welcome message
  const toggleWelcomeMessage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    localStorage.setItem('showWelcomeMessage', newValue.toString());
    setWelcomeMessageEnabled(newValue);
    setSnackbarMessage(`Welcome message ${newValue ? 'enabled' : 'disabled'}`);
    setShowSnackbar(true);
  };

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    setTutorialOpen(false);
    setFlowOpen(false);
    setSnackbarMessage('Onboarding completed successfully');
    setShowSnackbar(true);
  };

  // Create test user for onboarding (simulated)
  const createTestUser = () => {
    if (!testEmail || !testEmail.includes('@')) {
      setSnackbarMessage('Please enter a valid email address');
      setShowSnackbar(true);
      return;
    }

    // Simulate creating a test user (in a real app this would call the API)
    setTimeout(() => {
      setSnackbarMessage(`Test user created with email: ${testEmail}`);
      setShowSnackbar(true);
      setTestEmail('');
    }, 1000);
  };
  
  // Open the selected onboarding flow
  const openSelectedOnboarding = () => {
    if (onboardingType === 'tutorial') {
      setTutorialOpen(true);
      setFlowOpen(false);
    } else {
      setFlowOpen(true);
      setTutorialOpen(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          You must be logged in to access this page. This page is intended for administrators only.
        </Alert>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }} 
          onClick={() => navigate('/login')}
        >
          Go to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Onboarding Controls
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        This admin panel allows you to manage and test the onboarding experience for users.
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Onboarding Status Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Onboarding Status
              </Typography>
              <Typography variant="body1" paragraph>
                Current Status: {onboardingComplete ? (
                  <span style={{ color: 'green', fontWeight: 'bold' }}>Completed</span>
                ) : (
                  <span style={{ color: 'orange', fontWeight: 'bold' }}>Not Completed</span>
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Resetting this will show the onboarding flow to all users again.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                variant="contained" 
                color="warning" 
                onClick={resetOnboarding}
              >
                Reset Onboarding Status
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Welcome Message Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Welcome Message
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={welcomeMessageEnabled}
                    onChange={toggleWelcomeMessage}
                  />
                }
                label="Show Welcome Message"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                The welcome message appears at the top of the dashboard and includes a tour button.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/dashboard')}
              >
                View Dashboard
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 4 }} />
      
      <Typography variant="h5" gutterBottom>
        Test Onboarding Flows
      </Typography>
      
      <Grid container spacing={3}>
        {/* Test Onboarding Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Test Onboarding Experience
              </Typography>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="onboarding-type-label">Onboarding Type</InputLabel>
                <Select
                  labelId="onboarding-type-label"
                  value={onboardingType}
                  label="Onboarding Type"
                  onChange={(e) => setOnboardingType(e.target.value as string)}
                >
                  <MenuItem value="tutorial">Tutorial (Dialog)</MenuItem>
                  <MenuItem value="flow">Flow (Full Page)</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary">
                Preview the onboarding experience without affecting your user state.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                variant="contained" 
                onClick={openSelectedOnboarding}
              >
                Launch Onboarding
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Create Test User Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Create Test User
              </Typography>
              <TextField
                fullWidth
                label="Test User Email"
                variant="outlined"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                Create a new test user with default settings for onboarding testing.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={createTestUser}
              >
                Create Test User
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      
      {/* Onboarding Components */}
      {tutorialOpen && (
        <OnboardingTutorial 
          open={tutorialOpen} 
          onComplete={handleOnboardingComplete}
          onClose={() => setTutorialOpen(false)}
        />
      )}
      
      {flowOpen && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.8)', zIndex: 9999, overflowY: 'auto' }}>
          <Box sx={{ position: 'relative', zIndex: 10000, p: 2 }}>
            <Button 
              variant="contained" 
              color="error" 
              onClick={() => setFlowOpen(false)}
              sx={{ position: 'absolute', top: 20, right: 20 }}
            >
              Close Preview
            </Button>
            <OnboardingFlow />
          </Box>
        </Box>
      )}
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSnackbar(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default OnboardingControls; 