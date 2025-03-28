import React from 'react';
import { Box } from '@mui/material';

export interface OnboardingTourProps {
  open?: boolean;
  onClose: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  open = false,
  onClose
}) => {
  // Simple placeholder implementation
  if (!open) return null;
  
  return (
    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'none' }}>
      {/* Placeholder for onboarding tour content */}
    </Box>
  );
};

export default OnboardingTour; 