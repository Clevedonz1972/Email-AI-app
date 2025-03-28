import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export interface DailyBriefProps {
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
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>Your Daily Brief</Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">
          You have {unreadCount} unread emails
        </Typography>
        <Typography variant="body2">
          You have {eventsCount} events today
        </Typography>
        <Typography variant="body2">
          You have {tasksCount} pending tasks
        </Typography>
        <Typography variant="body2">
          Your stress level is {stressLevel}
        </Typography>
      </Box>
    </Paper>
  );
};

export default DailyBrief; 