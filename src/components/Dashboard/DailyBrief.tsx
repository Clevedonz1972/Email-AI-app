import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface DailyBriefProps {
  unreadCount?: number;
  eventsCount?: number;
  tasksCount?: number;
  stressLevel?: string;
}

export const DailyBrief: React.FC<DailyBriefProps> = ({ 
  unreadCount = 0, 
  eventsCount = 0, 
  tasksCount = 0, 
  stressLevel = 'LOW' 
}) => {
  return (
    <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Daily Brief
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1">
          <strong>Unread Emails:</strong> {unreadCount}
        </Typography>
        <Typography variant="body1">
          <strong>Today's Events:</strong> {eventsCount}
        </Typography>
        <Typography variant="body1">
          <strong>Pending Tasks:</strong> {tasksCount}
        </Typography>
        <Typography variant="body1">
          <strong>Stress Level:</strong> {stressLevel}
        </Typography>
      </Box>
    </Paper>
  );
}; 