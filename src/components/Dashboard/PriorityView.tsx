import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { Warning, Error, Info } from '@mui/icons-material';
import { useEmailProcessing } from '../../hooks/useEmailProcessing';
import { useSensoryPreferences } from '../../hooks/useSensoryPreferences';

interface PriorityStats {
  high: number;
  medium: number;
  low: number;
  total: number;
}

export const PriorityView: React.FC = () => {
  const { preferences } = useSensoryPreferences();
  const { emailStats } = useEmailProcessing();

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH': return <Error color="error" />;
      case 'MEDIUM': return <Warning color="warning" />;
      case 'LOW': return <Info color="info" />;
      default: return null;
    }
  };

  return (
    <Paper 
      sx={{ 
        p: 3,
        backgroundColor: preferences.highContrast ? '#000' : '#fff',
        color: preferences.highContrast ? '#fff' : '#000'
      }}
    >
      <Typography variant="h6" gutterBottom>
        Priority Overview
      </Typography>

      <Grid container spacing={2}>
        {/* Urgent Items */}
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" color="error">
              Urgent ({emailStats.high})
            </Typography>
            {emailStats.urgentEmails.map(email => (
              <Tooltip title={email.summary} key={email.id}>
                <Chip
                  icon={getPriorityIcon('HIGH')}
                  label={email.subject}
                  color="error"
                  sx={{ m: 0.5 }}
                  onClick={() => {/* Handle click */}}
                />
              </Tooltip>
            ))}
          </Box>
        </Grid>

        {/* Priority Distribution */}
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Priority Distribution
            </Typography>
            <LinearProgress
              variant="buffer"
              value={(emailStats.high / emailStats.total) * 100}
              valueBuffer={(emailStats.high + emailStats.medium) / emailStats.total * 100}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
        </Grid>

        {/* Action Items */}
        <Grid item xs={12}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Required Actions
            </Typography>
            {emailStats.actionRequired.map(action => (
              <Chip
                key={action.id}
                label={action.description}
                color="primary"
                sx={{ m: 0.5 }}
                onClick={() => {/* Handle click */}}
              />
            ))}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}; 