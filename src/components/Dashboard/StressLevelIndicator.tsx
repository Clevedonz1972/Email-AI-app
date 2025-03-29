import React from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import type { StressLevel } from '@/types/email';

interface StressLevelIndicatorProps {
  level: StressLevel | 'all';
  onLevelChange?: (level: StressLevel | 'all') => void;
}

const stressLevelConfig = [
  {
    level: 'all' as const,
    label: 'All Emails',
    icon: <AllInclusiveIcon />,
    description: 'Show all emails regardless of stress level'
  },
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

export const StressLevelIndicator: React.FC<StressLevelIndicatorProps> = ({ level, onLevelChange }) => {
  const config = stressLevelConfig.find(c => c.level === level) || stressLevelConfig[0];

  const handleLevelChange = (newLevel: StressLevel | 'all') => {
    if (onLevelChange) {
      onLevelChange(newLevel);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Filter by Stress Level
      </Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {stressLevelConfig.map((stressConfig) => (
          <Chip
            key={stressConfig.level}
            icon={stressConfig.icon}
            label={stressConfig.label}
            onClick={() => handleLevelChange(stressConfig.level)}
            color={
              stressConfig.level === level
                ? stressConfig.level === 'HIGH' 
                  ? 'error' 
                  : stressConfig.level === 'MEDIUM' 
                    ? 'warning' 
                    : stressConfig.level === 'LOW' 
                      ? 'success' 
                      : 'primary'
                : 'default'
            }
            variant={stressConfig.level === level ? 'filled' : 'outlined'}
            sx={{ m: 0.5 }}
          />
        ))}
      </Stack>
      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
        {config.description}
      </Typography>
    </Box>
  );
}; 