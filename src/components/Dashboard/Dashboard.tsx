import React, { useState } from 'react';
import { Box, Container, Grid, Paper, Typography, IconButton, useTheme } from '@mui/material';
import { Email as EmailIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { FocusAssistant } from '../Common/FocusAssistant';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';

interface AppMetrics {
  stress_level: 'LOW' | 'MEDIUM' | 'HIGH';
  unread_count: number;
  priority_items: number;
  last_checked: string;
}

export const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { preferences } = useAccessibility();
  const [activeApp, setActiveApp] = useState('email');
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Set up keyboard navigation
  useKeyboardNavigation({
    enabled: preferences.focusMode,
    onArrowUp: () => {/* Handle navigation */},
    onArrowDown: () => {/* Handle navigation */},
    onEnter: () => {/* Handle selection */},
  });

  const emailMetrics: AppMetrics = {
    stress_level: 'LOW',
    unread_count: 3,
    priority_items: 1,
    last_checked: new Date().toISOString(),
  };

  const renderAppCard = (title: string, metrics: AppMetrics) => (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        height: '100%',
        transition: preferences.reducedMotion ? 'none' : 'all 0.3s ease',
        backgroundColor: theme.palette.background.paper,
        ...(preferences.highContrast && {
          border: `2px solid ${theme.palette.primary.main}`,
        }),
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography
          variant="h6"
          sx={{
            fontSize: preferences.fontSize * 1.25,
            fontWeight: 'bold',
          }}
        >
          {title}
        </Typography>
        <IconButton
          aria-label={`${title} settings`}
          onClick={() => {/* Handle settings */}}
        >
          <SettingsIcon />
        </IconButton>
      </Box>

      <Box>
        <Typography
          variant="body1"
          sx={{
            fontSize: preferences.fontSize,
            mb: 1,
          }}
        >
          {`${metrics.unread_count} unread messages`}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: preferences.fontSize,
            mb: 1,
          }}
        >
          {`${metrics.priority_items} priority items`}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: preferences.fontSize * 0.875,
            color: theme.palette.text.secondary,
          }}
        >
          {`Last checked: ${new Date(metrics.last_checked).toLocaleString()}`}
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Box component="main" ref={contentRef}>
      <Container maxWidth="lg">
        <Box py={4}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontSize: preferences.fontSize * 1.5,
              mb: 4,
              textAlign: 'center',
            }}
          >
            Welcome to Your Dashboard
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              {renderAppCard('Email', emailMetrics)}
            </Grid>
            {/* Future app cards will be added here */}
          </Grid>
        </Box>

        {preferences.focusMode && (
          <FocusAssistant
            contentRef={contentRef as React.RefObject<HTMLDivElement>}
            onComplete={() => {/* Handle focus completion */}}
          />
        )}
      </Container>
    </Box>
  );
}; 