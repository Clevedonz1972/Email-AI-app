import React, { useRef, useState } from 'react';
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
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Reply as ReplyIcon,
  FormatListBulleted as ActionItemsIcon,
  Visibility as ReadIcon,
  VolumeUp as TextToSpeechIcon,
  ZoomIn as IncreaseTextIcon,
  ZoomOut as DecreaseTextIcon,
  MailOutline as MarkUnreadIcon,
} from '@mui/icons-material';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { FocusAssistant } from '../Common/FocusAssistant';
import { EmailAnalysis } from './EmailAnalysis';
import { emailService } from '../../services/emailService';
import type { EmailAnalysis as EmailAnalysisType, StressLevel, Priority } from '@/types/email';

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
  onSendReply?: (content: string) => Promise<void>;
}

export const EmailDetail: React.FC<EmailDetailProps> = ({
  email,
  onReply,
  onMarkRead,
  onSendReply,
}) => {
  const { preferences, updatePreferences } = useAccessibility();
  const contentRef = useRef<HTMLDivElement>(null);
  const speechSynthesis = window.speechSynthesis;
  
  // State for email analysis
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<EmailAnalysisType | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

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

  const handleShowAnalysis = async () => {
    if (analysis) {
      setShowAnalysis(true);
      return;
    }

    setAnalysisLoading(true);
    setAnalysisError(null);
    
    try {
      // Create default analysis for demo if it doesn't exist
      const analysisResult = {
        summary: `This is an ${email.priority.toLowerCase()} priority email with a ${email.stress_level.toLowerCase()} stress level.`,
        stress_level: email.stress_level,
        priority: email.priority,
        action_items: email.action_items || [],
        sentiment_score: email.sentiment_score,
      };
      
      setAnalysis(analysisResult);
      setShowAnalysis(true);
    } catch (error) {
      setAnalysisError('Failed to analyze email.');
      console.error('Error analyzing email:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleSendReply = async (content: string) => {
    try {
      if (onSendReply) {
        await onSendReply(content);
      }
      
      setSnackbar({
        open: true,
        message: 'Reply sent successfully!',
        severity: 'success'
      });
      
      // Simulate sending for demo
      setTimeout(() => {
        onMarkRead();
      }, 1000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to send reply.',
        severity: 'error'
      });
      console.error('Error sending reply:', error);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Box>
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
              onClick={() => handleShowAnalysis()}
              sx={{
                fontSize: preferences.fontSize * 0.875,
              }}
            >
              Reply with AI
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

      {showAnalysis && (
        <Box mt={3}>
          <EmailAnalysis 
            email={{
              ...email,
              preview: email.content.substring(0, 100),
              is_read: true,
              category: 'inbox',
              processed: true,
            }} 
            analysis={analysis} 
            loading={analysisLoading} 
            error={analysisError} 
            onReply={handleSendReply}
          />
        </Box>
      )}

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 