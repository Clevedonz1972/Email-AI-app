import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Alert,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  AlertTitle,
  Switch,
  FormControlLabel,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import MailIcon from '@mui/icons-material/Mail';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DoneIcon from '@mui/icons-material/Done';
import ErrorIcon from '@mui/icons-material/Error';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { EmailList } from './EmailList';
import ActionButtons from '../shared/ActionButtons';
import { EmailMessage } from '../../types/email';
import { ApiClient } from '../../services/apiClient';
import { mockEmailService } from '../../services/mockEmailService';
import { useNavigate } from 'react-router-dom';
import { ArrowForward } from '@mui/icons-material';
import BrainViewer from './BrainViewer';

/**
 * IMPORTANT: Docker Networking Notes
 * 
 * When running in Docker containers, services communicate via container names within the same network.
 * For the frontend container:
 * - API requests should use relative URLs (/api/...) which are proxied to the backend container
 * - The frontend container's proxy configuration in package.json or setupProxy.js handles this routing
 * 
 * This approach lets the app work both in development and in Docker without code changes.
 */

// Testing API service for interacting with the testing backend API
const testingApiService = {
  testConnection: async (): Promise<{ message: string, status: string }> => {
    try {
      // Log the API URL being used
      console.log('API URL from environment:', process.env.REACT_APP_API_URL || 'Not set');
      console.log('API URL from ApiClient:', ApiClient.BASE_URL);
      
      console.log('Testing API connection...');
      // Fix duplicated path segment - in this case we need to include it
      const testUrl = '/api/testing/testing/test-route';
      console.log('Testing endpoint with URL:', testUrl);
      
      const response = await fetch(testUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to connect to API: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Connection test result:', data);
      return data;
    } catch (error) {
      console.error('Error testing connection:', error);
      throw error;
    }
  },

  fetchMockEmails: async (): Promise<EmailMessage[]> => {
    try {
      console.log('Fetching mock emails...');
      const response = await fetch('/api/testing/testing/mock-emails');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch mock emails: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Mock emails data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching mock emails:', error);
      throw error;
    }
  },

  simulateNewEmails: async (count: number = 3): Promise<{ message: string }> => {
    try {
      console.log(`Simulating ${count} new emails...`);
      const response = await fetch(`/api/testing/testing/simulate-new-emails?count=${count}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to simulate new emails: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Simulate emails data:', data);
      return data;
    } catch (error) {
      console.error('Error simulating new emails:', error);
      throw error;
    }
  },

  respondToEmail: async (emailId: string, action: string, replyText?: string): Promise<{ message: string }> => {
    try {
      console.log(`Responding to email ${emailId} with action ${action}...`);
      const params = new URLSearchParams();
      params.append('email_id', emailId);
      params.append('action', action);
      if (replyText) params.append('response_content', encodeURIComponent(replyText));

      const url = `/api/testing/testing/respond-to-email?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to respond to email: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Respond to email data:', data);
      return data;
    } catch (error) {
      console.error('Error responding to email:', error);
      throw error;
    }
  },

  clearMockEmails: async (): Promise<{ message: string }> => {
    try {
      console.log('Clearing mock emails...');
      const response = await fetch(`/api/testing/testing/clear-mock-emails`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to clear mock emails: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Clear emails data:', data);
      return data;
    } catch (error) {
      console.error('Error clearing mock emails:', error);
      throw error;
    }
  },

  // Notify backend about emails being transferred to main inbox
  notifyEmailsTransferred: async (count: number): Promise<boolean> => {
    try {
      console.log(`Notifying backend about ${count} transferred emails...`);
      const response = await fetch(`/api/testing/testing/notify-transferred-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to notify about transferred emails: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Notification response:', data);
      return data.success;
    } catch (error) {
      console.error('Error notifying about transferred emails:', error);
      // Non-critical error, so don't throw
      return false;
    }
  },
};

// Helper function to format the mock emails to match EmailMessage type
const formatMockEmails = (mockEmails: any[]) => {
  return mockEmails.map(email => ({
    id: email.id,
    subject: email.subject,
    content: email.content,
    preview: email.content.substring(0, 100) + '...',
    sender: email.sender,
    timestamp: email.timestamp,
    priority: email.priority,
    stress_level: email.stress_level,
    is_read: email.is_read || false,
    category: email.category || 'inbox',
    processed: true,
    action_required: email.ai_suggested_action?.length > 0,
    summary: email.summary || '',
    action_items: email.action_items || [],
    sentiment_score: 0,
    ai_summary: email.ai_summary || '',
    ai_emotional_tone: email.ai_emotional_tone || '',
    ai_suggested_action: email.ai_suggested_action || [],
    explicit_expectations: email.explicit_expectations || [],
    implicit_expectations: email.implicit_expectations || [],
    needs_immediate_attention: email.needs_immediate_attention || false,
    suggested_response: email.suggested_response || '',
  }));
};

// Main component
export const TestingDashboard: React.FC = () => {
  const [mockEmails, setMockEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [generatingEmails, setGeneratingEmails] = useState<boolean>(false);
  const [transferringEmails, setTransferringEmails] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailCount, setEmailCount] = useState(1);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const navigate = useNavigate();
  
  // Dialog state for email response
  const [replyDialogOpen, setReplyDialogOpen] = useState<boolean>(false);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  
  // Brain Viewer state
  const [showBrainViewer, setShowBrainViewer] = useState<boolean>(false);
  const [selectedEmailForBrain, setSelectedEmailForBrain] = useState<string | null>(null);
  
  // Test API connection on component mount
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        await testingApiService.testConnection();
        setApiConnected(true);
        fetchEmails();
      } catch (error) {
        console.error('API connection test failed:', error);
        setApiConnected(false);
        setErrorMessage('Could not connect to the testing API. Please ensure the backend server is running and correctly configured. The API should be accessible at http://localhost:8000/api/testing/testing/test-route');
      }
    };
    
    testApiConnection();
  }, []);
  
  const fetchEmails = async () => {
    if (!apiConnected) return;
    
    setLoading(true);
    try {
      const emails = await testingApiService.fetchMockEmails();
      setMockEmails(emails);
    } catch (error) {
      setErrorMessage('Failed to fetch mock emails');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateEmails = async () => {
    setGeneratingEmails(true);
    try {
      const result = await testingApiService.simulateNewEmails(emailCount);
      setSuccessMessage(result.message);
      await fetchEmails();
    } catch (error) {
      setErrorMessage('Failed to generate mock emails');
    } finally {
      setGeneratingEmails(false);
    }
  };
  
  const handleClearEmails = async () => {
    setLoading(true);
    try {
      // Clear mocks from API
      await testingApiService.clearMockEmails();
      
      // Also clear any stored mock emails in local storage
      mockEmailService.clearStoredMockEmails();
      
      setSuccessMessage('Mock emails cleared successfully');
      setMockEmails([]);
    } catch (error) {
      setErrorMessage('Failed to clear mock emails');
      console.error('Error clearing emails:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Transfer mock emails to main inbox
  const handleTransferToInbox = async () => {
    if (mockEmails.length === 0) {
      setErrorMessage('No mock emails to transfer. Generate some first.');
      return;
    }
    
    setTransferringEmails(true);
    try {
      // First, use the mockEmailService to store the emails in local storage
      const storageSuccess = await mockEmailService.transferMockEmailsToInbox(mockEmails);
      
      // Then try to notify the backend API (this is optional and won't block success)
      try {
        await testingApiService.notifyEmailsTransferred(mockEmails.length);
      } catch (error) {
        console.warn('Backend notification failed, but emails were stored locally:', error);
        // This is non-critical, so we continue
      }
      
      if (storageSuccess) {
        setSuccessMessage(`${mockEmails.length} mock emails transferred to your inbox successfully!`);
      } else {
        setErrorMessage('Failed to transfer emails to inbox');
      }
    } catch (error) {
      console.error('Error transferring emails:', error);
      setErrorMessage('An error occurred while transferring emails');
    } finally {
      setTransferringEmails(false);
    }
  };
  
  // Handle action buttons
  const handleDoItNow = (emailId: string) => {
    testingApiService.respondToEmail(emailId, 'do_it_now')
      .then(() => {
        setSuccessMessage('Email marked as "Do It Now"');
        fetchEmails();
      })
      .catch(() => setErrorMessage('Failed to update email'));
  };
  
  const handleDefer = (emailId: string) => {
    testingApiService.respondToEmail(emailId, 'defer')
      .then(() => {
        setSuccessMessage('Email deferred');
        fetchEmails();
      })
      .catch(() => setErrorMessage('Failed to defer email'));
  };
  
  const handleAskASTI = (emailId: string) => {
    testingApiService.respondToEmail(emailId, 'ask_asti')
      .then(() => {
        setSuccessMessage('Asked ASTI for assistance');
        fetchEmails();
      })
      .catch(() => setErrorMessage('Failed to ask ASTI'));
  };
  
  const handleOpenReplyDialog = (emailId: string) => {
    setSelectedEmailId(emailId);
    setReplyText('');
    setReplyDialogOpen(true);
  };
  
  const handleCloseReplyDialog = () => {
    setReplyDialogOpen(false);
    setSelectedEmailId(null);
  };
  
  const handleSubmitReply = () => {
    if (!selectedEmailId) return;

    testingApiService.respondToEmail(selectedEmailId, 'reply', replyText)
      .then(() => {
        setSuccessMessage('Reply sent successfully');
        fetchEmails();
        handleCloseReplyDialog();
      })
      .catch(() => setErrorMessage('Failed to send reply'));
  };
  
  const handleCloseSnackbar = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };
  
  const formatEmotionalTone = (tone: string | undefined) => {
    if (!tone) return <Chip label="Unknown" size="small" />;
    
    const icon = 
      tone.toLowerCase().includes('positive') || tone.toLowerCase().includes('friendly') ? 
        <SentimentSatisfiedAltIcon color="success" /> : 
      tone.toLowerCase().includes('negative') || tone.toLowerCase().includes('urgent') ? 
        <SentimentVeryDissatisfiedIcon color="error" /> : 
        <SentimentNeutralIcon color="info" />;
    
    return (
      <Chip 
        icon={icon} 
        label={tone} 
        size="small" 
        variant="outlined" 
      />
    );
  };
  
  // Handle selecting an email for brain visualization
  const handleSelectEmailForBrain = (emailId: string | number) => {
    const emailIdStr = emailId.toString();
    setSelectedEmailForBrain(emailIdStr === selectedEmailForBrain ? null : emailIdStr);
  };
  
  // Toggle brain viewer visibility
  const handleToggleBrainViewer = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowBrainViewer(event.target.checked);
    // Reset selected email if hiding the brain viewer
    if (!event.target.checked) {
      setSelectedEmailForBrain(null);
    }
  };
  
  // Create extraActions for EmailList
  const emailExtraActions = [
    {
      label: 'View Brain Data',
      icon: <PsychologyIcon />,
      action: (emailId: string) => {
        setShowBrainViewer(true); 
        handleSelectEmailForBrain(emailId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      showIf: () => true,
    }
  ];
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            AI Email Analysis Test Dashboard
          </Typography>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => navigate('/dashboard')}
            startIcon={<ArrowForward />}
          >
            Return to Dashboard
          </Button>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          This dashboard simulates the complete flow: receiving emails, analyzing with AI, and displaying the results.
        </Typography>
        
        {apiConnected === false && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => {
                  const testApiConnection = async () => {
                    try {
                      await testingApiService.testConnection();
                      setApiConnected(true);
                      fetchEmails();
                      setErrorMessage(null);
                    } catch (error) {
                      console.error('API connection test failed:', error);
                      setApiConnected(false);
                      setErrorMessage('Could not connect to the testing API. Please ensure the backend server is running and correctly configured.');
                    }
                  };
                  testApiConnection();
                }}
              >
                Retry
              </Button>
            }
          >
            Could not connect to the testing API. Please ensure the backend server is running and correctly configured.
            The API should be accessible at /api/testing/testing/test-route through the frontend proxy.
          </Alert>
        )}
        
        {apiConnected === true && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Successfully connected to the testing API. You can now generate and manage mock emails.
          </Alert>
        )}
        
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel id="email-count-label">Email Count</InputLabel>
              <Select
                labelId="email-count-label"
                value={emailCount}
                label="Email Count"
                onChange={(e) => setEmailCount(Number(e.target.value))}
                size="small"
                disabled={!apiConnected}
              >
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={3}>3</MenuItem>
                <MenuItem value={5}>5</MenuItem>
              </Select>
              <FormHelperText>Number to generate</FormHelperText>
            </FormControl>
            
            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                onClick={handleGenerateEmails} 
                disabled={generatingEmails || apiConnected === false}
              >
                {generatingEmails ? (
                  <>
                    <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                    Generating...
                  </>
                ) : (
                  `Generate ${emailCount} Email${emailCount !== 1 ? 's' : ''}`
                )}
              </Button>
              
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={handleClearEmails} 
                disabled={loading || mockEmails.length === 0}
              >
                Clear Emails
              </Button>
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleTransferToInbox}
                disabled={transferringEmails || mockEmails.length === 0 || apiConnected === false}
                sx={{ ml: 'auto' }}
              >
                {transferringEmails ? (
                  <>
                    <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                    Transferring...
                  </>
                ) : (
                  'Send to Main Inbox'
                )}
              </Button>
            </Box>
            
            <Button
              variant="outlined"
              onClick={fetchEmails}
              disabled={loading || !apiConnected}
              startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
            >
              Refresh
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearEmails}
              disabled={loading || !apiConnected}
              startIcon={<DeleteIcon />}
            >
              Clear All
            </Button>
            
            <FormControlLabel
              control={
                <Switch
                  checked={showBrainViewer}
                  onChange={handleToggleBrainViewer}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PsychologyIcon fontSize="small" />
                  <Typography variant="body2">Brain Viewer</Typography>
                </Box>
              }
              sx={{ ml: 2 }}
            />
          </Stack>
        </Paper>
        
        {/* Brain Viewer Section */}
        {showBrainViewer && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                ASTI's Brain Viewer
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                See how ASTI processes emails using vector memory, knowledge graph, and AI reasoning.
              </Typography>
              
              {mockEmails.length > 0 ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Select an email to explore its AI processing:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {mockEmails.slice(0, 5).map((email) => (
                      <Chip
                        key={email.id}
                        label={email.subject.substring(0, 25) + (email.subject.length > 25 ? '...' : '')}
                        onClick={() => handleSelectEmailForBrain(email.id.toString())}
                        color={selectedEmailForBrain === email.id.toString() ? 'primary' : 'default'}
                        variant={selectedEmailForBrain === email.id.toString() ? 'filled' : 'outlined'}
                      />
                    ))}
                    {mockEmails.length > 5 && (
                      <Chip label={`+${mockEmails.length - 5} more`} variant="outlined" />
                    )}
                  </Box>
                </Box>
              ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Generate some test emails to see ASTI's brain in action.
                </Alert>
              )}
            </Box>
            
            <BrainViewer emailId={selectedEmailForBrain || undefined} />
          </Paper>
        )}
        
        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}
        
        {!loading && mockEmails.length === 0 ? (
          <Box textAlign="center" my={4}>
            <Typography variant="body1" color="text.secondary">
              No mock emails yet. Generate some to see AI analysis in action!
            </Typography>
          </Box>
        ) : (
          <EmailList 
            emails={formatMockEmails(mockEmails)} 
            selectedCategory="all"
            stressFilter="all"
            isLoading={loading}
            onDoItNow={apiConnected ? handleDoItNow : undefined}
            onDefer={apiConnected ? handleDefer : undefined}
            onAskASTI={apiConnected ? handleAskASTI : undefined}
            onAutoReply={apiConnected ? handleOpenReplyDialog : undefined}
            extraActions={emailExtraActions}
          />
        )}
        
        {/* Success Message */}
        {successMessage && (
          <Alert 
            severity="success" 
            sx={{ mb: 2 }}
            onClose={() => setSuccessMessage(null)}
          >
            <AlertTitle>Success</AlertTitle>
            {successMessage}
            {successMessage.includes('transferred') && (
              <Box sx={{ mt: 1 }}>
                <Button 
                  size="small" 
                  color="inherit" 
                  variant="outlined" 
                  onClick={() => navigate('/dashboard')}
                  sx={{ mr: 1 }}
                >
                  Go to Dashboard
                </Button>
                You can now interact with these emails using AI features like "Ask ASTI" and "Auto Reply"
              </Box>
            )}
          </Alert>
        )}
      </Box>
      
      {/* Reply Dialog */}
      <Dialog 
        open={replyDialogOpen} 
        onClose={handleCloseReplyDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Reply to Email</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Your Reply"
            fullWidth
            multiline
            rows={10}
            variant="outlined"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReplyDialog}>Cancel</Button>
          <Button onClick={handleSubmitReply} variant="contained" color="primary">
            Send Reply
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notifications */}
      <Snackbar 
        open={!!errorMessage} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}; 