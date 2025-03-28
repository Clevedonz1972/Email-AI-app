import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';

interface OnboardingTutorialProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  open,
  onClose,
  onComplete
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [notificationSound, setNotificationSound] = useState(true);

  const steps = [
    { 
      label: 'Welcome to ASTI', 
      content: (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h5" gutterBottom>
            Welcome to ASTI - Your ADHD-Friendly Email Assistant
          </Typography>
          <Box sx={{ my: 3, display: 'flex', justifyContent: 'center' }}>
            <Typography 
              variant="h1" 
              sx={{ 
                fontWeight: 'bold',
                color: '#6366f1',
                letterSpacing: '-0.02em'
              }}
            >
              ASTI
            </Typography>
          </Box>
          <Typography variant="body1" paragraph>
            ASTI is designed to help you manage your emails effectively, 
            with features specifically tailored for people with ADHD.
          </Typography>
          <Typography variant="body1">
            Let's take a quick tour to get you started!
          </Typography>
        </Box>
      )
    },
    {
      label: 'Dashboard Overview',
      icon: <DashboardIcon />,
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>
            Your Dashboard
          </Typography>
          <Typography variant="body1" paragraph>
            The dashboard gives you a quick overview of your email status:
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="body1" paragraph>
              • <strong>Email Stress Level</strong>: Shows how overwhelming your inbox is
            </Typography>
            <Typography variant="body1" paragraph>
              • <strong>Unprocessed Emails</strong>: Emails that need your attention
            </Typography>
            <Typography variant="body1" paragraph>
              • <strong>Completed Emails</strong>: Emails you've successfully processed
            </Typography>
            <Typography variant="body1">
              • <strong>Quick Actions</strong>: Process your backlog with a single click
            </Typography>
          </Paper>
          <Typography variant="body2" color="text.secondary">
            Click on any card to navigate to the corresponding section
          </Typography>
        </Box>
      )
    },
    {
      label: 'Email Management',
      icon: <EmailIcon />,
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>
            Managing Your Emails
          </Typography>
          <Typography variant="body1" paragraph>
            ASTI helps you process emails based on:
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="body1" paragraph>
              • <strong>Priority</strong>: Focus on what matters most
            </Typography>
            <Typography variant="body1" paragraph>
              • <strong>Context</strong>: Group similar emails together
            </Typography>
            <Typography variant="body1" paragraph>
              • <strong>Follow-ups</strong>: Never forget to respond
            </Typography>
            <Typography variant="body1">
              • <strong>Time Management</strong>: Set aside dedicated email time
            </Typography>
          </Paper>
          <Typography variant="body1">
            You can process emails in batches using the "Process Backlog" feature
            when you're ready to tackle your inbox.
          </Typography>
        </Box>
      )
    },
    {
      label: 'Accessibility',
      icon: <AccessibilityNewIcon />,
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>
            Accessibility Preferences
          </Typography>
          <Typography variant="body1" paragraph>
            Customize ASTI to work best for you:
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  color="primary"
                />
              }
              label="High Contrast Mode"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
              Enhances visual distinction between elements
            </Typography>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={largeText}
                  onChange={(e) => setLargeText(e.target.checked)}
                  color="primary"
                />
              }
              label="Large Text"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
              Increases text size throughout the application
            </Typography>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSound}
                  onChange={(e) => setNotificationSound(e.target.checked)}
                  color="primary"
                />
              }
              label="Notification Sounds"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
              Audio cues for important events
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary">
            You can change these settings anytime in the Preferences section
          </Typography>
        </Box>
      )
    },
    {
      label: 'All Set!',
      icon: <SettingsIcon />,
      content: (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h5" gutterBottom>
            You're all set!
          </Typography>
          <Box sx={{ my: 3, display: 'flex', justifyContent: 'center' }}>
            <Typography 
              variant="h1" 
              sx={{ 
                fontWeight: 'bold',
                color: '#6366f1',
                letterSpacing: '-0.02em'
              }}
            >
              ASTI
            </Typography>
          </Box>
          <Typography variant="body1" paragraph>
            Thanks for taking the time to go through this introduction.
          </Typography>
          <Typography variant="body1" paragraph>
            Remember, ASTI is here to help you manage your emails in a way that works for your brain.
          </Typography>
          <Typography variant="body1">
            Click "Finish" to start using ASTI!
          </Typography>
        </Box>
      )
    }
  ];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleComplete();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleComplete = () => {
    // Save accessibility preferences
    if (highContrast) {
      localStorage.setItem('highContrast', 'true');
    }
    if (largeText) {
      localStorage.setItem('largeText', 'true');
    }
    localStorage.setItem('notificationSound', notificationSound ? 'true' : 'false');
    
    // Mark onboarding as complete
    localStorage.setItem('onboardingComplete', 'true');
    
    onComplete();
  };

  const handleSkip = () => {
    // Mark onboarding as complete but don't save preferences
    localStorage.setItem('onboardingComplete', 'true');
    onComplete();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5">ASTI Onboarding</Typography>
      </DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4, mt: 2 }}>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel StepIconProps={{ icon: step.icon || index + 1 }}>
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {steps[activeStep].content}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0 }}>
        {activeStep !== 0 && (
          <Button onClick={handleBack}>
            Back
          </Button>
        )}
        <Box sx={{ flex: '1 1 auto' }} />
        
        {activeStep === 0 && (
          <Button onClick={handleSkip} color="inherit">
            Skip Tour
          </Button>
        )}
        
        <Button onClick={handleNext} variant="contained" color="primary">
          {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OnboardingTutorial; 