import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, useTheme, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { EmailList } from '../EmailList/EmailList';
import { StressLevelIndicator } from './StressLevelIndicator';
import { CategoryManager } from './CategoryManager';
import { AnalyticsSummary } from './AnalyticsSummary';
import { useEmailContext } from '@/contexts/EmailContext';
import { AccessibilitySettings } from '../Settings/AccessibilitySettings';
import type { EmailMessage, StressLevel } from '@/types/email';

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

// Add interface for accessibility settings
interface AccessibilitySettingsState {
  textScale: number;
  highContrast: boolean;
  reducedMotion: boolean;
}

export const EmailDashboard: React.FC<EmailDashboardProps> = () => {
  const theme = useTheme();
  const { emails, loading, error, fetchEmails } = useEmailContext();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentStressLevel, setCurrentStressLevel] = useState<StressLevel>('HIGH');
  // Add state for accessibility settings
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettingsState>({
    textScale: 100,
    highContrast: false,
    reducedMotion: false
  });

  useEffect(() => {
    fetchEmails({ category: selectedCategory, stressLevel: currentStressLevel });
  }, [selectedCategory, currentStressLevel, fetchEmails]);

  // Add handler for settings changes
  const handleSettingChange = (setting: keyof AccessibilitySettingsState, value: number | boolean) => {
    setAccessibilitySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const filteredEmails = emails.filter(email => 
    currentStressLevel === 'all' || email.stress_level === currentStressLevel
  );

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
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <AccessibilitySettings 
            settings={accessibilitySettings}
            onSettingChange={handleSettingChange}
          />
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <StressLevelIndicator level={currentStressLevel} />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <EmailList 
              emails={filteredEmails}
              isLoading={loading}
            />
          </Paper>
        </Grid>
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
    </Box>
  );
}; 