import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Chip
} from '@mui/material';
import MailIcon from '@mui/icons-material/Mail';
import FlagIcon from '@mui/icons-material/Flag';
import { useNavigate } from 'react-router-dom';
import type { EmailMessage } from '@/types/email';
import ActionButtons from '@/components/shared/ActionButtons';

interface EmailCardProps {
  email: EmailMessage;
  onMarkRead?: (id: number) => void;
  onFlag?: (id: number) => void;
}

export const EmailCard: React.FC<EmailCardProps> = ({
  email,
  onMarkRead,
  onFlag
}) => {
  const navigate = useNavigate();

  const handleMarkRead = () => {
    onMarkRead?.(email.id);
  };

  const handleFlag = () => {
    onFlag?.(email.id);
  };

  // Action button handlers
  const handleDoItNow = (type: 'email' | 'calendar' | 'task' | 'wellbeing') => {
    console.log(`Do it now clicked for ${type} with ID: ${email.id}`);
    navigate(`/email-detail/${email.id}`);
  };

  const handleDefer = (type: 'email' | 'calendar' | 'task' | 'wellbeing') => {
    console.log(`Deferring ${type} with ID: ${email.id}`);
    // Implementation for deferring emails
  };

  const handleAskASTI = (type: 'email' | 'calendar' | 'task' | 'wellbeing') => {
    console.log(`Asking ASTI about ${type} with ID: ${email.id}`);
    // Implementation for asking ASTI about emails
  };

  const handleAutoReply = (type: 'email' | 'calendar' | 'task' | 'wellbeing') => {
    console.log(`Auto-replying to ${type} with ID: ${email.id}`);
    // Implementation for auto-replying to emails
  };

  return (
    <Card 
      sx={{ 
        mb: 2,
        borderLeft: 6,
        borderLeftColor: getPriorityColor(email.priority)
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h6">
              {email.subject}
            </Typography>
            <Typography color="textSecondary" gutterBottom>
              From: {email.sender.name} ({email.sender.email})
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <ActionButtons 
              type="email"
              onDoItNow={handleDoItNow}
              onDefer={handleDefer}
              onAskASTI={handleAskASTI}
              onAutoReply={handleAutoReply}
              showAutoReply={true}
              size="small"
            />
            <Box ml={1}>
              <IconButton onClick={handleMarkRead} aria-label="mark as read" size="small">
                <MailIcon color={email.is_read ? 'disabled' : 'primary'} />
              </IconButton>
              <IconButton onClick={handleFlag} aria-label="flag as urgent" size="small">
                <FlagIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
        
        <Typography variant="body2" paragraph>
          {email.preview}
        </Typography>
        {email.processed && (
          <Box mt={1}>
            <Chip 
              label={email.priority} 
              size="small" 
              color={getPriorityChipColor(email.priority)}
              sx={{ mr: 1 }}
            />
            {email.summary && (
              <Typography variant="body2" color="textSecondary">
                Summary: {email.summary}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const getPriorityColor = (priority: EmailMessage['priority']) => {
  switch (priority) {
    case 'HIGH':
      return 'error.main';
    case 'MEDIUM':
      return 'warning.main';
    default:
      return 'success.main';
  }
};

const getPriorityChipColor = (priority: EmailMessage['priority']): 'error' | 'warning' | 'success' => {
  switch (priority) {
    case 'HIGH':
      return 'error';
    case 'MEDIUM':
      return 'warning';
    default:
      return 'success';
  }
}; 