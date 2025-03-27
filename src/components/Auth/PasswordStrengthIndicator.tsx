import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

interface PasswordStrengthIndicatorProps {
  strength: 'weak' | 'medium' | 'strong';
  animate?: boolean;
}

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  '& .MuiLinearProgress-bar': {
    transition: 'transform 0.5s ease'
  }
}));

const strengthColors = {
  weak: '#ff4444',
  medium: '#ffa726',
  strong: '#66bb6a'
};

const strengthValues = {
  weak: 33,
  medium: 66,
  strong: 100
};

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  strength,
  animate = true
}) => {
  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography 
          variant="body2" 
          color="textSecondary"
          sx={{ 
            fontWeight: 500,
            color: strengthColors[strength]
          }}
        >
          Password Strength: {strength.charAt(0).toUpperCase() + strength.slice(1)}
        </Typography>
      </Box>
      <StyledLinearProgress
        variant={animate ? "indeterminate" : "determinate"}
        value={strengthValues[strength]}
        sx={{
          backgroundColor: '#e0e0e0',
          '& .MuiLinearProgress-bar': {
            backgroundColor: strengthColors[strength]
          }
        }}
      />
    </Box>
  );
}; 