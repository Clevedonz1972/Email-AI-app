import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, IconButton, Collapse, Badge, Button, CircularProgress, Tooltip, ToggleButtonGroup, ToggleButton, Card, CardContent, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LaunchIcon from '@mui/icons-material/Launch';
import SnoozeIcon from '@mui/icons-material/Snooze';
import ReplyIcon from '@mui/icons-material/Reply';
import ReportIcon from '@mui/icons-material/Report';
import MuteIcon from '@mui/icons-material/NotificationsOff';
import TodayIcon from '@mui/icons-material/Today';
import UpdateIcon from '@mui/icons-material/Update';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from 'react-router-dom';
import { useEmailContext } from '@/contexts/EmailContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useDashboardContext } from '@/contexts/DashboardContext';
import type { EmailMessage } from '@/types/email';
import { aiService, DailyBriefData } from '@/services/aiService';
import ActionButtons, { ActionType } from '@/components/shared/ActionButtons';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

// Use MUI for WellbeingIcon component
const WellbeingIcon = FavoriteIcon;

// ViewMode type
type ViewMode = 'daily' | 'right-now';

export const DailyBrief: React.FC = () => {
  const [expanded, setExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const { emails, loading: emailsLoading, stressReport, stressReportLoading, markAllAsRead } = useEmailContext();
  const [loading, setLoading] = useState(true);
  const [briefData, setBriefData] = useState<DailyBriefData | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { openSpeakToMe } = useDashboardContext();
  const isDarkMode = settings.darkMode;
  const [aiBrief, setAiBrief] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch the daily brief from ASTI
  const fetchDailyBrief = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiService.getDailyBrief();
      setBriefData(data);
    } catch (error) {
      console.error('Error fetching daily brief:', error);
      setError('Unable to load daily brief data. Using fallback data.');
      // Still set the fallback data
      const fallbackData = await aiService.getDailyBrief();
      setBriefData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDailyBrief();
    
    // If we're in development, add automatic retry for API connection issues
    if (process.env.NODE_ENV === 'development' && retryCount < 2) {
      const retryTimer = setTimeout(() => {
        console.log(`Retrying daily brief fetch (attempt ${retryCount + 1})...`);
        setRetryCount(prev => prev + 1);
        fetchDailyBrief();
      }, 5000); // Wait 5 seconds before retry
      
      return () => clearTimeout(retryTimer);
    }
  }, [fetchDailyBrief, retryCount]);

  useEffect(() => {
    // Add this to fetch AI-powered brief
    const fetchAiBrief = async () => {
      try {
        setAiLoading(true);
        const response = await fetch('/api/asti/daily-brief', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAiBrief(data);
        } else {
          console.error('Failed to fetch AI brief');
        }
      } catch (error) {
        console.error('Error fetching AI brief:', error);
      } finally {
        setAiLoading(false);
      }
    };
    
    fetchAiBrief();
  }, []);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // Handle view mode change
  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: ViewMode | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  // Navigate to email dashboard
  const handleEmailAction = () => {
    navigate('/email-dashboard');
  };

  // Handler for "Do it now" button
  const handleDoItNow = (type: ActionType) => {
    console.log(`Do it now clicked for ${type}`);
    switch (type) {
      case 'email':
        navigate('/email-dashboard');
        break;
      case 'calendar':
        navigate('/calendar');
        break;
      case 'task':
        navigate('/email-dashboard?filter=action_required');
        break;
      case 'wellbeing':
        navigate('/health-dashboard');
        break;
    }
  };

  // Handler for "Defer" button
  const handleDefer = (type: ActionType) => {
    console.log(`Deferring ${type} for later`);
    // This would call an API to defer the item
    // For now, just show a confirmation in console
  };

  // Handler for "Ask ASTI" button
  const handleAskASTI = (type: ActionType) => {
    console.log(`Asking ASTI about ${type}`);
    // Use the DashboardContext to open the SpeakToMe dialog
    openSpeakToMe();
  };

  // Handler for "Auto-reply" button
  const handleAutoReply = (type: ActionType) => {
    console.log(`Auto-replying to ${type}`);
    // This would trigger an auto-reply feature
    // For now, just show a confirmation in console
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

  // Email stats computation
  const emailStats = React.useMemo(() => {
    const unread = emails.filter((e: EmailMessage) => !e.is_read).length;
    const high = emails.filter((e: EmailMessage) => e.priority === 'HIGH' && !e.is_read).length;
    
    return { unread, high };
  }, [emails]);

  // If no ASTI data is available yet, fallback to computed data
  const getTaskSummary = () => {
    if (briefData?.task_summary) {
      if (briefData.task_summary.upcoming_deadlines.length > 0) {
        return `You have ${briefData.task_summary.urgent_tasks} urgent tasks. The most pressing is "${briefData.task_summary.upcoming_deadlines[0]?.title}".`;
      }
      return `You have ${briefData.task_summary.total_tasks} tasks, ${briefData.task_summary.urgent_tasks} of which are urgent.`;
    }
    
    // Fallback to computed data
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

  // Get task priority color
  const getTaskPriorityColor = () => {
    const priority = briefData?.overall_status?.stress_level || 'MEDIUM';
    switch (priority) {
      case 'HIGH': return '#d32f2f';
      case 'MEDIUM': return '#f57c00';
      case 'LOW': return '#388e3c';
      default: return '#757575';
    }
  };

  // Filter for "Right Now" view - only show immediate items
  const getImmediateItems = () => {
    // Logic to determine what's immediate/urgent
    const hasHighPriorityEmails = (briefData?.email_summary?.high_priority_count || emailStats.high) > 0;
    const hasUrgentTasks = (briefData?.task_summary?.urgent_tasks || 0) > 0;
    const hasUpcomingMeeting = briefData?.calendar_summary?.next_event && 
      new Date(briefData.calendar_summary.next_event.start_time).getTime() - Date.now() < 3600000; // within the hour
    
    return {
      showEmails: hasHighPriorityEmails,
      showTasks: hasUrgentTasks,
      showCalendar: hasUpcomingMeeting,
      // Always show wellbeing, as it's generally important
      showWellbeing: true
    };
  };

  // Get viewmode-specific greeting
  const getGreeting = () => {
    if (viewMode === 'right-now') {
      return briefData?.greeting ? `${briefData.greeting} Focus on what's urgent right now.` : "Here's what needs your attention right now.";
    }
    return briefData?.greeting ? `${briefData.greeting} Let's wrap up what's happening. Your wellbeing matters - prioritize what's important.` : "Good day! Let's wrap up what's happening. Your wellbeing matters - prioritize what's important.";
  };

  // Immediate items for "Right Now" view
  const immediateItems = getImmediateItems();

  // Common button styles
  const actionButtonStyle = {
    minWidth: 'unset',
    width: '40px',
    height: '40px',
    padding: '8px',
    marginLeft: '4px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const buttonIconStyle = {
    fontSize: '1.2rem',
  };

  const buttonLabelStyle = {
    fontSize: '0.6rem',
    lineHeight: 1,
    marginTop: '2px',
    textTransform: 'none',
  };

  const primaryButtonStyle = {
    ...actionButtonStyle,
    backgroundColor: isDarkMode ? '#3a8eff' : '#1976d2',
    color: 'white',
    '&:hover': {
      backgroundColor: isDarkMode ? '#2979ff' : '#1565c0',
    }
  };

  const secondaryButtonStyle = {
    ...actionButtonStyle,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)',
    '&:hover': {
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
    }
  };

  const renderAstiInsights = () => {
    if (!aiBrief) return null;
    
    return (
      <Card elevation={1} sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <AutoAwesomeIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">ASTI Insights</Typography>
          </Box>
          
          <Typography variant="h5" gutterBottom>
            {aiBrief.greeting}
          </Typography>
          
          <Typography variant="body1" paragraph>
            {aiBrief.summary}
          </Typography>
          
          {aiBrief.email_highlights && aiBrief.email_highlights.length > 0 && (
            <>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Important Emails
              </Typography>
              <List dense>
                {aiBrief.email_highlights.map((email: any, index: number) => (
                  <ListItem key={`email-${index}`} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemIcon>
                      {email.priority === 'HIGH' ? (
                        <EmailIcon color="error" />
                      ) : (
                        <EmailIcon color="primary" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={email.subject}
                      secondary={email.summary}
                      primaryTypographyProps={{
                        fontWeight: email.priority === 'HIGH' ? 'bold' : 'normal',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
          
          {aiBrief.suggested_priorities && aiBrief.suggested_priorities.length > 0 && (
            <>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                Suggested Priorities
              </Typography>
              <List dense>
                {aiBrief.suggested_priorities.map((priority: any, index: number) => (
                  <ListItem key={`priority-${index}`} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemIcon>
                      <AssignmentIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={priority.task}
                      secondary={priority.reason}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
          
          {aiBrief.wellbeing_suggestion && (
            <Box 
              sx={{ 
                mt: 2, 
                p: 1.5, 
                bgcolor: 'primary.light', 
                color: 'primary.contrastText',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'flex-start'
              }}
            >
              <TipsAndUpdatesIcon sx={{ mr: 1, mt: 0.3 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Wellbeing Tip
                </Typography>
                <Typography variant="body2">
                  {aiBrief.wellbeing_suggestion}
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    );
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
            Your {viewMode === 'right-now' ? 'Right Now' : 'Daily'} Brief
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* View toggle */}
          <ToggleButtonGroup
            size="small"
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="brief view mode"
            sx={{ 
              mr: 1,
              '& .MuiToggleButton-root': {
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                fontSize: '0.75rem',
                py: 0.5,
                '&.Mui-selected': {
                  color: isDarkMode ? '#fff' : '#1976d2',
                  bgcolor: isDarkMode ? 'rgba(25, 118, 210, 0.2)' : 'rgba(25, 118, 210, 0.1)',
                  '&:hover': {
                    bgcolor: isDarkMode ? 'rgba(25, 118, 210, 0.3)' : 'rgba(25, 118, 210, 0.2)',
                  },
                },
              }
            }}
          >
            <ToggleButton value="daily" aria-label="daily view">
              <TodayIcon fontSize="small" sx={{ mr: 0.5 }} />
              Daily
            </ToggleButton>
            <ToggleButton value="right-now" aria-label="right now view">
              <UpdateIcon fontSize="small" sx={{ mr: 0.5 }} />
              Right Now
            </ToggleButton>
          </ToggleButtonGroup>

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
              {getGreeting()}
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={20} />
            </Box>
          ) : (
            <>
              {error && (
                <Box sx={{ mb: 2, p: 1, bgcolor: 'rgba(255, 0, 0, 0.05)', borderRadius: 1, border: '1px solid rgba(255, 0, 0, 0.1)' }}>
                  <Typography variant="body2" color="error" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ mr: 1 }}>⚠️</Box> 
                    {error}
                  </Typography>
                </Box>
              )}
              
              {/* Conditionally show email info based on view mode */}
              {(viewMode === 'daily' || immediateItems.showEmails) && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1, bgcolor: isDarkMode ? 'rgba(33, 150, 243, 0.1)' : '#f5f9ff', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Badge 
                      badgeContent={briefData?.email_summary?.unread_count || emailStats.unread} 
                      color="primary" 
                      sx={{ mr: 1 }}
                    >
                      <EmailIcon sx={{ color: isDarkMode ? '#42a5f5' : '#1976d2' }} />
                    </Badge>
                    <Typography variant="body1" sx={{ flexGrow: 1 }} color={isDarkMode ? 'text.primary' : 'inherit'}>
                      {viewMode === 'right-now' && (briefData?.email_summary?.high_priority_count || emailStats.high) > 0 ? (
                        `You have ${briefData?.email_summary?.high_priority_count || emailStats.high} high priority emails that need attention.`
                      ) : (
                        `You have ${briefData?.email_summary?.unread_count || emailStats.unread} unread emails${
                          (briefData?.email_summary?.high_priority_count || emailStats.high) > 0 
                          ? `, including ${briefData?.email_summary?.high_priority_count || emailStats.high} marked as high priority` 
                          : ''
                        }.`
                      )}
                    </Typography>
                  </Box>
                  <ActionButtons 
                    type="email"
                    onDoItNow={handleDoItNow}
                    onDefer={handleDefer}
                    onAskASTI={handleAskASTI}
                    onAutoReply={handleAutoReply}
                    showAutoReply={true}
                  />
                </Box>
              )}

              {/* Conditionally show calendar info based on view mode */}
              {(viewMode === 'daily' || immediateItems.showCalendar) && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1, bgcolor: isDarkMode ? 'rgba(33, 150, 243, 0.1)' : '#f5f9ff', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <EventIcon sx={{ mr: 1, color: isDarkMode ? '#42a5f5' : '#1976d2' }} />
                    <Typography variant="body1" sx={{ flexGrow: 1 }} color={isDarkMode ? 'text.primary' : 'inherit'}>
                      {briefData?.calendar_summary?.next_event 
                        ? `Next: ${briefData.calendar_summary.next_event.title} at ${new Date(briefData.calendar_summary.next_event.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                        : "Your calendar is clear for the rest of today."}
                    </Typography>
                  </Box>
                  <ActionButtons 
                    type="calendar"
                    onDoItNow={handleDoItNow}
                    onDefer={handleDefer}
                    onAskASTI={handleAskASTI}
                  />
                </Box>
              )}

              {/* Conditionally show tasks info based on view mode */}
              {(viewMode === 'daily' || immediateItems.showTasks) && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1, bgcolor: isDarkMode ? 'rgba(33, 150, 243, 0.1)' : '#f5f9ff', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <AssignmentIcon sx={{ mr: 1, color: isDarkMode ? '#42a5f5' : '#1976d2' }} />
                    <Typography variant="body1" sx={{ flexGrow: 1 }} color={isDarkMode ? 'text.primary' : 'inherit'}>
                      {viewMode === 'right-now' && briefData?.task_summary?.urgent_tasks ? (
                        `You have ${briefData.task_summary.urgent_tasks} urgent tasks needing immediate attention.`
                      ) : (
                        getTaskSummary()
                      )}
                    </Typography>
                  </Box>
                  <ActionButtons 
                    type="task"
                    onDoItNow={handleDoItNow}
                    onDefer={handleDefer}
                    onAskASTI={handleAskASTI}
                  />
                </Box>
              )}

              {/* Always show wellbeing info regardless of view mode */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1, bgcolor: isDarkMode ? 'rgba(33, 150, 243, 0.1)' : '#f5f9ff', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <WellbeingIcon sx={{ mr: 1, color: isDarkMode ? '#42a5f5' : '#1976d2' }} />
                  <Typography variant="body1" sx={{ flexGrow: 1 }} color={isDarkMode ? 'text.primary' : 'inherit'}>
                    {viewMode === 'right-now' ? (
                      briefData?.stress_factors && briefData.stress_factors.length > 0 
                        ? `Managing: ${briefData.stress_factors[0]}. Take a moment to breathe.`
                        : "Remember to take a moment for yourself during busy times."
                    ) : (
                      briefData?.wellbeing_suggestions && briefData.wellbeing_suggestions.length > 0 
                        ? briefData.wellbeing_suggestions[0] 
                        : "Take care of your wellbeing today."
                    )}
                  </Typography>
                </Box>
                <ActionButtons 
                  type="wellbeing"
                  onDoItNow={handleDoItNow}
                  onDefer={handleDefer}
                  onAskASTI={handleAskASTI}
                />
              </Box>

              {/* Show memory insights only in Daily view */}
              {viewMode === 'daily' && briefData?.memory_insights && briefData.memory_insights.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', p: 1, pt: 0, pb: 0 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: isDarkMode ? 'text.secondary' : 'text.secondary' }}>
                    Things to remember:
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                    {briefData.memory_insights.map((insight, index) => (
                      <li key={index}>
                        <Typography variant="body2" sx={{ color: isDarkMode ? 'text.secondary' : 'text.secondary' }}>
                          {insight.text}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}

              {renderAstiInsights()}
            </>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default DailyBrief; 