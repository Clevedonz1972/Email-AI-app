import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, useTheme, CircularProgress, Breadcrumbs, Link, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { EmailList } from '../EmailList/EmailList';
import { StressLevelIndicator } from './StressLevelIndicator';
import { CategoryManager } from './CategoryManager';
import { AnalyticsSummary } from './AnalyticsSummary';
import { WeatherWidget } from '../Weather/WeatherWidget';
import { useEmailContext } from '@/contexts/EmailContext';
import HomeIcon from '@mui/icons-material/Home';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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

export const EmailDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { emails, loading, error, fetchEmails, refreshEmails } = useEmailContext();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentStressLevel, setCurrentStressLevel] = useState<StressLevel>('HIGH');
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);

  useEffect(() => {
    // Fetch emails when component mounts
    refreshEmails();
  }, [refreshEmails]);

  useEffect(() => {
    // Fetch emails when filters change
    fetchEmails({ 
      category: selectedCategory, 
      stressLevel: currentStressLevel === 'all' ? 'ALL' : currentStressLevel 
    });
  }, [selectedCategory, currentStressLevel, fetchEmails]);

  const filteredEmails = emails.filter(email => 
    (currentStressLevel === 'all' || email.stress_level === currentStressLevel) &&
    (selectedCategory === 'all' || email.category === selectedCategory)
  );

  const handleMarkRead = (id: number) => {
    // Logic to mark email as read - would be implemented in EmailContext
    console.log('Mark email as read:', id);
  };

  const handleFlag = (id: number) => {
    // Logic to flag email - would be implemented in EmailContext
    console.log('Flag email:', id);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

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
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            color="inherit"
            onClick={handleBackToDashboard}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Dashboard
          </Link>
          <Typography
            sx={{ display: 'flex', alignItems: 'center' }}
            color="text.primary"
          >
            <EmailIcon sx={{ mr: 0.5 }} fontSize="small" />
            Email Dashboard
          </Typography>
        </Breadcrumbs>
        
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToDashboard}
        >
          Back to Dashboard
        </Button>
      </Box>
      
      {/* Weather Widget - Compact version */}
      <WeatherWidget compact={true} />
      
      <Typography variant="h4" gutterBottom>
        Email Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <StressLevelIndicator level={currentStressLevel} />
          </Paper>
        </Grid>
        
        <Grid container item spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <EmailList 
                emails={filteredEmails}
                isLoading={loading}
                onMarkRead={handleMarkRead}
                onFlag={handleFlag}
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
      </Grid>
    </Box>
  );
}; 