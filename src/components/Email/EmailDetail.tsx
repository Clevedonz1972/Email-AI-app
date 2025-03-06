import React, { useRef } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Reply as ReplyIcon,
  FormatListBulleted as ActionItemsIcon,
  Visibility as ReadIcon,
  VolumeUp as TextToSpeechIcon,
  ZoomIn as IncreaseTextIcon,
  ZoomOut as DecreaseTextIcon,
} from '@mui/icons-material';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { FocusAssistant } from '../Common/FocusAssistant';
import { StressLevel, Priority } from '@/types/email';

interface EmailDetailProps {
  email: {
    id: number;
    subject: string;
    content: string;
    sender: {
      email: string;
      name: string;
    };
    timestamp: string;
    stress_level: StressLevel;
    priority: Priority;
    summary?: string;
    action_items?: Array<{
      id: string;
      description: string;
      completed: boolean;
    }>;
    sentiment_score: number;
  };
  onReply: () => void;
  onMarkRead: () => void;
}

export const EmailDetail: React.FC<EmailDetailProps> = ({
  email,
  onReply,
  onMarkRead,
}) => {
  const { preferences, updatePreferences } = useAccessibility();
  const contentRef = useRef<HTMLDivElement>(null);
  const speechSynthesis = window.speechSynthesis;

  const handleTextToSpeech = () => {
    if (contentRef.current) {
      const utterance = new SpeechSynthesisUtterance(
        `${email.subject}. ${email.content}`
      );
      speechSynthesis.speak(utterance);
    }
  };

  const handleFocusComplete = () => {
    updatePreferences({ focusMode: false });
  };

  const getStressLevelColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Paper
      elevation={preferences.highContrast ? 0 : 1}
      sx={{
        p: 3,
        border: preferences.highContrast ? '2px solid black' : 'none',
        backgroundColor: theme =>
          preferences.highContrast
            ? theme.palette.background.default
            : theme.palette.background.paper,
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography
          variant="h5"
          sx={{
            fontSize: preferences.fontSize * 1.5,
            fontWeight: 'bold',
          }}
        >
          {email.subject}
        </Typography>
        <Box display="flex" gap={1}>
          <Tooltip title="Text to Speech">
            <IconButton onClick={handleTextToSpeech}>
              <TextToSpeechIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Mark as Read">
            <IconButton onClick={onMarkRead}>
              <ReadIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<ReplyIcon />}
            onClick={onReply}
            sx={{
              fontSize: preferences.fontSize * 0.875,
            }}
          >
            Reply
          </Button>
        </Box>
      </Box>

      <Box display="flex" gap={1} mb={2}>
        <Chip
          label={`Stress Level: ${email.stress_level}`}
          color={getStressLevelColor(email.stress_level) as any}
          sx={{ fontSize: preferences.fontSize * 0.75 }}
        />
        <Chip
          label={`Priority: ${email.priority}`}
          color={email.priority === 'HIGH' ? 'error' : 'default'}
          sx={{ fontSize: preferences.fontSize * 0.75 }}
        />
        <Chip
          label={`Sentiment: ${(email.sentiment_score * 100).toFixed(0)}%`}
          color={email.sentiment_score > 0.5 ? 'success' : 'default'}
          sx={{ fontSize: preferences.fontSize * 0.75 }}
        />
      </Box>

      <Typography
        variant="body2"
        color="textSecondary"
        sx={{
          mb: 2,
          fontSize: preferences.fontSize * 0.875,
        }}
      >
        From: {email.sender.name} ({email.sender.email})
        <br />
        Date: {new Date(email.timestamp).toLocaleString()}
      </Typography>

      {email.summary && (
        <Box mb={2}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 'bold',
              fontSize: preferences.fontSize,
            }}
          >
            Summary
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: preferences.fontSize,
              backgroundColor: theme =>
                preferences.highContrast
                  ? theme.palette.grey[200]
                  : theme.palette.background.default,
              p: 2,
              borderRadius: 1,
            }}
          >
            {email.summary}
          </Typography>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      <div ref={contentRef}>
        <Typography
          variant="body1"
          sx={{
            fontSize: preferences.fontSize,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
          }}
        >
          {email.content}
        </Typography>
      </div>

      {email.action_items && email.action_items.length > 0 && (
        <Box mt={3}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 'bold',
              fontSize: preferences.fontSize,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <ActionItemsIcon />
            Action Items
          </Typography>
          <List>
            {email.action_items.map((item, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        fontSize: preferences.fontSize,
                      }}
                    >
                      {item.description}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {preferences.focusMode && (
        <FocusAssistant
          contentRef={contentRef as React.RefObject<HTMLDivElement>}
          onComplete={handleFocusComplete}
        />
      )}
    </Paper>
  );
}; 