import React from 'react';
import { Box, Typography, LinearProgress, Chip } from '@mui/material';

interface StressMonitorProps {
  stressLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  emailCount?: number;
}

export const StressMonitor: React.FC<StressMonitorProps> = ({ 
  stressLevel = 'LOW',
  emailCount = 0 
}) => {
  // Determine progress value based on stress level
  const getProgressValue = () => {
    switch(stressLevel) {
      case 'HIGH': return 90;
      case 'MEDIUM': return 60;
      case 'LOW': return 30;
      default: return 0;
    }
  };

  // Determine color based on stress level
  const getColor = () => {
    switch(stressLevel) {
      case 'HIGH': return 'error';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'success';
      default: return 'info';
    }
  };

  return (
    <Box sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Stress Monitoring
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" gutterBottom>
          Current stress level based on email content and volume:
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body1" sx={{ mr: 1 }}>
            <strong>Level:</strong>
          </Typography>
          <Chip 
            label={stressLevel} 
            color={getColor() as any}
            size="small"
          />
        </Box>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={getProgressValue()} 
            color={getColor() as any}
          />
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary">
        Based on analysis of {emailCount} emails in your inbox.
      </Typography>
    </Box>
  );
}; 