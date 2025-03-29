import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Tooltip,
  LinearProgress,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(1),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const StatValue = styled(Box)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 'bold',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const TrendIndicator = styled(Box)<{ trend: 'up' | 'down' }>(({ theme, trend }) => ({
  display: 'flex',
  alignItems: 'center',
  color: trend === 'up' ? theme.palette.success.main : theme.palette.error.main,
  '& svg': {
    marginRight: theme.spacing(0.5),
  },
}));

export const AnalyticsSummary: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const stats = {
    emailVolume: {
      value: 25,
      trend: 'down' as const,
      change: '-15%',
      label: 'Daily Emails',
    },
    responseTime: {
      value: '2.5h',
      trend: 'up' as const,
      change: '+20%',
      label: 'Avg Response Time',
    },
    stressLevel: {
      value: 65,
      trend: 'down' as const,
      change: '-35%',
      label: 'Stress Score',
    },
    completionRate: {
      value: 85,
      trend: 'up' as const,
      change: '+10%',
      label: 'Task Completion',
    },
  };

  const renderTrend = (trend: 'up' | 'down', change: string) => (
    <TrendIndicator trend={trend}>
      {trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
      <Box component="span" sx={{ fontSize: '0.875rem' }}>{change}</Box>
    </TrendIndicator>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error" variant="body1">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Email Analytics
      </Typography>
      
      <Grid container spacing={2}>
        {Object.entries(stats).map(([key, stat]) => (
          <Grid item xs={12} sm={6} key={key}>
            <Tooltip 
              title={`View detailed ${stat.label.toLowerCase()} analytics`}
              arrow
            >
              <StatsCard>
                <Typography 
                  variant="body2" 
                  color="textSecondary"
                  aria-label={stat.label}
                >
                  {stat.label}
                </Typography>
                <StatValue>
                  {typeof stat.value === 'number' ? (
                    <>
                      {stat.value}
                      {key === 'stressLevel' && (
                        <Box mt={1}>
                          <LinearProgress 
                            variant="determinate" 
                            value={stat.value}
                            color={stat.value > 75 ? "error" : stat.value > 50 ? "warning" : "success"}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      )}
                    </>
                  ) : (
                    stat.value
                  )}
                </StatValue>
                {renderTrend(stat.trend, stat.change)}
              </StatsCard>
            </Tooltip>
          </Grid>
        ))}
      </Grid>

      <Box mt={3}>
        <Typography variant="body2" color="textSecondary">
          Quiet Hours: 7:00 PM - 8:00 AM
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Peak Productivity: 9:00 AM - 11:00 AM
        </Typography>
      </Box>
    </Box>
  );
}; 