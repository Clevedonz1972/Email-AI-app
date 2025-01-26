import React from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box
} from '@mui/material';

interface EmailComposeProps {
  open: boolean;
  onClose: () => void;
  onSend: (to: string, subject: string, body: string) => Promise<void>;
}

export const EmailCompose: React.FC<EmailComposeProps> = ({
  open,
  onClose,
  onSend
}) => {
  // Implementation here
}; 