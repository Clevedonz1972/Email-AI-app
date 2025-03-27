import React from 'react';
import { Box, Stepper, Step, StepLabel, Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface PasswordResetProgressProps {
  currentStep: number;
  steps: string[];
}

export const PasswordResetProgress: React.FC<PasswordResetProgressProps> = ({
  currentStep,
  steps
}) => {
  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Stepper 
        activeStep={currentStep} 
        alternativeLabel
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {steps.map((label, index) => (
          <Step 
            key={label}
            completed={currentStep > index}
          >
            <StepLabel>
              <Typography
                variant="body2"
                color={currentStep >= index ? 'primary' : 'textSecondary'}
              >
                {label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}; 