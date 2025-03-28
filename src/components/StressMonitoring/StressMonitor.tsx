import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export interface StressMonitorProps {
  emailCount?: number;
  stressScore?: number;
}

export const StressMonitor: React.FC<StressMonitorProps> = ({ 
  emailCount = 0, 
  stressScore = 0 
}) => {
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>Stress Monitor</Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">
          This is a placeholder for the StressMonitor component.
        </Typography>
      </Box>
    </Paper>
  );
};

export default StressMonitor; 