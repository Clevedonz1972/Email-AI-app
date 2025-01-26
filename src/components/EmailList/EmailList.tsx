import React from 'react';
import { Box, Card, Typography, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FlagIcon from '@mui/icons-material/Flag';
import { PRIORITY_COLORS } from '../../theme/theme';
import SearchOffIcon from '@mui/icons-material/SearchOff';

export interface Email {
  id: string;
  sender: {
    name: string;
    email: string;
  };
  subject: string;
  preview: string;
  timestamp: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  isRead: boolean;
}

interface EmailListProps {
  emails: Email[];
  onMarkRead?: (id: string) => void;
  onFlag?: (id: string) => void;
  isLoading?: boolean;
}

const EmailCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'priority'
})<{ priority: 'HIGH' | 'MEDIUM' | 'LOW' }>(({ theme, priority }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    backgroundColor: PRIORITY_COLORS[priority],
    borderTopLeftRadius: '12px',
    borderBottomLeftRadius: '12px',
  },
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    transform: 'translateX(4px)',
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  margin: theme.spacing(0, 0.5),
  '& .MuiSvgIcon-root': {
    fontSize: '1.25rem',
  },
}));

export const EmailList: React.FC<EmailListProps> = ({ 
  emails,
  onMarkRead = () => {},
  onFlag = () => {},
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (emails.length === 0) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          py: 8,
          color: 'text.secondary'
        }}
      >
        <SearchOffIcon sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h6">
          No emails found
        </Typography>
        <Typography variant="body2">
          Try adjusting your search or filters
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ maxWidth: '800px', margin: '0 auto', padding: 2 }}
      role="list"
      aria-label="Email list"
    >
      {emails.map((email) => (
        <EmailCard 
          key={email.id} 
          priority={email.priority}
          data-testid="email-card"
          className={email.isRead ? 'read' : ''}
          tabIndex={0}
          role="listitem"
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
              {email.sender.name}
            </Typography>
            <Box>
              <Tooltip title="Mark as read">
                <ActionButton 
                  aria-label="mark as read"
                  onClick={() => onMarkRead(email.id)}
                >
                  <CheckCircleOutlineIcon />
                </ActionButton>
              </Tooltip>
              <Tooltip title="Flag as urgent">
                <ActionButton 
                  aria-label="flag as urgent"
                  onClick={() => onFlag(email.id)}
                >
                  <FlagIcon />
                </ActionButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Typography 
            color="text.secondary" 
            sx={{ mb: 1, fontSize: '0.9rem' }}
          >
            {email.sender.email}
          </Typography>
          
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: email.priority === 'HIGH' ? 600 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {email.priority === 'HIGH' && (
              <ErrorOutlineIcon 
                sx={{ color: PRIORITY_COLORS.HIGH, fontSize: '1.2rem' }} 
              />
            )}
            {email.subject}
          </Typography>
          
          <Typography 
            color="text.secondary"
            sx={{ 
              mt: 1,
              lineHeight: 1.6,
              fontSize: '1rem',
            }}
          >
            {email.preview}
          </Typography>
          
          <Typography 
            color="text.secondary"
            sx={{ 
              mt: 2,
              fontSize: '0.9rem',
            }}
          >
            {email.timestamp}
          </Typography>
        </EmailCard>
      ))}
    </Box>
  );
}; 