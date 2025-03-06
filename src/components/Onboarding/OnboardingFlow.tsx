import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import TuneIcon from '@mui/icons-material/Tune';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';

const OnboardingPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 800,
  margin: '0 auto',
  marginTop: theme.spacing(4),
}));

const StepContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const steps = [
  {
    label: 'Welcome',
    icon: <AccessibilityNewIcon />,
    description: 'Welcome to your AI Email Assistant! This tool is designed to help you manage your emails with less stress.',
    content: (
      <>
        <Typography variant="h6" gutterBottom>
          Key Features:
        </Typography>
        <ul>
          <li>AI-powered email analysis and suggestions</li>
          <li>Stress level monitoring</li>
          <li>Clear categorization and organization</li>
          <li>Accessibility-first design</li>
        </ul>
      </>
    ),
  },
  {
    label: 'Email Management',
    icon: <EmailIcon />,
    description: 'Learn how to effectively manage your emails using our AI tools.',
    content: (
      <>
        <Typography variant="body1" paragraph>
          Your emails will be automatically analyzed for:
        </Typography>
        <ul>
          <li>Priority level</li>
          <li>Stress impact</li>
          <li>Required actions</li>
        </ul>
        <Typography variant="body1" paragraph>
          The AI assistant will help you draft responses and manage your time effectively.
        </Typography>
      </>
    ),
  },
  {
    label: 'Personalization',
    icon: <TuneIcon />,
    description: 'Customize your experience to match your needs.',
    content: (
      <>
        <Typography variant="body1" paragraph>
          You can customize:
        </Typography>
        <ul>
          <li>Visual preferences (contrast, text size, animations)</li>
          <li>AI assistance level</li>
          <li>Notification settings</li>
          <li>Email categories</li>
        </ul>
      </>
    ),
  },
];

export const OnboardingFlow: React.FC = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleFinish = () => {
    // Save onboarding completion status
    localStorage.setItem('onboardingComplete', 'true');
    // Redirect to main dashboard
    window.location.href = '/dashboard';
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:8006/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important for cookies
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      // Store the token in localStorage or state management
      localStorage.setItem('accessToken', data.access_token);
      // Handle successful login (e.g., redirect)
    } catch (error) {
      console.error('Login error:', error);
      // Handle error (show message to user)
    }
  };

  return (
    <OnboardingPaper elevation={3}>
      <Typography variant="h4" gutterBottom align="center" color="primary">
        Getting Started
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((step) => (
          <Step key={step.label}>
            <StepLabel
              StepIconComponent={() => (
                <Box display="flex" alignItems="center" justifyContent="center">
                  {activeStep > steps.indexOf(step) ? (
                    <CheckCircleIcon color="primary" />
                  ) : (
                    step.icon
                  )}
                </Box>
              )}
            >
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <StepContent>
        <Typography variant="h6" gutterBottom>
          {steps[activeStep].description}
        </Typography>
        {steps[activeStep].content}
      </StepContent>

      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={activeStep === steps.length - 1 ? handleFinish : handleNext}
        >
          {activeStep === steps.length - 1 ? 'Get Started' : 'Next'}
        </Button>
      </Box>
    </OnboardingPaper>
  );
}; 