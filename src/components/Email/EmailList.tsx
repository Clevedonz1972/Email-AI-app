import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Paper,
  Box,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Error as HighStressIcon,
  Warning as MediumStressIcon,
  CheckCircle as LowStressIcon,
  Star as PriorityIcon,
  Mail as UnreadIcon,
  MailOutline as ReadIcon,
} from '@mui/icons-material';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import type { EmailMessage } from '@/types/email';

interface EmailListProps {
  emails: EmailMessage[];
  loading: boolean;
  onSelectEmail: (email: EmailMessage) => void;
  onMarkRead: (id: number) => void;
}

export const EmailList: React.FC<EmailListProps> = ({
  emails,
  loading,
  onSelectEmail,
  onMarkRead,
}) => {
  const { preferences } = useAccessibility();
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  useKeyboardNavigation({
    enabled: true,
    onArrowUp: () => setSelectedIndex(prev => Math.max(0, prev - 1)),
    onArrowDown: () => setSelectedIndex(prev => Math.min(emails.length - 1, prev + 1)),
    onEnter: () => {
      if (selectedIndex >= 0 && selectedIndex < emails.length) {
        onSelectEmail(emails[selectedIndex]);
      }
    },
  });

  const getStressIcon = (level: string) => {
    switch (level) {
      case 'HIGH':
        return <HighStressIcon color="error" />;
      case 'MEDIUM':
        return <MediumStressIcon color="warning" />;
      case 'LOW':
        return <LowStressIcon color="success" />;
      default:
        return null;
    }
  };

  const renderEmailItem = (email: EmailMessage, index: number) => (
    <ListItem
      key={email.id}
      selected={index === selectedIndex}
      onClick={() => {
        setSelectedIndex(index);
        onSelectEmail(email);
      }}
      sx={{
        mb: 1,
        borderRadius: 1,
        transition: preferences.reducedMotion ? 'none' : 'all 0.2s ease',
        cursor: 'pointer',
        backgroundColor: theme => 
          preferences.highContrast 
            ? email.is_read 
              ? theme.palette.background.paper
              : theme.palette.primary.light
            : 'inherit',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
        ...(email.stress_level === 'HIGH' && {
          borderLeft: theme => `4px solid ${theme.palette.error.main}`,
        }),
      }}
    >
      <ListItemIcon>
        <Box display="flex" alignItems="center" gap={1}>
          {email.is_read ? <ReadIcon /> : <UnreadIcon color="primary" />}
          {getStressIcon(email.stress_level)}
          {email.priority === 'HIGH' && (
            <PriorityIcon color="warning" />
          )}
        </Box>
      </ListItemIcon>

      <ListItemText
        primary={
          <Typography
            variant="body1"
            sx={{
              fontWeight: email.is_read ? 'normal' : 'bold',
              fontSize: preferences.fontSize,
            }}
          >
            {email.subject}
          </Typography>
        }
        secondary={
          <Box>
            <Typography
              variant="body2"
              sx={{ fontSize: preferences.fontSize * 0.875 }}
            >
              {email.sender.name} ({email.sender.email})
            </Typography>
            {email.summary && preferences.focusMode && (
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ fontSize: preferences.fontSize * 0.875 }}
              >
                {email.summary}
              </Typography>
            )}
          </Box>
        }
      />

      <Box display="flex" alignItems="center" gap={1}>
        <Chip
          size="small"
          label={email.stress_level}
          color={
            email.stress_level === 'HIGH'
              ? 'error'
              : email.stress_level === 'MEDIUM'
              ? 'warning'
              : 'success'
          }
          sx={{
            fontSize: preferences.fontSize * 0.75,
          }}
        />
        <Typography
          variant="caption"
          sx={{
            fontSize: preferences.fontSize * 0.75,
          }}
        >
          {new Date(email.timestamp).toLocaleTimeString()}
        </Typography>
      </Box>
    </ListItem>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper
      elevation={preferences.highContrast ? 0 : 1}
      sx={{
        p: 2,
        border: preferences.highContrast ? '2px solid black' : 'none',
      }}
    >
      <List>
        {emails.map((email, index) => renderEmailItem(email, index))}
      </List>
    </Paper>
  );
}; 