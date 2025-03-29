import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Collapse, IconButton, useTheme, CircularProgress, Chip, Tooltip, Badge } from '@mui/material';
import { 
  Email as EmailIcon, 
  Event as EventIcon, 
  AssignmentTurnedIn as TaskIcon,
  Spa as WellbeingIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Launch as LaunchIcon,
  Snooze as SnoozeIcon,
  Reply as ReplyIcon,
  Report as ReportIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  PlaylistAddCheck as PriorityIcon,
  NotificationsOff as MuteIcon
} from '@mui/icons-material';
import { useEmailContext } from '@/contexts/EmailContext';
import { useNavigate } from 'react-router-dom';
import { EmailMessage, Priority } from '@/types/email';

export interface DailyBriefProps {
  unreadCount?: number;
  eventsCount?: number;
  tasksCount?: number;
  stressLevel?: string;
}

export const DailyBrief: React.FC<DailyBriefProps> = () => {
  const [expanded, setExpanded] = useState(true);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  
  // Get real email data from context
  const { 
    emails, 
    loading, 
    error, 
    emailStats, 
    refreshEmails, 
    stressReport, 
    stressReportLoading,
    getStressReport,
    markAllAsRead
  } = useEmailContext() ?? {
    emails: [],
    loading: false,
    error: null,
    emailStats: { unread: 0, high: 0 },
    refreshEmails: async () => {},
    stressReport: null,
    stressReportLoading: false,
    getStressReport: async () => {},
    markAllAsRead: async () => {}
  };

  // Fetch stress report on component mount
  useEffect(() => {
    getStressReport();
  }, [getStressReport]);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // Navigate to email dashboard
  const handleEmailAction = () => {
    navigate('/email-dashboard');
  };

  // Mark all emails as read
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  // Open calendar
  const handleCalendarAction = () => {
    navigate('/calendar');
  };

  // Snooze calendar events (placeholder)
  const handleSnoozeEvents = () => {
    console.log('Snoozing events');
    // This would call a calendar API to snooze notifications
  };

  // Handle task quick actions
  const handleTaskAction = () => {
    navigate('/email-dashboard?filter=action_required');
  };

  // Handle task completion (placeholder)
  const handleCompleteTask = () => {
    console.log('Completing first task');
    // This would call a task API to mark the task as complete
  };

  // Handle wellbeing actions
  const handleWellbeingAction = () => {
    navigate('/health-dashboard');
  };

  // Handle pause notifications (placeholder)
  const handlePauseNotifications = () => {
    console.log('Pausing notifications for 1 hour');
    // This would call a notification API
  };

  // Smart function to generate appropriate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour < 12) return "Good morning!";
    if (hour < 17) return "Good afternoon!";
    return "Good evening!";
  };

  // Generate calendar summary
  const getCalendarSummary = () => {
    // This would ideally come from a calendar service
    // For now we'll create a placeholder that feels dynamic
    
    const now = new Date();
    const hour = now.getHours();
    
    if (hour < 9) return "Your calendar is clear until your 9:30 AM team meeting.";
    if (hour < 12) return "You have a lunch meeting at 12:00 PM with the product team.";
    if (hour < 14) return "Your calendar is clear until 3 PM, when you have a team meeting.";
    if (hour < 16) return "You have one more meeting today at 4:30 PM.";
    return "You have no more meetings scheduled for today.";
  };

  // Generate task summary based on action required emails
  const getTaskSummary = () => {
    const actionRequiredEmails = emails.filter((email: EmailMessage) => email.action_required && !email.is_read);
    
    if (actionRequiredEmails.length === 0) {
      return "You have no pending tasks that need immediate attention. Great job staying on top of things!";
    }
    
    if (actionRequiredEmails.length === 1) {
      const sender = actionRequiredEmails[0].sender.name;
      return `Take some time to respond to ${sender}'s message about ${actionRequiredEmails[0].subject.toLowerCase()}.`;
    }
    
    return `You have ${actionRequiredEmails.length} emails that require your attention. The most urgent one is from ${actionRequiredEmails[0].sender.name}.`;
  };

  // Get task priority level
  const getTaskPriorityLevel = () => {
    const highPriorityEmails = emails.filter((e: EmailMessage) => e.priority === 'HIGH' && e.action_required && !e.is_read).length;
    const allActionRequired = emails.filter((e: EmailMessage) => e.action_required && !e.is_read).length;
    
    if (highPriorityEmails > 0) return 'high';
    if (allActionRequired > 2) return 'medium';
    if (allActionRequired > 0) return 'low';
    return 'none';
  };

  // Generate wellbeing message based on stress report
  const getWellbeingMessage = () => {
    if (!stressReport) return "Your wellbeing data is being analyzed.";
    
    const { overallStress } = stressReport;
    
    if (overallStress === 'LOW') {
      return "Your overall stress level today seems low. Keep it up!";
    } else if (overallStress === 'MEDIUM') {
      return "Your stress level is moderate today. Consider taking a short break between tasks.";
    } else {
      return "Your stress indicators are showing higher levels today. Remember to take breaks and practice your stress-reduction techniques.";
    }
  };

  // Get task priority color
  const getTaskPriorityColor = () => {
    const priority = getTaskPriorityLevel();
    switch (priority) {
      case 'high': return '#d32f2f';
      case 'medium': return '#f57c00';
      case 'low': return '#388e3c';
      default: return '#757575';
    }
  };

  return (
    <Paper 
      sx={{ 
        p: 2, 
        height: '100%', 
        borderLeft: `4px solid ${isDarkMode ? '#42a5f5' : '#1976d2'}`,
        borderRadius: '4px',
        bgcolor: isDarkMode ? 'background.paper' : '#ffffff',
        color: isDarkMode ? 'text.primary' : 'inherit',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: 3,
          borderLeftWidth: '6px'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontWeight: 'bold',
              color: isDarkMode ? 'text.primary' : 'inherit'
            }}
          >
            <WellbeingIcon 
              sx={{ 
                mr: 1, 
                color: isDarkMode ? '#42a5f5' : '#1976d2', 
                bgcolor: isDarkMode ? 'rgba(227, 242, 253, 0.2)' : '#e3f2fd', 
                borderRadius: '50%', 
                p: 0.5 
              }} 
            />
            Your Daily Brief
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Mute notifications for 1 hour">
            <IconButton 
              size="small" 
              onClick={handlePauseNotifications}
              sx={{ mr: 1 }}
            >
              <MuteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton onClick={handleExpandClick} color={isDarkMode ? 'default' : 'inherit'}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AccessTimeIcon sx={{ mr: 1, color: isDarkMode ? '#42a5f5' : '#1976d2' }} />
            <Typography variant="body1" color={isDarkMode ? 'text.primary' : 'inherit'}>
              {getGreeting()} Let's wrap up what's happening. Your wellbeing matters - prioritize what's important.
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={20} />
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1, bgcolor: isDarkMode ? 'rgba(33, 150, 243, 0.1)' : '#f5f9ff', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Badge 
                    badgeContent={emailStats.unread} 
                    color="primary" 
                    sx={{ mr: 1 }}
                  >
                    <EmailIcon sx={{ color: isDarkMode ? '#42a5f5' : '#1976d2' }} />
                  </Badge>
                  <Typography variant="body1" sx={{ flexGrow: 1 }} color={isDarkMode ? 'text.primary' : 'inherit'}>
                    You have {emailStats.unread} unread emails
                    {emailStats.high > 0 && `, including ${emailStats.high} marked as high priority`}.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Tooltip title="Mark all as read">
                    <Button 
                      variant="outlined" 
                      size="small"
                      sx={{ px: 1 }}
                      color={isDarkMode ? 'primary' : 'primary'}
                      onClick={handleMarkAllAsRead}
                    >
                      <CheckCircleIcon fontSize="small" />
                    </Button>
                  </Tooltip>
                  <Button 
                    variant="contained" 
                    size="small"
                    sx={{ fontSize: '0.7rem' }}
                    color={isDarkMode ? 'primary' : 'primary'}
                    onClick={handleEmailAction}
                    startIcon={<LaunchIcon fontSize="small" />}
                  >
                    VIEW
                  </Button>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1, bgcolor: isDarkMode ? 'rgba(33, 150, 243, 0.1)' : '#f5f9ff', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <EventIcon sx={{ mr: 1, color: isDarkMode ? '#42a5f5' : '#1976d2' }} />
                  <Typography variant="body1" sx={{ flexGrow: 1 }} color={isDarkMode ? 'text.primary' : 'inherit'}>
                    {getCalendarSummary()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Tooltip title="Snooze upcoming events">
                    <Button 
                      variant="outlined" 
                      size="small"
                      sx={{ px: 1 }}
                      color={isDarkMode ? 'primary' : 'primary'}
                      onClick={handleSnoozeEvents}
                    >
                      <SnoozeIcon fontSize="small" />
                    </Button>
                  </Tooltip>
                  <Button 
                    variant="contained" 
                    size="small"
                    sx={{ fontSize: '0.7rem' }}
                    color={isDarkMode ? 'primary' : 'primary'}
                    onClick={handleCalendarAction}
                    startIcon={<LaunchIcon fontSize="small" />}
                  >
                    VIEW
                  </Button>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1, bgcolor: isDarkMode ? 'rgba(33, 150, 243, 0.1)' : '#f5f9ff', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Badge 
                    badgeContent={
                      <PriorityIcon sx={{ fontSize: 10, color: '#fff' }} />
                    } 
                    sx={{ mr: 1 }}
                    color={getTaskPriorityLevel() === 'none' ? 'default' : 'error'}
                    overlap="circular"
                    invisible={getTaskPriorityLevel() === 'none'}
                  >
                    <TaskIcon sx={{ color: getTaskPriorityColor() }} />
                  </Badge>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" color={isDarkMode ? 'text.primary' : 'inherit'}>
                      {getTaskSummary()}
                    </Typography>
                    {getTaskPriorityLevel() !== 'none' && (
                      <Chip 
                        label={getTaskPriorityLevel() === 'high' ? 'High Priority' : getTaskPriorityLevel() === 'medium' ? 'Medium Priority' : 'Low Priority'} 
                        size="small" 
                        color={getTaskPriorityLevel() === 'high' ? 'error' : getTaskPriorityLevel() === 'medium' ? 'warning' : 'success'}
                        sx={{ mt: 0.5, height: 20, fontSize: '0.65rem' }}
                      />
                    )}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getTaskPriorityLevel() !== 'none' && (
                    <Tooltip title="Complete first task">
                      <Button 
                        variant="outlined" 
                        size="small"
                        sx={{ px: 1 }}
                        color={isDarkMode ? 'primary' : 'primary'}
                        onClick={handleCompleteTask}
                      >
                        <CheckCircleIcon fontSize="small" />
                      </Button>
                    </Tooltip>
                  )}
                  <Button 
                    variant="contained" 
                    size="small"
                    sx={{ fontSize: '0.7rem' }}
                    color={isDarkMode ? 'primary' : 'primary'}
                    onClick={handleTaskAction}
                    startIcon={<LaunchIcon fontSize="small" />}
                  >
                    VIEW
                  </Button>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, p: 1, bgcolor: isDarkMode ? 'rgba(33, 150, 243, 0.1)' : '#f5f9ff', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <WellbeingIcon sx={{ mr: 1, color: stressReport?.overallStress === 'HIGH' ? '#d32f2f' : stressReport?.overallStress === 'MEDIUM' ? '#ff9800' : '#388e3c' }} />
                  <Typography variant="body1" sx={{ flexGrow: 1 }} color={isDarkMode ? 'text.primary' : 'inherit'}>
                    {stressReportLoading ? "Analyzing your wellbeing data..." : getWellbeingMessage()}
                  </Typography>
                </Box>
                <Box>
                  <Button 
                    variant="contained" 
                    size="small"
                    sx={{ fontSize: '0.7rem' }}
                    color={isDarkMode ? 'primary' : 'primary'}
                    onClick={handleWellbeingAction}
                    startIcon={<LaunchIcon fontSize="small" />}
                  >
                    MONITOR
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default DailyBrief; 