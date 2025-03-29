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
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
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
  AccountBalance as FinanceIcon,
  School as SchoolIcon,
  Psychology as PsychologyIcon,
  Group as GroupIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import { Navbar } from '@/components/Navigation/Navbar';
import { useEmailContext } from '@/contexts/EmailContext';
import WelcomeMessage from '@/components/Welcome/WelcomeMessage';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { DailyBrief } from '@/components/Dashboard/DailyBrief';
import { WeatherWidget } from '@/components/Weather/WeatherWidget';
import { OnboardingTutorial } from '@/components/Onboarding/OnboardingTutorial';
import SpeakToMe from '@/components/Conversation/SpeakToMe';
import QuickCalendar from '@/components/Dashboard/Calendar/QuickCalendar';
import { calendarService, CalendarEvent } from '@/services/calendarService';
import { TaskManager } from '@/components/Dashboard/TaskManager';

// Support dialog component
const SupportDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onOpenSpeakToMe: () => void;
}> = ({ open, onClose, onOpenSpeakToMe }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [breatheMode, setBreatheMode] = useState(false);
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
    if (breatheMode && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (breatheMode && countdown === 0) {
      setBreatheMode(false);
      setCountdown(5);
    }
  }, [breatheMode, countdown]);
  
  const startBreathingExercise = () => {
    setBreatheMode(true);
    setCountdown(5);
  };
  
  const BreatheAnimation = () => (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: 300,
        width: '100%',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          width: 200,
          height: 200,
          borderRadius: '50%',
          backgroundColor: 'rgba(100, 200, 255, 0.2)',
          animation: 'breathe 8s infinite ease-in-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px rgba(100, 200, 255, 0.5)',
          '@keyframes breathe': {
            '0%, 100%': {
              transform: 'scale(0.8)',
              backgroundColor: 'rgba(100, 200, 255, 0.2)',
            },
            '50%': {
              transform: 'scale(1.2)',
              backgroundColor: 'rgba(100, 200, 255, 0.5)',
            },
          },
        }}
      >
        <Typography variant="h6" sx={{ color: isDarkMode ? '#fff' : '#333' }}>
          {countdown > 0 ? `${countdown}` : 'Breathe In... Out...'}
        </Typography>
      </Box>
      <Typography 
        variant="body1" 
        sx={{ 
          position: 'absolute', 
          bottom: 20,
          color: isDarkMode ? '#fff' : '#333'
        }}
      >
        Focus on your breathing for a moment
      </Typography>
    </Box>
  );
  
  if (breatheMode) {
    return (
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(245, 245, 245, 0.95)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            borderRadius: 3,
          }
        }}
      >
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
            <IconButton onClick={() => setBreatheMode(false)}>
              <MicIcon />
            </IconButton>
          </Box>
          <BreatheAnimation />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(245, 245, 245, 0.95)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          borderRadius: 3,
        }
      }}
    >
      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
          <IconButton onClick={onClose}>
            <MicIcon />
          </IconButton>
        </Box>
        
        <Typography variant="h4" gutterBottom sx={{ color: isDarkMode ? '#fff' : 'inherit' }}>
          What do you need right now?
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4, color: isDarkMode ? '#ccc' : 'inherit' }}>
          It's okay to need support. Choose the option that feels right for you in this moment.
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                p: 3, 
                height: '100%', 
                bgcolor: isDarkMode ? 'rgba(40, 80, 120, 0.7)' : 'rgba(200, 230, 255, 0.7)',
                borderRadius: 2,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                }
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      bgcolor: isDarkMode ? 'rgba(100, 200, 255, 0.2)' : '#b3e0ff', 
                      borderRadius: '50%', 
                      width: 50, 
                      height: 50,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}
                  >
                    <MicIcon sx={{ color: isDarkMode ? '#80ccff' : '#0066cc' }} />
                  </Box>
                  <Typography variant="h5" sx={{ color: isDarkMode ? '#fff' : 'inherit' }}>
                    Talk to AI
                  </Typography>
                </Box>
                
                <Typography 
                  component="div" 
                  sx={{ 
                    mb: 3, 
                    flexGrow: 1, 
                    color: isDarkMode ? '#ddd' : 'inherit'
                  }}
                >
                  Have a private conversation with AI to process your thoughts and get immediate support without judgment.
                </Typography>
                
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => {
                    onClose();
                    // Open SpeakToMe dialog
                    setTimeout(() => onOpenSpeakToMe(), 100);
                  }}
                  sx={{ 
                    mt: 'auto', 
                    bgcolor: isDarkMode ? 'rgba(100, 200, 255, 0.3)' : '#b3e0ff', 
                    color: isDarkMode ? '#fff' : '#0066cc',
                    '&:hover': {
                      bgcolor: isDarkMode ? 'rgba(100, 200, 255, 0.5)' : '#80ccff',
                    } 
                  }}
                >
                  Start Conversation
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                p: 3, 
                height: '100%', 
                bgcolor: isDarkMode ? 'rgba(40, 120, 80, 0.7)' : 'rgba(200, 255, 200, 0.7)',
                borderRadius: 2,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                }
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      bgcolor: isDarkMode ? 'rgba(100, 255, 150, 0.2)' : '#b3ffb3', 
                      borderRadius: '50%', 
                      width: 50, 
                      height: 50,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}
                  >
                    <EmailIcon sx={{ color: isDarkMode ? '#80ff80' : '#008800' }} />
                  </Box>
                  <Typography variant="h5" sx={{ color: isDarkMode ? '#fff' : 'inherit' }}>
                    Pause Notifications
                  </Typography>
                </Box>
                
                <Typography 
                  component="div" 
                  sx={{ 
                    mb: 3, 
                    flexGrow: 1,
                    color: isDarkMode ? '#ddd' : 'inherit'
                  }}
                >
                  Take a break from all notifications for a set period of time. We'll handle auto-replies and collect messages.
                </Typography>
                
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={startBreathingExercise}
                  sx={{ 
                    mt: 'auto', 
                    bgcolor: isDarkMode ? 'rgba(100, 255, 150, 0.3)' : '#b3ffb3', 
                    color: isDarkMode ? '#fff' : '#008800',
                    '&:hover': {
                      bgcolor: isDarkMode ? 'rgba(100, 255, 150, 0.5)' : '#80ff80',
                    } 
                  }}
                >
                  Pause for 30 Minutes
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                p: 3, 
                height: '100%', 
                bgcolor: isDarkMode ? 'rgba(120, 40, 80, 0.7)' : 'rgba(255, 200, 200, 0.7)',
                borderRadius: 2,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                }
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      bgcolor: isDarkMode ? 'rgba(255, 150, 150, 0.2)' : '#ffb3b3', 
                      borderRadius: '50%', 
                      width: 50, 
                      height: 50,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}
                  >
                    <WellbeingIcon sx={{ color: isDarkMode ? '#ff8080' : '#cc0000' }} />
                  </Box>
                  <Typography variant="h5" sx={{ color: isDarkMode ? '#fff' : 'inherit' }}>
                    Guided Breathing
                  </Typography>
                </Box>
                
                <Typography 
                  component="div" 
                  sx={{ 
                    mb: 3, 
                    flexGrow: 1,
                    color: isDarkMode ? '#ddd' : 'inherit'
                  }}
                >
                  Take a moment to breathe and recenter with our guided breathing exercise. Just 2 minutes can help reduce stress.
                </Typography>
                
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={startBreathingExercise}
                  sx={{ 
                    mt: 'auto', 
                    bgcolor: isDarkMode ? 'rgba(255, 150, 150, 0.3)' : '#ffb3b3', 
                    color: isDarkMode ? '#fff' : '#cc0000',
                    '&:hover': {
                      bgcolor: isDarkMode ? 'rgba(255, 150, 150, 0.5)' : '#ff8080',
                    } 
                  }}
                >
                  Start Breathing Exercise
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
  const { emails, loading, error: emailError, refreshEmails, getStressReport, stressReport, stressReportLoading } = useEmailContext();
  
  const [date, setDate] = useState(new Date());
  const [showTour, setShowTour] = useState(false);
  const [isNewUser, setIsNewUser] = useState<boolean>(() => {
    return localStorage.getItem('onboardingComplete') !== 'true';
  });
  const [showSpeakToMe, setShowSpeakToMe] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(true);
  
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

  // Check if user is new and show onboarding
  useEffect(() => {
    if (isNewUser) {
      // Show onboarding for new users
      setShowTour(true);
    }
  }, [isNewUser]);

  useEffect(() => {
    // Fetch stress report on component mount
    getStressReport();
  }, [getStressReport]);

  // Fetch calendar events
  useEffect(() => {
    const fetchCalendarEvents = async () => {
      setCalendarLoading(true);
      try {
        const events = await calendarService.getTodayEvents();
        setCalendarEvents(events);
      } catch (err) {
        console.error('Error fetching calendar events:', err);
      } finally {
        setCalendarLoading(false);
      }
    };
    
    fetchCalendarEvents();
  }, []);

  // Handle opening support dialog
  const handleOpenSupportDialog = () => {
    setSupportDialogOpen(true);
  };
  
  // Handle closing support dialog
  const handleCloseSupportDialog = () => {
    setSupportDialogOpen(false);
  };

  // Handle opening SpeakToMe dialog
  const handleOpenSpeakToMe = () => {
    setShowSpeakToMe(true);
  };
  
  // Handle closing SpeakToMe dialog
  const handleCloseSpeakToMe = () => {
    setShowSpeakToMe(false);
  };

  // Handle navigation to app dashboards
  const handleNavigate = (path: string) => {
    navigate(path);
  };
  
  // Handle tour start
  const handleStartTour = () => {
    setShowTour(true);
  };
  
  // Handle tour completion
  const handleTourComplete = () => {
    setShowTour(false);
    // Mark onboarding as complete
    localStorage.setItem('onboardingComplete', 'true');
    setIsNewUser(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#222', position: 'relative' }}>
      <Navbar />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome message */}
        {showWelcome && (
          <WelcomeMessage 
            onStartTour={handleStartTour} 
            onDismiss={() => setShowWelcome(false)} 
          />
        )}
        
        {/* Onboarding Tour */}
        <OnboardingTutorial
          open={showTour}
          onComplete={handleTourComplete}
          onClose={handleTourComplete}
        />
        
        {/* Error display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {/* Weather widget */}
        <WeatherWidget />
        
        {/* Daily Brief Section */}
        <Box mb={4}>
          <DailyBrief />
        </Box>
        
        {/* Calendar and Tasks Section */}
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2, 
            color: '#3b82f6',
            fontWeight: 'bold'
          }}
        >
          Calendars & Tasks
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Calendar Section */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: 2, 
              bgcolor: '#333',
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="h2" sx={{ color: '#fff', display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{ 
                    display: 'inline-flex', 
                    mr: 1,
                    color: '#3b82f6'
                  }}>
                    {/* Calendar icon would go here */}
                  </Box>
                  Calendar
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/calendar')}
                  variant="outlined"
                  sx={{ 
                    color: '#3b82f6', 
                    borderColor: '#3b82f6',
                    '&:hover': {
                      borderColor: '#60a5fa',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)'
                    }
                  }}
                >
                  View All
                </Button>
              </Box>
              {calendarLoading ? (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: 200
                  }}
                >
                  <CircularProgress sx={{ color: '#3b82f6' }} />
                </Box>
              ) : (
                <Box sx={{ 
                  flexGrow: 1, 
                  overflow: 'auto',
                  maxHeight: '400px'
                }}>
                  <QuickCalendar events={calendarEvents} />
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Tasks Section */}
          <Grid item xs={12} md={6}>
            <TaskManager maxTasks={5} />
          </Grid>
        </Grid>
        
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
          {/* Email Card */}
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
          
          {/* Chat Card */}
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
          
          {/* Calls Card */}
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
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Stress Monitor Card */}
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
                <Box 
                  sx={{ 
                    backgroundColor: stressReportLoading ? '#555' : 
                      (!stressReport || typeof stressReport.overall_score !== 'number' ? '#555' : 
                        (stressReport.overall_score > 0.6 ? '#ef4444' : 
                          (stressReport.overall_score > 0.3 ? '#fb923c' : '#10b981'))),
                    color: '#fff',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 16,
                    fontSize: '0.85rem',
                    fontWeight: 'medium',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {stressReportLoading ? 'Loading...' : 
                    (!stressReport || typeof stressReport.overall_score !== 'number' ? 'Unknown' : 
                      (stressReport.overall_score > 0.6 ? 'High' : 
                        (stressReport.overall_score > 0.3 ? 'Medium' : 'Low')))}
                </Box>
              </Box>
              <Box sx={{ px: 2, pb: 2 }}>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Track and manage communication stress
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          {/* Wellness Card */}
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
          
          {/* Physical Card */}
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

        {/* Learn About Yourself Section */}
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2, 
            color: '#8b5cf6',
            fontWeight: 'bold'
          }}
        >
          Learn About Yourself
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Personal Education Card */}
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
              onClick={() => navigate('/learning-dashboard')}
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
                  <SchoolIcon sx={{ mr: 1, color: '#8b5cf6' }} />
                  <Typography variant="h6" sx={{ color: '#fff' }}>Personal Education</Typography>
                </Box>
                <IconButton sx={{ color: '#ccc' }}>
                  <MoreIcon />
                </IconButton>
              </Box>
              <Box sx={{ px: 2, pb: 2 }}>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Bespoke education about your thinking style (Coming soon)
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          {/* Diagnosis Card */}
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
              onClick={() => navigate('/diagnosis-dashboard')}
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
                  <PsychologyIcon sx={{ mr: 1, color: '#8b5cf6' }} />
                  <Typography variant="h6" sx={{ color: '#fff' }}>Insights</Typography>
                </Box>
                <IconButton sx={{ color: '#ccc' }}>
                  <MoreIcon />
                </IconButton>
              </Box>
              <Box sx={{ px: 2, pb: 2 }}>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Build a picture of your thinking and learning style (Coming soon)
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Community & Marketplace Section */}
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2, 
            color: '#f59e0b',
            fontWeight: 'bold'
          }}
        >
          Community & Marketplace
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Community Card */}
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
              onClick={() => navigate('/community-dashboard')}
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
                  <GroupIcon sx={{ mr: 1, color: '#f59e0b' }} />
                  <Typography variant="h6" sx={{ color: '#fff' }}>Community</Typography>
                </Box>
                <IconButton sx={{ color: '#ccc' }}>
                  <MoreIcon />
                </IconButton>
              </Box>
              <Box sx={{ px: 2, pb: 2 }}>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Time-limited social media to share experiences (Coming soon)
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          {/* Marketplace Card */}
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
              onClick={() => navigate('/marketplace-dashboard')}
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
                  <StoreIcon sx={{ mr: 1, color: '#f59e0b' }} />
                  <Typography variant="h6" sx={{ color: '#fff' }}>Marketplace</Typography>
                </Box>
                <IconButton sx={{ color: '#ccc' }}>
                  <MoreIcon />
                </IconButton>
              </Box>
              <Box sx={{ px: 2, pb: 2 }}>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Curated goods and services with special deals (Coming soon)
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
        startIcon={<PauseCircleOutlineIcon sx={{ fontSize: 24 }} />}
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24, 
          borderRadius: 28, 
          px: 3,
          py: 1.5,
          bgcolor: theme.palette.mode === 'dark' ? '#d946ef' : '#7c3aed', // Purple in dark/light modes
          color: '#ffffff',
          fontWeight: 600,
          letterSpacing: '0.5px',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? '#c026d3' : '#6d28d9',
            transform: 'scale(1.05)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.4)'
          },
          '&:active': {
            transform: 'scale(0.98)'
          },
          transition: 'all 0.2s ease-in-out',
          zIndex: 1000,
          boxShadow: '0 6px 16px rgba(0,0,0,0.35), 0 0 0 3px rgba(124, 58, 237, 0.2)'
        }}
      >
        Stop the World
      </Button>
      
      {/* Speak to Me Button - positioned at bottom right next to Stop the World */}
      <Button 
        variant="contained" 
        onClick={handleOpenSpeakToMe}
        startIcon={<MicIcon sx={{ fontSize: 24 }} />}
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 220, // Position it to the left of Stop the World button
          borderRadius: 28, 
          px: 3,
          py: 1.5,
          bgcolor: theme.palette.mode === 'dark' ? '#2563eb' : '#3b82f6', // Blue in dark/light modes
          color: '#ffffff',
          fontWeight: 600,
          letterSpacing: '0.5px',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? '#1d4ed8' : '#2563eb',
            transform: 'scale(1.05)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.4)'
          },
          '&:active': {
            transform: 'scale(0.98)'
          },
          transition: 'all 0.2s ease-in-out',
          zIndex: 1000,
          boxShadow: '0 6px 16px rgba(0,0,0,0.35), 0 0 0 3px rgba(59, 130, 246, 0.2)'
        }}
      >
        Speak to Me
      </Button>
      
      {/* Support Dialog */}
      <SupportDialog 
        open={supportDialogOpen}
        onClose={handleCloseSupportDialog}
        onOpenSpeakToMe={handleOpenSpeakToMe}
      />

      {/* SpeakToMe Component */}
      <SpeakToMe
        open={showSpeakToMe}
        onClose={handleCloseSpeakToMe}
      />
    </Box>
  );
};

export default Dashboard;