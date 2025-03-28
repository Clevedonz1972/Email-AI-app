import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Collapse, IconButton, useTheme } from '@mui/material';
import { 
  Email as EmailIcon, 
  Event as EventIcon, 
  AssignmentTurnedIn as TaskIcon,
  Spa as WellbeingIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon 
} from '@mui/icons-material';

export interface DailyBriefProps {
  unreadCount?: number;
  eventsCount?: number;
  tasksCount?: number;
  stressLevel?: string;
}

export const DailyBrief: React.FC<DailyBriefProps> = ({
  unreadCount = 0,
  eventsCount = 0,
  tasksCount = 0,
  stressLevel = 'LOW'
}) => {
  const [expanded, setExpanded] = useState(true);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Paper 
      sx={{ 
        p: 2, 
        height: '100%', 
        borderLeft: '4px solid #1976d2',
        borderRadius: '4px',
        bgcolor: isDarkMode ? 'background.paper' : '#ffffff',
        color: isDarkMode ? 'text.primary' : 'inherit'
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
                color: '#1976d2', 
                bgcolor: isDarkMode ? 'rgba(227, 242, 253, 0.2)' : '#e3f2fd', 
                borderRadius: '50%', 
                p: 0.5 
              }} 
            />
            Your Daily Brief
          </Typography>
        </Box>
        <IconButton onClick={handleExpandClick} color={isDarkMode ? 'default' : 'inherit'}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <WellbeingIcon sx={{ mr: 1, color: 'green' }} />
            <Typography variant="body1" color={isDarkMode ? 'text.primary' : 'inherit'}>
              Good evening! Let's wrap up the day on a positive note. Your wellbeing matters - prioritize what's important.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <EmailIcon sx={{ mr: 1, color: '#1976d2' }} />
            <Typography variant="body1" sx={{ flexGrow: 1 }} color={isDarkMode ? 'text.primary' : 'inherit'}>
              You have {unreadCount} unread emails, but nothing urgent.
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              sx={{ ml: 2, fontSize: '0.7rem' }}
              color={isDarkMode ? 'primary' : 'primary'}
            >
              ACTIONS
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <EventIcon sx={{ mr: 1, color: '#1976d2' }} />
            <Typography variant="body1" sx={{ flexGrow: 1 }} color={isDarkMode ? 'text.primary' : 'inherit'}>
              Your calendar is clear until 3pm, when you have a team meeting.
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              sx={{ ml: 2, fontSize: '0.7rem' }}
              color={isDarkMode ? 'primary' : 'primary'}
            >
              ACTIONS
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TaskIcon sx={{ mr: 1, color: '#d32f2f' }} />
            <Typography variant="body1" sx={{ flexGrow: 1 }} color={isDarkMode ? 'text.primary' : 'inherit'}>
              Take some time to respond to Sarah's message about the project proposal when you have a chance.
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              sx={{ ml: 2, fontSize: '0.7rem' }}
              color={isDarkMode ? 'primary' : 'primary'}
            >
              ACTIONS
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <WellbeingIcon sx={{ mr: 1, color: 'green' }} />
            <Typography variant="body1" sx={{ flexGrow: 1 }} color={isDarkMode ? 'text.primary' : 'inherit'}>
              Your overall stress level today seems low. Keep it up!
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              sx={{ ml: 2, fontSize: '0.7rem' }}
              color={isDarkMode ? 'primary' : 'primary'}
            >
              ACTIONS
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default DailyBrief; 