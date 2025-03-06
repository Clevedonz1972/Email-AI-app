import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Popover,
  Typography,
  Button,
  TextField,
  Rating,
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Report as ReportIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAccessibility } from '../../contexts/AccessibilityContext';

interface QuickFeedbackProps {
  emailId?: number;
  suggestionId?: string;
  feedbackType: 'suggestion' | 'stress_level' | 'accessibility';
  onFeedbackSubmit?: (feedback: any) => Promise<void>;
}

export const QuickFeedback: React.FC<QuickFeedbackProps> = ({
  emailId,
  suggestionId,
  feedbackType,
  onFeedbackSubmit,
}) => {
  const { preferences } = useAccessibility();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleQuickFeedback = async (isPositive: boolean) => {
    try {
      await fetch('/api/feedback/quick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: feedbackType,
          emailId,
          suggestionId,
          isPositive,
          timestamp: new Date().toISOString(),
        }),
      });

      setSnackbarMessage('Thank you for your feedback!');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSnackbarMessage('Failed to submit feedback. Please try again.');
      setSnackbarOpen(true);
    }
  };

  const handleDetailedFeedback = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setFeedback('');
    setRating(null);
  };

  const handleSubmitDetailedFeedback = async () => {
    try {
      await fetch('/api/feedback/detailed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: feedbackType,
          emailId,
          suggestionId,
          feedback,
          rating,
          timestamp: new Date().toISOString(),
        }),
      });

      if (onFeedbackSubmit) {
        await onFeedbackSubmit({
          feedback,
          rating,
          type: feedbackType,
        });
      }

      handleClosePopover();
      setSnackbarMessage('Thank you for your detailed feedback!');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error submitting detailed feedback:', error);
      setSnackbarMessage('Failed to submit feedback. Please try again.');
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Tooltip title="Helpful">
          <IconButton
            onClick={() => handleQuickFeedback(true)}
            size="small"
            sx={{ fontSize: preferences.fontSize * 0.875 }}
          >
            <ThumbUp fontSize="inherit" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Not Helpful">
          <IconButton
            onClick={() => handleQuickFeedback(false)}
            size="small"
            sx={{ fontSize: preferences.fontSize * 0.875 }}
          >
            <ThumbDown fontSize="inherit" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Report Issue">
          <IconButton
            onClick={handleDetailedFeedback}
            size="small"
            sx={{ fontSize: preferences.fontSize * 0.875 }}
          >
            <ReportIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </Box>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, width: 300 }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: preferences.fontSize,
              mb: 2,
            }}
          >
            Provide Detailed Feedback
          </Typography>
          <Rating
            value={rating}
            onChange={(_, newValue) => setRating(newValue)}
            sx={{ mb: 2 }}
          />
          <TextField
            multiline
            rows={4}
            fullWidth
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Please describe the issue..."
            sx={{
              mb: 2,
              '& .MuiInputBase-input': {
                fontSize: preferences.fontSize * 0.875,
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={handleClosePopover}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSubmitDetailedFeedback}
              disabled={!feedback && !rating}
            >
              Submit
            </Button>
          </Box>
        </Box>
      </Popover>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{
            width: '100%',
            fontSize: preferences.fontSize * 0.875,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}; 