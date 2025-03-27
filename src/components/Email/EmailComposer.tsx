import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Chip,
  Tooltip,
  IconButton,
  Collapse,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TimerIcon from '@mui/icons-material/Timer';
import PauseIcon from '@mui/icons-material/Pause';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { FocusAssistant } from '../Common/FocusAssistant';
import type { EmailMessage, EmailSender } from '@/types/email';

const ComposerWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  position: 'relative',
  '& .MuiTextField-root': {
    marginBottom: theme.spacing(2),
  },
}));

const AIAssistantPanel = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

const StressIndicator = styled(Box)<{ stress: number }>(({ theme, stress }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  color: stress > 70 ? theme.palette.error.main : 
         stress > 40 ? theme.palette.warning.main : 
         theme.palette.success.main,
}));

export interface EmailComposerProps {
  recipient?: string;
  initialValues: {
    subject: string;
    content: string;
    sender: EmailSender;
  };
  onSend: () => Promise<void>;
}

export const EmailComposer: React.FC<EmailComposerProps> = ({
  recipient = '',
  initialValues,
  onSend
}) => {
  const theme = useTheme();
  const { preferences } = useAccessibility();
  const [to, setTo] = useState(recipient);
  const [emailSubject, setEmailSubject] = useState(initialValues.subject);
  const [content, setContent] = useState(initialValues.content);
  const [isLoading, setIsLoading] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [stressLevel, setStressLevel] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  const { 
    generateSuggestion, 
    simplifyContent,
    checkTone,
    isGenerating,
    error: aiError 
  } = useAIAssistant();

  // Keyboard navigation setup
  useKeyboardNavigation({
    enabled: true,
    onEscape: () => {
      if (showAIPanel) {
        setShowAIPanel(false);
      }
    },
    onEnter: () => {
      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement && 
          (activeElement.tagName === 'BUTTON' || activeElement.tagName === 'A')) {
        activeElement.click();
      }
    },
  });

  const handleContentChange = async (value: string) => {
    setContent(value);
    // Analyze stress level based on content
    const stress = await checkTone(value);
    setStressLevel(stress);
  };

  const handleAIAssist = async () => {
    setShowAIPanel(true);
    const suggestion = await generateSuggestion(content);
    if (suggestion) {
      setContent(suggestion);
    }
  };

  const handleSimplify = async () => {
    const simplified = await simplifyContent(content);
    if (simplified) {
      setContent(simplified);
    }
  };

  const handleSend = async () => {
    try {
      setIsLoading(true);
      await onSend();
      // Clear form after successful send
      setTo('');
      setEmailSubject('');
      setContent('');
      setShowAIPanel(false);
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ComposerWrapper ref={composerRef}>
      <Typography variant="h6" gutterBottom>
        Compose Email
      </Typography>

      <StressIndicator stress={stressLevel}>
        <Tooltip title={`Email stress level: ${stressLevel}%`}>
          {stressLevel > 70 ? (
            <ErrorOutlineIcon aria-label="High stress level" />
          ) : stressLevel > 40 ? (
            <TimerIcon aria-label="Medium stress level" />
          ) : (
            <CheckCircleIcon aria-label="Low stress level" />
          )}
        </Tooltip>
      </StressIndicator>

      <TextField
        fullWidth
        label="To"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        placeholder="recipient@example.com"
        aria-label="Email recipient"
        inputProps={{
          'aria-required': 'true',
          'aria-describedby': 'recipient-helper-text'
        }}
      />

      <TextField
        fullWidth
        label="Subject"
        value={emailSubject}
        onChange={(e) => setEmailSubject(e.target.value)}
        placeholder="Enter email subject"
        aria-label="Email subject"
        inputProps={{
          'aria-required': 'true',
          'aria-describedby': 'subject-helper-text'
        }}
      />

      <Box ref={contentRef} position="relative">
        <TextField
          fullWidth
          multiline
          rows={6}
          label="Content"
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Write your email here..."
          aria-label="Email content"
          inputProps={{
            'aria-required': 'true',
            'aria-describedby': 'content-helper-text',
            style: {
              fontSize: preferences.fontSize,
              lineHeight: preferences.lineSpacing,
            }
          }}
        />
        {preferences.focusMode && (
          <FocusAssistant 
            contentRef={contentRef as React.RefObject<HTMLDivElement>}
            onComplete={() => {/* Handle focus completion */}}
          />
        )}
      </Box>

      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mt={2}
        role="toolbar" 
        aria-label="Email actions"
      >
        <Box>
          <Tooltip title="Get AI assistance with your email">
            <Button
              startIcon={<AutoAwesomeIcon />}
              onClick={handleAIAssist}
              disabled={isGenerating || !content}
              color="primary"
              variant="outlined"
              sx={{ mr: 1 }}
              aria-label="AI Assist"
            >
              AI Assist
            </Button>
          </Tooltip>
          <Tooltip title="Simplify your email content">
            <Button
              onClick={handleSimplify}
              disabled={isGenerating || !content}
              color="secondary"
              variant="outlined"
              aria-label="Simplify content"
            >
              Simplify
            </Button>
          </Tooltip>
        </Box>

        <Button
          variant="contained"
          color="primary"
          endIcon={isLoading ? <CircularProgress size={20} /> : <SendIcon />}
          onClick={handleSend}
          disabled={isLoading || !to || !emailSubject || !content}
          aria-label="Send email"
          aria-busy={isLoading}
        >
          Send
        </Button>
      </Box>

      <Collapse in={showAIPanel}>
        <AIAssistantPanel role="complementary" aria-label="AI Suggestions">
          <Typography variant="subtitle2" color="primary" gutterBottom>
            AI Suggestions
          </Typography>
          {isGenerating ? (
            <Box display="flex" alignItems="center" role="status">
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="body2">Generating suggestions...</Typography>
            </Box>
          ) : aiError ? (
            <Typography color="error" variant="body2" role="alert">
              {aiError}
            </Typography>
          ) : (
            <Box>
              <Chip
                label="Take a break"
                color="warning"
                size="small"
                icon={<PauseIcon />}
                sx={{ mr: 1 }}
                onClick={() => {}}
                role="button"
              />
              <Typography variant="body2" color="textSecondary" mt={1}>
                This email has a high stress level. Consider taking a short break before sending.
              </Typography>
            </Box>
          )}
        </AIAssistantPanel>
      </Collapse>
    </ComposerWrapper>
  );
}; 