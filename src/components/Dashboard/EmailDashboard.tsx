import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, useTheme, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { EmailList } from './EmailList';
import { StressLevelIndicator } from './StressLevelIndicator';
import { CategoryManager } from './CategoryManager';
import { AnalyticsSummary } from './AnalyticsSummary';
import { useEmailContext } from '../../contexts/EmailContext';
import { ErrorBoundary } from '../ErrorBoundary';
import { AccessibilitySettings } from '../Settings/AccessibilitySettings';

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

interface EmailDashboardProps {
  // Add props here
}

export const EmailDashboard: React.FC<EmailDashboardProps> = () => {
  const theme = useTheme();
  const { emails, loading, error, fetchEmails } = useEmailContext();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stressFilter, setStressFilter] = useState<string>('all');

  useEffect(() => {
    fetchEmails({ category: selectedCategory, stressLevel: stressFilter });
  }, [selectedCategory, stressFilter, fetchEmails]);

  if (error) {
    return (
      <Box p={3} textAlign="center">
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Typography variant="body1" mt={2}>
          Please try refreshing the page or contact support if the problem persists.
        </Typography>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <DashboardContainer>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <AccessibilitySettings />
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Section>
              <Typography variant="h5" gutterBottom>
                Your Emails
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : (
                <EmailList 
                  emails={emails}
                  selectedCategory={selectedCategory}
                  stressFilter={stressFilter}
                />
              )}
            </Section>
          </Grid>

          <Grid item xs={12} md={4}>
            <DashboardGrid container spacing={2}>
              <Grid item xs={12}>
                <Section>
                  <StressLevelIndicator 
                    onFilterChange={setStressFilter}
                    currentFilter={stressFilter}
                  />
                </Section>
              </Grid>
              
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
    </ErrorBoundary>
  );
}; 