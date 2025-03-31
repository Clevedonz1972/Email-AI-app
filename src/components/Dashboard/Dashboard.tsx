import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
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
  useTheme,
} from '@mui/material';
import { 
  Circle as CircleIcon,
  NotificationsActive as NotificationsIcon,
  LocationOn as LocationIcon,
  WbSunny as SunnyIcon,
  Cloud as CloudIcon,
  Email as EmailIcon,
  Chat as ChatIcon,
  Phone as PhoneIcon,
  Spa as WellbeingIcon,
  FitnessCenter as FitnessIcon,
  Warning as WarningIcon,
  Mic as MicIcon,
  MoreVert as MoreIcon,
  Favorite as HeartIcon,
  Monitor as MonitorIcon,
  PauseCircleOutline as PauseCircleOutlineIcon
} from '@mui/icons-material';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useEmailContext } from '../../contexts/EmailContext';
import { useDashboardContext } from '@/contexts/DashboardContext';
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

// Support dialog component
const SupportDialog: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogContent sx={{ p: 4, background: 'rgba(245, 245, 245, 0.9)' }}>
        <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
          <IconButton onClick={onClose}>
            <MicIcon />
          </IconButton>
        </Box>
        
        <Typography variant="h4" gutterBottom>
          What do you need right now?
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4 }}>
          It's okay to need support. Choose the option that feels right for you in this moment.
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', bgcolor: 'rgba(200, 230, 255, 0.7)' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      bgcolor: '#b3e0ff', 
                      borderRadius: '50%', 
                      width: 50, 
                      height: 50,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}
                  >
                    <MicIcon sx={{ color: '#0066cc' }} />
                  </Box>
                  <Typography variant="h5">
                    Talk to Me
                  </Typography>
                </Box>
                
                <Typography sx={{ mb: 3, flexGrow: 1 }}>
                  Have a private conversation with AI to process your thoughts and get immediate support without judgment.
                </Typography>
                
                <Button 
                  variant="contained" 
                  fullWidth
                  sx={{ 
                    mt: 'auto', 
                    bgcolor: '#b3e0ff', 
                    color: '#0066cc',
                    '&:hover': {
                      bgcolor: '#80ccff',
                    } 
                  }}
                >
                  Start Conversation
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', bgcolor: 'rgba(200, 255, 200, 0.7)' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      bgcolor: '#b3ffb3', 
                      borderRadius: '50%', 
                      width: 50, 
                      height: 50,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}
                  >
                    <EmailIcon sx={{ color: '#008800' }} />
                  </Box>
                  <Typography variant="h5">
                    Reach Out
                  </Typography>
                </Box>
                
                <Typography sx={{ mb: 3, flexGrow: 1 }}>
                  Connect with someone in your support network. We'll help craft the message so you don't have to find the words.
                </Typography>
                
                <Button 
                  variant="contained" 
                  fullWidth
                  sx={{ 
                    mt: 'auto', 
                    bgcolor: '#b3ffb3', 
                    color: '#008800',
                    '&:hover': {
                      bgcolor: '#80ff80',
                    } 
                  }}
                >
                  Get Help Template
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', bgcolor: 'rgba(255, 200, 200, 0.7)' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      bgcolor: '#ffb3b3', 
                      borderRadius: '50%', 
                      width: 50, 
                      height: 50,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}
                  >
                    <WarningIcon sx={{ color: '#cc0000' }} />
                  </Box>
                  <Typography variant="h5">
                    I Need Space
                  </Typography>
                </Box>
                
                <Typography sx={{ mb: 3, flexGrow: 1 }}>
                  Activate "do not disturb" mode, send automated responses, and get guided through a calming break.
                </Typography>
                
                <Button 
                  variant="contained" 
                  fullWidth
                  sx={{ 
                    mt: 'auto', 
                    bgcolor: '#ffb3b3', 
                    color: '#cc0000',
                    '&:hover': {
                      bgcolor: '#ff8080',
                    } 
                  }}
                >
                  Activate Break Mode
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export const Dashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { preferences } = useAccessibility();
  const { openSpeakToMe } = useDashboardContext();
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
  
  const [date, setDate] = useState(new Date());
  
  // Set current date
  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date());
    }, 60000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);
  
  // Format date as "Thursday, March 6, 2025"
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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
  
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);
  
  // Handle opening support dialog
  const handleOpenSupportDialog = () => {
    setSupportDialogOpen(true);
  };
  
  // Handle closing support dialog
  const handleCloseSupportDialog = () => {
    setSupportDialogOpen(false);
  };
  
  // Handle ActionButtons Ask ASTI
  const handleAskASTI = (type: 'email' | 'calendar' | 'task' | 'wellbeing') => {
    console.log(`Asking ASTI about ${type}`);
    openSpeakToMe();
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f5f5', position: 'relative' }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Weather and Location Bar */}
        <Paper 
          sx={{ 
            p: 1, 
            mb: 3, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationIcon sx={{ mr: 0.5 }} />
            <Typography variant="body1" sx={{ mr: 2 }}>London, UK</Typography>
            <CloudIcon sx={{ mr: 0.5, color: '#888' }} />
            <Typography variant="body1">15°C Cloudy</Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="textSecondary">
              A bit cool today. Maybe bring a light jacket! 🧥
            </Typography>
          </Box>
          
          <Typography variant="body2" color="textSecondary">
            {formattedDate}
          </Typography>
        </Paper>
        
        {/* Daily Brief Section */}
        <Box mb={4}>
          <DailyBrief />
        </Box>
        
        {/* Action Buttons - Just keep the SPEAK TO ME button */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2, 
            mb: 4
          }}
        >
          <Button 
            variant="contained" 
            color="secondary"
            startIcon={<MicIcon />}
            sx={{ borderRadius: 28, px: 3 }}
          >
            SPEAK TO ME
          </Button>
        </Box>
        
        {/* Communications Section */}
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2, 
            color: theme.palette.primary.main,
            fontWeight: 'bold'
          }}
        >
          Communications
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ height: '100%' }}>
              <Box 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6">Email</Typography>
                </Box>
                <IconButton>
                  <MoreIcon />
                </IconButton>
              </Box>
              <Box sx={{ px: 2, pb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  AI-powered email management and stress reduction
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ height: '100%' }}>
              <Box 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ChatIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6">Chat</Typography>
                </Box>
                <IconButton>
                  <MoreIcon />
                </IconButton>
              </Box>
              <Box sx={{ px: 2, pb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  WhatsApp & text messages (Coming soon)
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ height: '100%' }}>
              <Box 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6">Calls</Typography>
                </Box>
                <IconButton>
                  <MoreIcon />
                </IconButton>
              </Box>
              <Box sx={{ px: 2, pb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Phone call assistance (Coming soon)
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Health & Wellbeing Section */}
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2, 
            color: theme.palette.error.main,
            fontWeight: 'bold'
          }}
        >
          Health & Wellbeing
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ height: '100%' }}>
              <Box 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MonitorIcon sx={{ mr: 1, color: theme.palette.error.main }} />
                  <Typography variant="h6">Stress Monitor</Typography>
                </Box>
                <IconButton>
                  <MoreIcon />
                </IconButton>
              </Box>
              <Box sx={{ px: 2, pb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Track and manage communication stress (Coming soon)
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ height: '100%' }}>
              <Box 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WellbeingIcon sx={{ mr: 1, color: 'green' }} />
                  <Typography variant="h6">Wellness</Typography>
                </Box>
                <IconButton>
                  <MoreIcon />
                </IconButton>
              </Box>
              <Box sx={{ px: 2, pb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Personalized wellness recommendations (Coming soon)
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ height: '100%' }}>
              <Box 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FitnessIcon sx={{ mr: 1, color: theme.palette.error.main }} />
                  <Typography variant="h6">Physical</Typography>
                </Box>
                <IconButton>
                  <MoreIcon />
                </IconButton>
              </Box>
              <Box sx={{ px: 2, pb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Activity tracking and recommendations (Coming soon)
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      
      {/* Stop the World Button - positioned at bottom right */}
      <Button 
        variant="contained" 
        color="primary"
        onClick={handleOpenSupportDialog}
        startIcon={<PauseCircleOutlineIcon />}
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24, 
          borderRadius: 28, 
          px: 3,
          py: 1.5,
          backgroundColor: '#6366f1',
          '&:hover': {
            backgroundColor: '#4f46e5',
          },
          zIndex: 1000
        }}
      >
        Stop the World
      </Button>
      
      {/* Support Dialog */}
      <SupportDialog 
        open={supportDialogOpen}
        onClose={handleCloseSupportDialog}
      />
    </Box>
  );
}; 