import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  AppBar,
  Toolbar,
  Snackbar,
  Alert,
  LinearProgress,
} from '@mui/material';
import { 
  Circle as CircleIcon,
  NotificationsActive as NotificationsIcon,
} from '@mui/icons-material';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { emailService } from '../../services/emailService';
import type { EmailMessage, Category } from '../../types/email';
import { DailyBrief } from '../Dashboard/DailyBrief';
import { EmailList } from '../Email/EmailList';
import { StressMonitor } from '../StressMonitoring/StressMonitor';
import { EmailDetail } from '../Email/EmailDetail';

interface AppMetrics {
  unreadEmails: number;
  pendingTasks: number;
  upcomingEvents: number;
}

export const Dashboard: React.FC = () => {
  const { preferences } = useAccessibility();
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [processedEmails, setProcessedEmails] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [openProcessingDialog, setOpenProcessingDialog] = useState<boolean>(false);
  // Add state for reply notification
  const [replyNotification, setReplyNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const contentRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        setLoading(true);
        const response = await emailService.getTestEmails();
        if (response && Array.isArray(response)) {
          setEmails(response);
        }
      } catch (error) {
        console.error('Error fetching emails:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, []);

  const handleEmailSelect = useCallback(async (email: EmailMessage) => {
    setSelectedEmail(email);
    
    // Mark as read in the UI
    setEmails(prev => 
      prev.map(e => e.id === email.id ? { ...e, is_read: true } : e)
    );
    
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleMarkRead = (id: number) => {
    setEmails(prevEmails =>
      prevEmails.map(email =>
        email.id === id ? { ...email, is_read: true } : email
      )
    );
  };
  
  // Add handler for sending replies
  const handleSendReply = async (emailId: number, content: string): Promise<void> => {
    try {
      // In a real app, you would call an API here
      // For demo purposes, we'll just simulate a successful reply
      console.log(`Sending reply to email ${emailId}: ${content.substring(0, 50)}...`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update email in state (mark as read and processed)
      setEmails(prevEmails =>
        prevEmails.map(email =>
          email.id === emailId 
            ? { ...email, is_read: true, processed: true, category: 'REPLIED' as Category } 
            : email
        )
      );
      
      // If this is the currently selected email, update it
      if (selectedEmail && selectedEmail.id === emailId) {
        setSelectedEmail({
          ...selectedEmail,
          is_read: true,
          processed: true,
          category: 'REPLIED' as Category
        });
      }
      
      // Show success notification
      setReplyNotification({
        open: true,
        message: 'Reply sent successfully',
        severity: 'success',
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error sending reply:', error);
      
      // Show error notification
      setReplyNotification({
        open: true,
        message: 'Failed to send reply',
        severity: 'error',
      });
      
      return Promise.reject(error);
    }
  };
  
  const handleCloseNotification = () => {
    setReplyNotification({
      ...replyNotification,
      open: false,
    });
  };
  
  // Function to process backlog emails
  const handleProcessBacklog = async () => {
    setOpenProcessingDialog(true);
    setIsProcessing(true);
    setProcessingProgress(0);
    
    // Get all unprocessed emails
    const unprocessedEmails = emails.filter(email => !email.processed);
    const totalEmails = unprocessedEmails.length;
    
    if (totalEmails === 0) {
      setIsProcessing(false);
      return;
    }
    
    let processed = 0;
    
    // Process each email
    for (const email of unprocessedEmails) {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update email as processed
      setEmails(prev => 
        prev.map(e => e.id === email.id ? { ...e, processed: true } : e)
      );
      
      processed++;
      setProcessedEmails(processed);
      setProcessingProgress(Math.floor((processed / totalEmails) * 100));
    }
    
    setIsProcessing(false);
  };
  
  // Calculate overall stress level based on emails
  const getOverallStressLevel = () => {
    if (emails.length === 0) return 'LOW';
    
    const highStressCount = emails.filter(e => e.stress_level === 'HIGH').length;
    const mediumStressCount = emails.filter(e => e.stress_level === 'MEDIUM').length;
    
    if (highStressCount >= emails.length * 0.3) return 'HIGH';
    if (mediumStressCount + highStressCount >= emails.length * 0.5) return 'MEDIUM';
    return 'LOW';
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Neurodivergent Email Assistant
          </Typography>
          <Button color="inherit" onClick={() => navigate('/settings')}>
            Settings
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Box mb={3}>
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Daily Brief
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1">
                    <strong>Unread Emails:</strong> {emails.filter(e => !e.is_read).length}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Today's Events:</strong> 3
                  </Typography>
                  <Typography variant="body1">
                    <strong>Pending Tasks:</strong> 5
                  </Typography>
                  <Typography variant="body1">
                    <strong>Stress Level:</strong> {getOverallStressLevel()}
                  </Typography>
                </Box>
              </Paper>
            </Box>
            
            <Box mt={3}>
              <EmailList
                emails={emails}
                loading={loading}
                onSelectEmail={handleEmailSelect}
                onMarkRead={handleMarkRead}
                selectedEmailId={selectedEmail?.id}
                onSendReply={handleSendReply}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={7}>
            <Box mb={3}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleProcessBacklog}
                disabled={isProcessing || emails.filter(e => !e.processed).length === 0}
                sx={{ mr: 2 }}
              >
                Process Email Backlog
              </Button>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {emails.filter(e => e.processed).length} of {emails.length} emails processed
              </Typography>
            </Box>

            <Paper 
              ref={contentRef}
              elevation={1} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                minHeight: '60vh',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {selectedEmail ? (
                <EmailDetail 
                  email={selectedEmail} 
                  onMarkRead={() => handleMarkRead(selectedEmail.id)}
                  onReply={() => console.log(`Replying to email: ${selectedEmail.id}`)}
                  onSendReply={(content) => handleSendReply(selectedEmail.id, content)}
                />
              ) : (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    flex: 1,
                  }}
                >
                  <Typography variant="h6" color="textSecondary">
                    Select an email to view details
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Processing Dialog */}
        <Dialog open={openProcessingDialog && isProcessing}>
          <DialogTitle>Processing Email Backlog</DialogTitle>
          <DialogContent>
            <DialogContentText>
              AI is analyzing and categorizing your emails...
            </DialogContentText>
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography variant="body2">
                Processed {processedEmails} of {emails.filter(e => !e.processed).length} emails
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress variant="determinate" value={processingProgress} />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">{`${Math.round(processingProgress)}%`}</Typography>
                </Box>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Add notification for reply status */}
        <Snackbar
          open={replyNotification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={replyNotification.severity}
            variant="filled"
          >
            {replyNotification.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}; 