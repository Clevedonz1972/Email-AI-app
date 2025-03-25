import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { EmailComposerProps } from '../../types/email';

export const EmailCompose: React.FC<EmailComposerProps> = ({
  onSend,
  onClose,
  defaultRecipient = '',
  defaultSubject = ''
}) => {
  const [recipient, setRecipient] = useState(defaultRecipient);
  const [subject, setSubject] = useState(defaultSubject);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!recipient.trim()) {
      setError("Recipient is required");
      return;
    }
    
    if (!subject.trim()) {
      setError("Subject is required");
      return;
    }
    
    if (!content.trim()) {
      setError("Email content is required");
      return;
    }
    
    try {
      setSending(true);
      await onSend({
        sender: {
          name: 'Current User',
          email: 'user@example.com'
        },
        subject,
        content,
        preview: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        timestamp: new Date().toISOString(),
        priority: 'MEDIUM',
        category: 'sent',
        stress_level: 'LOW',
        sentiment_score: 0
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email');
      setSending(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Dialog open fullWidth maxWidth="md" onClose={onClose}>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Compose Email</Typography>
          <IconButton edge="end" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            fullWidth
            label="To"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="recipient@example.com"
            margin="normal"
            variant="outlined"
            required
          />
          <TextField
            fullWidth
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            margin="normal"
            variant="outlined"
            required
          />
          <TextField
            fullWidth
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            multiline
            rows={12}
            margin="normal"
            variant="outlined"
            required
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSend} 
          color="primary" 
          variant="contained" 
          disabled={sending}
        >
          {sending ? 'Sending...' : 'Send'}
        </Button>
      </DialogActions>
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}; 