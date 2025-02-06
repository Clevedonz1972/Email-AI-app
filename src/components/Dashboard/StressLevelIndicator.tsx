import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { StressLevel } from '@/types/email';

interface StressLevelIndicatorProps {
  level: StressLevel;
}

const stressLevelConfig = [
  {
    level: 'HIGH' as const,
    label: 'High Stress',
    icon: <WarningIcon color="error" />,
    description: 'Requires immediate attention'
  },
  {
    level: 'MEDIUM' as const,
    label: 'Medium Stress',
    icon: <InfoIcon color="warning" />,
    description: 'Monitor closely'
  },
  {
    level: 'LOW' as const,
    label: 'Low Stress',
    icon: <CheckCircleIcon color="success" />,
    description: 'Normal priority'
  }
];

export const StressLevelIndicator: React.FC<StressLevelIndicatorProps> = ({ level }) => {
  const config = stressLevelConfig.find(c => c.level === level) || stressLevelConfig[2];

  return (
    <Box>
      <Chip
        icon={config.icon}
        label={config.label}
        color={level === 'HIGH' ? 'error' : level === 'MEDIUM' ? 'warning' : 'success'}
      />
      <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
        {config.description}
      </Typography>
    </Box>
  );
}; 