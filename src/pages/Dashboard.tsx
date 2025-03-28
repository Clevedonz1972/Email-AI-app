import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Container,
  Button,
  IconButton,
  Alert,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogContent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  LocationOn as LocationIcon,
  Cloud as CloudIcon,
  Email as EmailIcon,
  Chat as ChatIcon,
  Phone as PhoneIcon,
  Spa as WellbeingIcon,
  FitnessCenter as FitnessIcon,
  Warning as WarningIcon,
  Mic as MicIcon,
  MoreVert as MoreIcon,
  Monitor as MonitorIcon,
  PauseCircleOutline as PauseCircleOutlineIcon,
  AccountBalance as FinanceIcon
} from '@mui/icons-material';
import { Navbar } from '@/components/Navigation/Navbar';
import { useEmailContext } from '@/contexts/EmailContext';
import WelcomeMessage from '@/components/Welcome/WelcomeMessage';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { DailyBrief } from '@/components/Dashboard/DailyBrief';

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
                
                <Typography component="div" sx={{ mb: 3, flexGrow: 1 }}>
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
                
                <Typography component="div" sx={{ mb: 3, flexGrow: 1 }}>
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
                
                <Typography component="div" sx={{ mb: 3, flexGrow: 1 }}>
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

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useLocalStorage('showWelcomeMessage', true);
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { emails, loading, error: emailError, refreshEmails } = useEmailContext();
  
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

  // Handle errors from context
  useEffect(() => {
    if (emailError) {
      setError(emailError);
    }
  }, [emailError]);

  // Refresh emails when component mounts
  useEffect(() => {
    refreshEmails();
  }, [refreshEmails]);

  // Handle opening support dialog
  const handleOpenSupportDialog = () => {
    setSupportDialogOpen(true);
  };
  
  // Handle closing support dialog
  const handleCloseSupportDialog = () => {
    setSupportDialogOpen(false);
  };

  // Handle navigation to app dashboards
  const handleNavigate = (path: string) => {
    navigate(path);
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#222', position: 'relative' }}>
      <Navbar />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome message */}
        {showWelcome && (
          <WelcomeMessage 
            onStartTour={() => {}} 
            onDismiss={() => setShowWelcome(false)} 
          />
        )}
        
        {/* Error display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {/* Weather and Location Bar */}
        <Paper 
          sx={{ 
            p: 1, 
            mb: 3, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            bgcolor: '#333',
            color: '#fff'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationIcon sx={{ mr: 0.5, color: '#fff' }} />
            <Typography variant="body1" sx={{ mr: 2, color: '#fff' }}>London, UK</Typography>
            <CloudIcon sx={{ mr: 0.5, color: '#ccc' }} />
            <Typography variant="body1" sx={{ color: '#fff' }}>15°C Cloudy</Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" sx={{ color: '#ccc' }}>
              A bit cool today. Maybe bring a light jacket! 🧥
            </Typography>
          </Box>
          
          <Typography variant="body2" sx={{ color: '#ccc' }}>
            {formattedDate}
          </Typography>
        </Paper>
        
        {/* Daily Brief Section */}
        <Box mb={4}>
          <DailyBrief 
            unreadCount={emails.filter(e => !e.is_read).length}
            eventsCount={3}
            tasksCount={5}
            stressLevel="LOW"
          />
        </Box>
        
        {/* Action Buttons - Only SPEAK TO ME button */}
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
            color: '#6366f1',
            fontWeight: 'bold'
          }}
        >
          Communications
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                height: '100%', 
                bgcolor: '#333', 
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: '#444',
                  transform: 'translateY(-2px)'
                }
              }}
              onClick={() => navigate('/email-dashboard')}
            >
              <Box 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon sx={{ mr: 1, color: '#6366f1' }} />
                  <Typography variant="h6" sx={{ color: '#fff' }}>Email</Typography>
                </Box>
                <IconButton sx={{ color: '#ccc' }}>
                  <MoreIcon />
                </IconButton>
              </Box>
              <Box sx={{ px: 2, pb: 2 }}>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  AI-powered email management and stress reduction
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                height: '100%', 
                bgcolor: '#333',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: '#444',
                  transform: 'translateY(-2px)'
                }
              }}
              onClick={() => navigate('/chat-dashboard')}
            >
              <Box 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ChatIcon sx={{ mr: 1, color: '#6366f1' }} />
                  <Typography variant="h6" sx={{ color: '#fff' }}>Chat</Typography>
                </Box>
                <IconButton sx={{ color: '#ccc' }}>
                  <MoreIcon />
                </IconButton>
              </Box>
              <Box sx={{ px: 2, pb: 2 }}>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  WhatsApp & text messages (Coming soon)
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                height: '100%', 
                bgcolor: '#333',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: '#444',
                  transform: 'translateY(-2px)'
                }
              }}
              onClick={() => navigate('/calls-dashboard')}
            >
              <Box 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon sx={{ mr: 1, color: '#6366f1' }} />
                  <Typography variant="h6" sx={{ color: '#fff' }}>Calls</Typography>
                </Box>
                <IconButton sx={{ color: '#ccc' }}>
                  <MoreIcon />
                </IconButton>
              </Box>
              <Box sx={{ px: 2, pb: 2 }}>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Phone call assistance (Coming soon)
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Financial Section */}
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2, 
            color: '#10b981',
            fontWeight: 'bold'
          }}
        >
          Financial
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                height: '100%', 
                bgcolor: '#333',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: '#444',
                  transform: 'translateY(-2px)'
                }
              }}
              onClick={() => navigate('/finance-dashboard')}
            >
              <Box 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FinanceIcon sx={{ mr: 1, color: '#10b981' }} />
                  <Typography variant="h6" sx={{ color: '#fff' }}>Finance</Typography>
                </Box>
                <IconButton sx={{ color: '#ccc' }}>
                  <MoreIcon />
                </IconButton>
              </Box>
              <Box sx={{ px: 2, pb: 2 }}>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Financial planning and budgeting assistance (Coming soon)
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
            color: '#ef4444',
            fontWeight: 'bold'
          }}
        >
          Health & Wellbeing
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                height: '100%', 
                bgcolor: '#333',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: '#444',
                  transform: 'translateY(-2px)'
                }
              }}
              onClick={() => navigate('/health-dashboard')}
            >
              <Box 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MonitorIcon sx={{ mr: 1, color: '#ef4444' }} />
                  <Typography variant="h6" sx={{ color: '#fff' }}>Stress Monitor</Typography>
                </Box>
                <IconButton sx={{ color: '#ccc' }}>
                  <MoreIcon />
                </IconButton>
              </Box>
              <Box sx={{ px: 2, pb: 2 }}>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Track and manage communication stress (Coming soon)
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                height: '100%', 
                bgcolor: '#333',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: '#444',
                  transform: 'translateY(-2px)'
                }
              }}
              onClick={() => navigate('/health-dashboard')}
            >
              <Box 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WellbeingIcon sx={{ mr: 1, color: '#10b981' }} />
                  <Typography variant="h6" sx={{ color: '#fff' }}>Wellness</Typography>
                </Box>
                <IconButton sx={{ color: '#ccc' }}>
                  <MoreIcon />
                </IconButton>
              </Box>
              <Box sx={{ px: 2, pb: 2 }}>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Personalized wellness recommendations (Coming soon)
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                height: '100%', 
                bgcolor: '#333',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: '#444',
                  transform: 'translateY(-2px)'
                }
              }}
              onClick={() => navigate('/health-dashboard')}
            >
              <Box 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FitnessIcon sx={{ mr: 1, color: '#ef4444' }} />
                  <Typography variant="h6" sx={{ color: '#fff' }}>Physical</Typography>
                </Box>
                <IconButton sx={{ color: '#ccc' }}>
                  <MoreIcon />
                </IconButton>
              </Box>
              <Box sx={{ px: 2, pb: 2 }}>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
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
        onClick={handleOpenSupportDialog}
        startIcon={<PauseCircleOutlineIcon />}
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24, 
          borderRadius: 28, 
          px: 3,
          py: 1.5,
          bgcolor: '#6366f1',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#4f46e5',
          },
          zIndex: 1000,
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
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

export default Dashboard;