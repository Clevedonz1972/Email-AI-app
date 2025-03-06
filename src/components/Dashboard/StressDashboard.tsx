import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  useTheme,
  Fade,
} from '@mui/material';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import type { EmailMessage } from '@/types/email';

interface StressDashboardProps {
  emails: EmailMessage[];
}

export const StressDashboard: React.FC<StressDashboardProps> = ({ emails }) => {
  const theme = useTheme();
  const { preferences } = useAccessibility();

  const stressStats = {
    high: emails.filter(e => e.stress_level === 'HIGH').length,
    medium: emails.filter(e => e.stress_level === 'MEDIUM').length,
    low: emails.filter(e => e.stress_level === 'LOW').length,
  };

  const averageStress = (
    (stressStats.high * 3 + stressStats.medium * 2 + stressStats.low) /
    (stressStats.high + stressStats.medium + stressStats.low || 1)
  ).toFixed(1);

  const averageStressNum = Number(averageStress);

  return (
    <Box
      sx={{
        p: 3,
        '@media (prefers-reduced-motion: reduce)': {
          '& *': { animation: 'none !important' }
        }
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontSize: `${preferences.fontSize * 1.5}rem`,
          lineHeight: 1.5,
          mb: 4,
          textAlign: 'center',
        }}
        role="text"
      >
        Stress Monitoring Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={preferences.highContrast ? 0 : 3}
            sx={{
              p: 3,
              border: preferences.highContrast ? `2px solid ${theme.palette.primary.main}` : 'none',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              data-testid="animate-stress-meter"
              data-reduced-motion
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                background: theme => theme.palette.primary.main,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 0.6 },
                  '50%': { opacity: 1 },
                  '100%': { opacity: 0.6 },
                },
              }}
            />
            
            <Typography
              variant="h6"
              role="text"
              sx={{
                fontSize: `${preferences.fontSize}rem`,
                lineHeight: 1.5,
                mb: 2,
              }}
            >
              Current Stress Level
            </Typography>

            <Box
              role="alert"
              aria-live="polite"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <CircularProgress
                variant="determinate"
                value={Number(averageStress) * 33.33}
                size={80}
                thickness={8}
                sx={{
                  color: theme =>
                    averageStressNum > 2
                      ? theme.palette.error.main
                      : averageStressNum > 1.5
                      ? theme.palette.warning.main
                      : theme.palette.success.main,
                }}
              />
              <Typography
                variant="h4"
                role="text"
                sx={{
                  fontSize: `${preferences.fontSize * 1.25}rem`,
                  lineHeight: 1.5,
                }}
              >
                {averageStress}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={preferences.highContrast ? 0 : 3}
            sx={{
              p: 3,
              border: preferences.highContrast ? `2px solid ${theme.palette.primary.main}` : 'none',
            }}
          >
            <Typography
              variant="h6"
              role="text"
              sx={{
                fontSize: `${preferences.fontSize}rem`,
                lineHeight: 1.5,
                mb: 2,
              }}
            >
              Stress Distribution
            </Typography>

            <Box
              data-testid="animate-distribution"
              data-reduced-motion
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {Object.entries(stressStats).map(([level, count]) => (
                <Box key={level}>
                  <Typography
                    role="text"
                    sx={{
                      fontSize: `${preferences.fontSize * 0.875}rem`,
                      lineHeight: 1.5,
                      mb: 0.5,
                    }}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: '20px',
                      backgroundColor: theme.palette.grey[200],
                      borderRadius: 1,
                      overflow: 'hidden',
                    }}
                  >
                    <Fade in timeout={500}>
                      <Box
                        sx={{
                          width: `${(count / emails.length) * 100}%`,
                          height: '100%',
                          backgroundColor:
                            level === 'high'
                              ? theme.palette.error.main
                              : level === 'medium'
                              ? theme.palette.warning.main
                              : theme.palette.success.main,
                        }}
                      />
                    </Fade>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 