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
import type { EmailMessage } from '../../types/email';

interface EmailCardProps {
  email: EmailMessage;
  onMarkRead?: (id: string) => void;
  onFlag?: (id: string) => void;
}

export const EmailCard: React.FC<EmailCardProps> = ({
  email,
  onMarkRead,
  onFlag
}) => {
  const handleMarkRead = () => {
    onMarkRead?.(email.id);
  };

  const handleFlag = () => {
    onFlag?.(email.id);
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
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {email.subject}
          </Typography>
          <Box>
            <IconButton onClick={handleMarkRead} aria-label="mark as read">
              <MailIcon color={email.is_read ? 'disabled' : 'primary'} />
            </IconButton>
            <IconButton onClick={handleFlag} aria-label="flag as urgent">
              <FlagIcon />
            </IconButton>
          </Box>
        </Box>
        <Typography color="textSecondary" gutterBottom>
          From: {email.sender.name} ({email.sender.email})
        </Typography>
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