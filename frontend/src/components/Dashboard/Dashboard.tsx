import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Grid,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';
import { useEmailContext } from '../../contexts/EmailContext';
import { EmailList } from '../EmailList/EmailList';
import { DailyBrief } from './DailyBrief';
import { AnalyticsSummary } from './AnalyticsSummary';
import { SensorySettings } from '../Settings/SensorySettings';
import { StressLevelIndicator } from './StressLevelIndicator';
import { CategoryManager } from './CategoryManager';
import type { EmailMessage, StressLevel } from '../../types/email';

const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const DashboardGrid = styled(Grid)(({ theme }) => ({
  '& > .MuiGrid-item': {
    marginBottom: theme.spacing(3),
  },
}));

const Section = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  borderRadius: theme.spacing(1),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const { emails, loading, error, fetchEmails } = useEmailContext();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentStressLevel, setCurrentStressLevel] = useState<StressLevel>('LOW');

  useEffect(() => {
    if (user) {
      fetchEmails({ category: selectedCategory, stressLevel: currentStressLevel });
    }
  }, [user, selectedCategory, currentStressLevel, fetchEmails]);

  const filteredEmails = emails.filter(email => 
    currentStressLevel === 'all' || email.stress_level === currentStressLevel
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Paper sx={{ p: 3, mt: 4, backgroundColor: theme.palette.error.light }}>
          <Typography color="error" variant="h6">
            Error: {error}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <DashboardContainer>
      <Grid container spacing={3}>
        {/* Header Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
              Welcome, {user?.name || 'User'}!
            </Typography>
            <DailyBrief 
              unreadCount={emails.filter(e => !e.is_read).length}
              eventsCount={0} // This will be replaced with actual events count
              tasksCount={emails.filter(e => e.action_required).length}
              stressLevel={currentStressLevel}
            />
          </Paper>
        </Grid>

        {/* Sensory Settings */}
        <Grid item xs={12}>
          <SensorySettings />
        </Grid>

        {/* Stress Level Indicator */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <StressLevelIndicator level={currentStressLevel} />
          </Paper>
        </Grid>

        {/* Main Content Grid */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <EmailList 
              emails={filteredEmails}
              isLoading={loading}
            />
          </Paper>
        </Grid>

        {/* Sidebar Grid */}
        <Grid item xs={12} md={4}>
          <DashboardGrid container spacing={2}>
            <Grid item xs={12}>
              <Section>
                <CategoryManager
                  onCategoryChange={setSelectedCategory}
                  selectedCategory={selectedCategory}
                />
              </Section>
            </Grid>

            <Grid item xs={12}>
              <Section>
                <AnalyticsSummary />
              </Section>
            </Grid>
          </DashboardGrid>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
};

export default Dashboard; 