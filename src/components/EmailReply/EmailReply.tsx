import React, { useState } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAI } from '../../hooks/useAI';

interface EmailReplyProps {
  open: boolean;
  onClose: () => void;
  originalEmail: {
    subject: string;
    content: string;
    sender: string;
  };
  onSend: (reply: string) => Promise<void>;
}

export const EmailReply: React.FC<EmailReplyProps> = ({
  open,
  onClose,
  originalEmail,
  onSend
}) => {
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);
  const { generateReply, loading, error } = useAI();

  const handleGenerateReply = async () => {
    const suggestion = await generateReply(originalEmail.content);
    if (suggestion) {
      setReplyContent(suggestion);
    }
  };

  const handleSend = async () => {
    setSending(true);
    try {
      await onSend(replyContent);
      onClose();
    } catch (err) {
      console.error('Failed to send email:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Reply to: {originalEmail.subject}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          multiline
          rows={8}
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          fullWidth
          variant="outlined"
          placeholder="Type your reply here..."
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleGenerateReply}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Generate Reply
        </Button>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSend}
          variant="contained"
          disabled={sending || !replyContent}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 