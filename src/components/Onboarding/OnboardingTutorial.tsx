import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  FormControlLabel,
  Switch,
  Slider,
  Dialog,
} from '@mui/material';
import { useAccessibility } from '../../contexts/AccessibilityContext';

const steps = [
  {
    label: 'Welcome',
    description: 'Welcome to your AI-powered email assistant. Let\'s set it up for your needs.',
  },
  {
    label: 'Accessibility Preferences',
    description: 'Customize your experience for maximum comfort and productivity.',
  },
  {
    label: 'Stress Management',
    description: 'Configure how you want to handle potentially stressful emails.',
  },
  {
    label: 'Final Setup',
    description: 'Review your settings and complete the setup.',
  },
];

interface OnboardingTutorialProps {
  open: boolean;
  onComplete: () => void;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  open,
  onComplete,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const { preferences, updatePreferences } = useAccessibility();
  const [localPreferences, setLocalPreferences] = useState(preferences);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      updatePreferences(localPreferences);
      onComplete();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setLocalPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Welcome to Your Email Assistant
            </Typography>
            <Typography paragraph>
              This assistant helps you manage your emails while considering your well-being
              and accessibility needs. Let's set it up together.
            </Typography>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Accessibility Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={localPreferences.highContrast}
                  onChange={(e) =>
                    handlePreferenceChange('highContrast', e.target.checked)
                  }
                />
              }
              label="High Contrast Mode"
            />
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>Font Size</Typography>
              <Slider
                value={localPreferences.fontSize}
                onChange={(_, value) => handlePreferenceChange('fontSize', value)}
                min={12}
                max={24}
                step={2}
                marks
                valueLabelDisplay="auto"
              />
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={localPreferences.reducedMotion}
                  onChange={(e) =>
                    handlePreferenceChange('reducedMotion', e.target.checked)
                  }
                />
              }
              label="Reduce Motion"
            />
          </Box>
        );

      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Stress Management
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={localPreferences.stressManagement.autoBreaks}
                  onChange={(e) =>
                    handlePreferenceChange('stressManagement', {
                      ...localPreferences.stressManagement,
                      autoBreaks: e.target.checked,
                    })
                  }
                />
              }
              label="Break Reminders"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={localPreferences.stressManagement.stressLevelAlerts}
                  onChange={(e) =>
                    handlePreferenceChange('stressManagement', {
                      ...localPreferences.stressManagement,
                      stressLevelAlerts: e.target.checked,
                    })
                  }
                />
              }
              label="Stress Level Alerts"
            />
          </Box>
        );

      case 3:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ready to Start
            </Typography>
            <Typography paragraph>
              Your preferences have been saved. You can always adjust these settings
              later in your profile.
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} maxWidth="md" fullWidth>
      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((step) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {renderStepContent(activeStep)}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Button variant="contained" onClick={handleNext}>
            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Dialog>
  );
}; 