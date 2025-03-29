import React from 'react';
import { Box, Typography, Paper, Divider, useTheme, Chip, Avatar } from '@mui/material';
import { 
  Event as EventIcon,
  AccessTime as TimeIcon,
  VideoCall as VideoIcon,
  People as PeopleIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { CalendarEvent } from '@/services/calendarService';

// Sample event data - would come from a real calendar API in production
const mockEvents = [
  {
    id: "1",
    title: "Team Weekly Sync",
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(11, 0, 0, 0)),
    type: "meeting",
    location: "Zoom",
    attendees: ["Alex", "Sarah", "Michael", "Jessica"]
  },
  {
    id: "2",
    title: "Project Review",
    start: new Date(new Date().setHours(14, 0, 0, 0)),
    end: new Date(new Date().setHours(15, 30, 0, 0)),
    type: "meeting",
    location: "Conference Room A",
    attendees: ["Alex", "David", "Lisa"]
  },
  {
    id: "3",
    title: "Lunch with David",
    start: new Date(new Date().setHours(12, 30, 0, 0)),
    end: new Date(new Date().setHours(13, 30, 0, 0)),
    type: "personal",
    location: "Bistro Cafe",
    attendees: ["David"]
  }
];

interface QuickCalendarProps {
  events?: CalendarEvent[];
}

export const QuickCalendar: React.FC<QuickCalendarProps> = ({ events = mockEvents }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
  
  // Format time as "10:00 AM"
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  // Check if event is happening now
  const isEventNow = (start: Date, end: Date) => {
    const now = new Date();
    return now >= start && now <= end;
  };
  
  // Get event badge color
  const getEventColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return isDarkMode ? '#3b82f6' : '#2563eb';
      case 'personal':
        return isDarkMode ? '#10b981' : '#059669';
      case 'deadline':
        return isDarkMode ? '#ef4444' : '#dc2626';
      default:
        return isDarkMode ? '#6366f1' : '#4f46e5';
    }
  };
  
  // Get event type icon
  const getEventIcon = (type: string, isNow: boolean) => {
    switch (type) {
      case 'meeting':
        return <VideoIcon fontSize="small" sx={{ color: isNow ? '#fff' : getEventColor(type) }} />;
      case 'personal':
        return <PeopleIcon fontSize="small" sx={{ color: isNow ? '#fff' : getEventColor(type) }} />;
      default:
        return <EventIcon fontSize="small" sx={{ color: isNow ? '#fff' : getEventColor(type) }} />;
    }
  };
  
  return (
    <Paper
      sx={{
        height: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: isDarkMode ? 'background.paper' : '#fff',
        boxShadow: theme.shadows[2],
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: theme.shadows[6],
        }
      }}
    >
      <Box
        sx={{
          p: 2,
          bgcolor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <EventIcon sx={{ mr: 1, color: isDarkMode ? '#3b82f6' : '#2563eb' }} />
        <Typography variant="h6" fontWeight="medium">Today's Calendar</Typography>
      </Box>
      
      <Box sx={{ p: 2 }}>
        {sortedEvents.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Your calendar is clear for today.
            </Typography>
          </Box>
        ) : (
          <Box>
            {sortedEvents.map((event, index) => {
              const isNow = isEventNow(event.start, event.end);
              
              return (
                <React.Fragment key={event.id}>
                  {index > 0 && <Divider sx={{ my: 2 }} />}
                  
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isNow 
                        ? (isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.1)')
                        : 'transparent',
                      border: isNow ? `1px solid ${getEventColor(event.type)}` : 'none',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip
                        icon={getEventIcon(event.type, isNow)}
                        label={isNow ? 'Now' : event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        size="small"
                        sx={{
                          mr: 1,
                          bgcolor: isNow ? getEventColor(event.type) : isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                          color: isNow ? '#fff' : 'inherit',
                          fontWeight: isNow ? 'bold' : 'normal',
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isNow ? 'bold' : 'normal',
                          color: 'text.secondary',
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '0.75rem',
                        }}
                      >
                        <TimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.875rem' }} />
                        {formatTime(event.start)} - {formatTime(event.end)}
                      </Typography>
                    </Box>
                    
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 1,
                        fontWeight: isNow ? 'bold' : 'medium',
                      }}
                    >
                      {event.title}
                    </Typography>
                    
                    {event.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary', fontSize: '0.875rem' }} />
                        <Typography variant="body2" color="text.secondary">
                          {event.location}
                        </Typography>
                      </Box>
                    )}
                    
                    {event.attendees && event.attendees.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {event.attendees.slice(0, 4).map((attendee, i) => (
                          <Avatar
                            key={i}
                            sx={{
                              width: 24,
                              height: 24,
                              fontSize: '0.75rem',
                              bgcolor: `hsl(${(i * 60) % 360}, 70%, ${isDarkMode ? '50%' : '40%'})`,
                            }}
                          >
                            {attendee.charAt(0)}
                          </Avatar>
                        ))}
                        {event.attendees.length > 4 && (
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              fontSize: '0.75rem',
                              bgcolor: isDarkMode ? 'grey.700' : 'grey.400',
                            }}
                          >
                            +{event.attendees.length - 4}
                          </Avatar>
                        )}
                      </Box>
                    )}
                  </Box>
                </React.Fragment>
              );
            })}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default QuickCalendar; 