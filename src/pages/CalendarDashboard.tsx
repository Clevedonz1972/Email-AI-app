import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
  Breadcrumbs,
  Link,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Event as EventIcon,
  Add as AddIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navigation/Navbar';
import { WeatherWidget } from '@/components/Weather/WeatherWidget';
import QuickCalendar from '@/components/Dashboard/Calendar/QuickCalendar';
import { calendarService, CalendarEvent } from '@/services/calendarService';

const CalendarDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch calendar events when component mounts
  useEffect(() => {
    fetchEvents();
  }, []);
  
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const todayEvents = await calendarService.getTodayEvents();
      setEvents(todayEvents);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      setError('Unable to load calendar events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = () => {
    fetchEvents();
  };
  
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };
  
  const handleAddEvent = () => {
    // This would typically open a modal or navigate to a form
    console.log('Add event clicked');
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#222' }}>
      <Navbar />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ color: '#fff' }}>
            <Link
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#ccc' }}
              onClick={handleBackToDashboard}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
              Dashboard
            </Link>
            <Typography
              sx={{ display: 'flex', alignItems: 'center', color: '#fff' }}
              color="text.primary"
            >
              <EventIcon sx={{ mr: 0.5 }} fontSize="small" />
              Calendar
            </Typography>
          </Breadcrumbs>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToDashboard}
            sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
          >
            Back to Dashboard
          </Button>
        </Box>
        
        {/* Weather Widget - Compact version */}
        <WeatherWidget compact={true} />
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3 
        }}>
          <Typography variant="h4" sx={{ color: '#fff' }}>
            Calendar Dashboard
          </Typography>
          
          <Box>
            <Tooltip title="Refresh Events">
              <IconButton 
                onClick={handleRefresh} 
                sx={{ mr: 1, color: '#fff' }}
                disabled={loading}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddEvent}
              sx={{ 
                bgcolor: '#3b82f6',
                '&:hover': {
                  bgcolor: '#2563eb'
                }
              }}
            >
              Add Event
            </Button>
          </Box>
        </Box>
        
        {error && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#ef5350' }}>
            <Typography>{error}</Typography>
          </Paper>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper 
              sx={{ 
                p: 2, 
                position: 'relative', 
                bgcolor: '#333',
                color: '#fff',
                height: '100%',
                borderRadius: 2
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2 
              }}>
                <Typography variant="h5">
                  <TodayIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Today's Schedule
                </Typography>
                
                <IconButton sx={{ color: '#ccc' }}>
                  <FilterListIcon />
                </IconButton>
              </Box>
              
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                  <CircularProgress sx={{ color: '#3b82f6' }} />
                </Box>
              ) : events.length === 0 ? (
                <Box sx={{ py: 5, textAlign: 'center' }}>
                  <Typography variant="body1" sx={{ color: '#ccc', mb: 2 }}>
                    No events scheduled for today.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<AddIcon />}
                    onClick={handleAddEvent}
                    sx={{ 
                      color: '#3b82f6', 
                      borderColor: '#3b82f6',
                      '&:hover': {
                        borderColor: '#2563eb',
                        bgcolor: 'rgba(59, 130, 246, 0.1)'
                      }
                    }}
                  >
                    Add Your First Event
                  </Button>
                </Box>
              ) : (
                <Box>
                  <QuickCalendar events={events} />
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                p: 2, 
                bgcolor: '#333',
                color: '#fff',
                height: '100%',
                borderRadius: 2
              }}
            >
              <Typography variant="h5" sx={{ mb: 2 }}>
                <DateRangeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Upcoming
              </Typography>
              
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                  <CircularProgress sx={{ color: '#3b82f6' }} />
                </Box>
              ) : (
                <Box>
                  <Typography variant="body2" sx={{ color: '#ccc', mb: 2 }}>
                    Here you'll see upcoming events for the next 7 days.
                  </Typography>
                  
                  <Button 
                    variant="text" 
                    fullWidth
                    sx={{ 
                      color: '#3b82f6', 
                      justifyContent: 'flex-start',
                      py: 1.5,
                      '&:hover': {
                        bgcolor: 'rgba(59, 130, 246, 0.1)'
                      }
                    }}
                  >
                    View Full Calendar
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CalendarDashboard; 