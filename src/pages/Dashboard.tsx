import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Container,
  Divider,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Refresh as RefreshIcon,
  CheckCircle as CompleteIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { StressMonitor } from '@/components/StressMonitoring/StressMonitor';
import { EmailList } from '@/components/Email/EmailList';
import { EmailDetail } from '@/components/Email/EmailDetail';
import { Navbar } from '@/components/Navigation/Navbar';
import { useEmailContext } from '@/contexts/EmailContext';
import type { EmailMessage } from '@/types/email';
import OnboardingTour from '@/components/Onboarding/OnboardingTour';
import WelcomeMessage from '@/components/Welcome/WelcomeMessage';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const Dashboard: React.FC = () => {
  // Local state
  const [error, setError] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useLocalStorage('hasSeenOnboardingTour', false);
  const [showWelcome, setShowWelcome] = useLocalStorage('showWelcomeMessage', true);
  
  // Process Backlog state
  const [processingBacklog, setProcessingBacklog] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processedEmails, setProcessedEmails] = useState<EmailMessage[]>([]);
  const [showProcessedDialog, setShowProcessedDialog] = useState(false);
  
  // Get context and theme variables
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { 
    emails, 
    loading, 
    error: emailError, 
    processing,
    selectedEmail,
    setSelectedEmail,
    refreshEmails
  } = useEmailContext();

  // Check if user has seen the onboarding tour
  useEffect(() => {
    if (!hasSeenTour && !showWelcome) {
      // Show tour after a short delay for better UX
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour, showWelcome]);

  // Handle any errors from the email context
  useEffect(() => {
    if (emailError) {
      setError(emailError);
    }
  }, [emailError]);

  // Refresh emails when component mounts
  useEffect(() => {
    refreshEmails();
  }, [refreshEmails]);

  // Handlers for email interactions
  const handleEmailSelect = (email: EmailMessage) => {
    setSelectedEmail(email);
    console.log("Selected email:", email.subject);
    
    // Mark email as read when selected
    if (!email.is_read) {
      handleMarkRead(email.id);
    }
  };

  const handleMarkRead = (id: number) => {
    console.log("Marking email as read:", id);
    // Update email as read in the local state
    const updatedEmails = emails.map(email => 
      email.id === id ? { ...email, is_read: true } : email
    );
    // This would typically also call an API to mark the email as read on the server
  };

  const handleReply = () => {
    if (!selectedEmail) return;
    console.log("Reply to email:", selectedEmail.id);
    // This would typically navigate to a reply composer or show a reply dialog
  };

  const handleSendReply = async (content: string) => {
    console.log(`Sending reply: "${content.substring(0, 50)}..."`);
    // In a real app, this would send the reply to the API
    return Promise.resolve();
  };

  const handleProcessBacklog = () => {
    setProcessingBacklog(true);
    setProcessingProgress(0);
    setProcessedEmails([]);
    
    // Simulate processing emails with AI
    const totalEmails = emails.filter(email => !email.is_read).length;
    let processed = 0;
    
    // Process unread emails one by one with a delay to simulate AI thinking time
    const unreadEmails = emails.filter(email => !email.is_read);
    
    if (unreadEmails.length === 0) {
      setProcessingBacklog(false);
      setError("No unread emails to process.");
      return;
    }
    
    const processNext = (index: number) => {
      if (index >= unreadEmails.length) {
        // Processing complete
        setProcessingBacklog(false);
        setShowProcessedDialog(true);
        return;
      }
      
      // Simulate AI processing time (500-2000ms per email)
      const processingTime = 500 + Math.random() * 1500;
      
      setTimeout(() => {
        processed++;
        const progress = Math.round((processed / totalEmails) * 100);
        setProcessingProgress(progress);
        
        // Add to processed emails
        setProcessedEmails(prev => [...prev, unreadEmails[index]]);
        
        // Process next email
        processNext(index + 1);
      }, processingTime);
    };
    
    // Start processing
    processNext(0);
  };

  const handleCloseTour = () => {
    setShowTour(false);
    setHasSeenTour(true);
  };

  const handleStartTour = () => {
    setShowTour(true);
    setShowWelcome(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {/* Welcome message and tour */}
        {showWelcome && (
          <WelcomeMessage 
            onStartTour={handleStartTour} 
            onDismiss={() => setShowWelcome(false)} 
          />
        )}
        
        {/* Error display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {/* Backlog processing progress */}
        {processingBacklog && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AIIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                AI Processing Email Backlog
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Our AI is analyzing your email backlog, determining priorities, stress levels, and suggesting replies.
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={processingProgress} 
              sx={{ mb: 1, height: 8, borderRadius: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              {processingProgress}% complete • {processedEmails.length} emails processed
            </Typography>
          </Paper>
        )}

        <Grid container spacing={3}>
          {/* Sidebar with email list and tools */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Email Tools</Typography>
                <Button 
                  startIcon={<RefreshIcon />} 
                  onClick={refreshEmails}
                  disabled={loading || processingBacklog}
                >
                  Refresh
                </Button>
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<AIIcon />}
                onClick={handleProcessBacklog}
                disabled={processingBacklog || loading}
                sx={{ mb: 2 }}
              >
                Process Email Backlog
              </Button>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Let AI help you manage your email backlog by analyzing content, prioritizing, and suggesting replies.
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <StressMonitor />
            </Paper>
            
            <EmailList
              emails={emails}
              loading={loading}
              onSelectEmail={handleEmailSelect}
              onMarkRead={handleMarkRead}
              selectedEmailId={selectedEmail?.id}
            />
          </Grid>
          
          {/* Main content area */}
          <Grid item xs={12} md={8}>
            {selectedEmail ? (
              <EmailDetail 
                email={selectedEmail}
                onReply={handleReply}
                onMarkRead={() => handleMarkRead(selectedEmail.id)}
                onSendReply={handleSendReply}
              />
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  Select an email to view details
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>
      
      {/* Onboarding tour */}
      <OnboardingTour open={showTour} onClose={handleCloseTour} />
      
      {/* Processed Emails Dialog */}
      <Dialog
        open={showProcessedDialog}
        onClose={() => setShowProcessedDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CompleteIcon color="success" sx={{ mr: 1 }} />
            Backlog Processing Complete
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography paragraph>
            The AI has processed {processedEmails.length} emails from your backlog.
            Here's a summary of what was found:
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Chip 
              icon={<WarningIcon color="error" />} 
              label={`${processedEmails.filter(e => e.priority === 'HIGH').length} High Priority`} 
              color="error" 
              variant="outlined"
            />
            <Chip 
              icon={<WarningIcon color="warning" />} 
              label={`${processedEmails.filter(e => e.stress_level === 'HIGH').length} High Stress`} 
              color="warning" 
              variant="outlined"
            />
            <Chip 
              icon={<WarningIcon />} 
              label={`${processedEmails.filter(e => e.action_items && e.action_items.length > 0).length} Need Action`} 
              variant="outlined"
            />
          </Box>
          
          <Typography variant="subtitle1" gutterBottom>
            Top priority emails:
          </Typography>
          
          <List>
            {processedEmails
              .filter(e => e.priority === 'HIGH')
              .slice(0, 5)
              .map(email => (
                <ListItem key={email.id} button onClick={() => {
                  handleEmailSelect(email);
                  setShowProcessedDialog(false);
                }}>
                  <ListItemIcon>
                    {email.stress_level === 'HIGH' ? (
                      <ErrorIcon color="error" />
                    ) : (
                      <WarningIcon color="warning" />
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={email.subject} 
                    secondary={`From: ${email.sender.name}`}
                  />
                </ListItem>
              ))}
          </List>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Click on any email to view it and see AI-generated reply suggestions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowProcessedDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;