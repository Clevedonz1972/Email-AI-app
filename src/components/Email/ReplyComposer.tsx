import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Chip,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  Check as ConfirmIcon,
  Warning as WarningIcon,
  VolumeUp as TextToSpeechIcon,
  FormatSize as FontSizeIcon,
} from '@mui/icons-material';
import { useAccessibility } from '../../contexts/AccessibilityContext';

interface ReplyComposerProps {
  emailId: number;
  originalContent: string;
  isOpen: boolean;
  onClose: () => void;
  onSend: (content: string) => Promise<void>;
}

export const ReplyComposer: React.FC<ReplyComposerProps> = ({
  emailId,
  originalContent,
  isOpen,
  onClose,
  onSend,
}) => {
  const { preferences } = useAccessibility();
  const [content, setContent] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [confirmationStep, setConfirmationStep] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleTextToSpeech = () => {
    if (content) {
      const utterance = new SpeechSynthesisUtterance(content);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleGetSuggestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/emails/${emailId}/reply-suggestions`);
      if (!response.ok) throw new Error('Failed to get suggestions');
      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (err) {
      setError('Failed to get suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/emails/${emailId}/reply/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          accessibility_preferences: preferences,
        }),
      });

      if (!response.ok) throw new Error('Failed to preview reply');
      
      const data = await response.json();
      setAnalysis(data.analysis);
      setPreviewToken(data.preview_token);
      setConfirmationStep(true);
    } catch (err) {
      setError('Failed to preview reply. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSend = async () => {
    if (!previewToken) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/emails/${emailId}/reply/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          preview_token: previewToken,
          send_now: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to send reply');
      
      await onSend(content);
      onClose();
    } catch (err) {
      setError('Failed to send reply. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: preferences.highContrast ? 'background.default' : 'background.paper',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: preferences.fontSize * 1.2,
          fontWeight: 'bold',
        }}
      >
        Compose Reply
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box mb={2}>
          <Typography
            variant="body2"
            sx={{
              fontSize: preferences.fontSize * 0.875,
              mb: 1,
            }}
          >
            Original Message:
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{
              fontSize: preferences.fontSize * 0.875,
              bgcolor: 'action.hover',
              p: 1,
              borderRadius: 1,
            }}
          >
            {originalContent}
          </Typography>
        </Box>

        <Box mb={2} display="flex" gap={1}>
          <Tooltip title="Text to Speech">
            <IconButton onClick={handleTextToSpeech}>
              <TextToSpeechIcon />
            </IconButton>
          </Tooltip>
          <Button
            size="small"
            onClick={handleGetSuggestions}
            disabled={loading}
          >
            Get Suggestions
          </Button>
        </Box>

        {suggestions.length > 0 && (
          <Box mb={2}>
            <Typography
              variant="subtitle2"
              sx={{
                fontSize: preferences.fontSize,
                mb: 1,
              }}
            >
              Suggestions:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {suggestions.map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion}
                  onClick={() => setContent(suggestion)}
                  sx={{ fontSize: preferences.fontSize * 0.875 }}
                />
              ))}
            </Box>
          </Box>
        )}

        <div ref={contentRef}>
          <TextField
            multiline
            rows={6}
            fullWidth
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your reply..."
            sx={{
              '& .MuiInputBase-input': {
                fontSize: preferences.fontSize,
              },
            }}
          />
        </div>

        {analysis && (
          <Box mt={2}>
            <Typography
              variant="subtitle2"
              sx={{
                fontSize: preferences.fontSize,
                mb: 1,
              }}
            >
              Analysis:
            </Typography>
            <Box display="flex" gap={1}>
              <Chip
                icon={<WarningIcon />}
                label={`Stress Level: ${analysis.stress_level}`}
                color={analysis.stress_level === 'HIGH' ? 'error' : 'default'}
                sx={{ fontSize: preferences.fontSize * 0.875 }}
              />
              {analysis.warnings?.map((warning: string, index: number) => (
                <Chip
                  key={index}
                  label={warning}
                  color="warning"
                  sx={{ fontSize: preferences.fontSize * 0.875 }}
                />
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          sx={{ fontSize: preferences.fontSize * 0.875 }}
        >
          Cancel
        </Button>
        {!confirmationStep ? (
          <Button
            variant="contained"
            onClick={handlePreview}
            disabled={!content || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            sx={{ fontSize: preferences.fontSize * 0.875 }}
          >
            Preview
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirmSend}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <ConfirmIcon />}
            sx={{ fontSize: preferences.fontSize * 0.875 }}
          >
            Confirm & Send
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}; 