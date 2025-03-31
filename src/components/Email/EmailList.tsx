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
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Error as HighStressIcon,
  Warning as MediumStressIcon,
  CheckCircle as LowStressIcon,
  Star as PriorityIcon,
  Mail as UnreadIcon,
  MailOutline as ReadIcon,
  Reply as ReplyIcon,
  AutoAwesome as AIIcon,
  Send as SendIcon,
  Edit as EditIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { emailService } from '../../services/emailService';
import type { EmailMessage } from '@/types/email';
import { useDashboardContext } from '@/contexts/DashboardContext';

interface EmailListProps {
  emails: EmailMessage[];
  loading: boolean;
  onSelectEmail: (email: EmailMessage) => void;
  onMarkRead: (id: number) => void;
  selectedEmailId?: number;
  onSendReply?: (emailId: number, content: string) => Promise<void>;
  onOpenSpeakToMe?: () => void;
}

export const EmailList: React.FC<EmailListProps> = ({
  emails,
  loading,
  onSelectEmail,
  onMarkRead,
  selectedEmailId,
  onSendReply,
  onOpenSpeakToMe
}) => {
  const { preferences } = useAccessibility();
  const { openSpeakToMe } = useDashboardContext();
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  
  // Quick Reply state
  const [quickReplyEmail, setQuickReplyEmail] = useState<EmailMessage | null>(null);
  const [replyAnchorEl, setReplyAnchorEl] = useState<null | HTMLElement>(null);
  const [replyOptions, setReplyOptions] = useState<string[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [customReplyOpen, setCustomReplyOpen] = useState(false);
  const [customReplyText, setCustomReplyText] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  
  // Update selected index when selectedEmailId changes
  useEffect(() => {
    if (selectedEmailId) {
      const index = emails.findIndex(email => email.id === selectedEmailId);
      if (index !== -1) {
        setSelectedIndex(index);
      }
    }
  }, [selectedEmailId, emails]);

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

  const handleQuickReply = (event: React.MouseEvent<HTMLButtonElement>, email: EmailMessage) => {
    event.stopPropagation(); // Prevent triggering the ListItem onClick
    setQuickReplyEmail(email);
    setReplyAnchorEl(event.currentTarget);
    setIsLoadingReplies(true);
    setReplyOptions([]);
    
    // Generate quick reply options
    generateReplyOptions(email.id)
      .then(() => {
        setIsLoadingReplies(false);
      })
      .catch(error => {
        console.error('Error generating reply options:', error);
        setIsLoadingReplies(false);
        setSnackbar({
          open: true,
          message: 'Failed to generate reply options',
          severity: 'error'
        });
      });
  };

  const generateReplyOptions = async (emailId: number) => {
    try {
      const options = await emailService.getReplyOptions(emailId);
      if (options.suggestions && options.suggestions.length > 0) {
        // Extract just the content from the suggestions
        const replies = options.suggestions.map((option: any) => option.content || option);
        setReplyOptions(replies);
      } else if (options.simplified_version) {
        setReplyOptions([options.simplified_version]);
      } else {
        // Fallback options if no AI suggestions
        setReplyOptions([
          "Thank you for your email. I'll get back to you as soon as possible.",
          "I've received your email and will review it shortly.",
          "Thanks for reaching out. I'll respond after reviewing the details."
        ]);
      }
    } catch (error) {
      console.error('Error getting reply options:', error);
      throw error;
    }
  };

  const handleMenuClose = () => {
    setReplyAnchorEl(null);
  };

  const handleCustomReply = () => {
    handleMenuClose();
    if (quickReplyEmail) {
      // Initialize with the first reply option or empty string
      setCustomReplyText(replyOptions.length > 0 ? replyOptions[0] : '');
      setCustomReplyOpen(true);
    }
  };

  const handleSendReply = async (replyText: string) => {
    if (!quickReplyEmail) return;
    
    try {
      // Call the onSendReply prop if available
      if (onSendReply) {
        await onSendReply(quickReplyEmail.id, replyText);
      }
      
      // Mark as read
      onMarkRead(quickReplyEmail.id);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Reply sent successfully!',
        severity: 'success'
      });
      
      // Close menu
      handleMenuClose();
      setCustomReplyOpen(false);
    } catch (error) {
      console.error('Error sending reply:', error);
      setSnackbar({
        open: true,
        message: 'Failed to send reply',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

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

  // Add email templates for common scenarios
  const emailTemplates = [
    {
      name: "Meeting Acceptance",
      content: "Thank you for the invitation. I'd be happy to attend the meeting at the specified time. I've added it to my calendar."
    },
    {
      name: "Need More Time",
      content: "Thank you for your email. I'll need some additional time to process this information and respond properly. I'll get back to you by the end of the week."
    },
    {
      name: "Quick Acknowledgment",
      content: "I've received your email and will review the information. Thank you for keeping me updated."
    },
    {
      name: "Request Clarification",
      content: "Thank you for your email. Could you please provide more details about [specific point]? This will help me better understand your request."
    },
    {
      name: "Not Interested",
      content: "Thank you for reaching out. At this time, I'm not interested in pursuing this opportunity further. I appreciate your consideration."
    }
  ];

  const [templateMenuAnchor, setTemplateMenuAnchor] = useState<null | HTMLElement>(null);
  
  const handleTemplateMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setTemplateMenuAnchor(event.currentTarget);
  };
  
  const handleTemplateMenuClose = () => {
    setTemplateMenuAnchor(null);
  };
  
  const handleTemplateSelect = (content: string) => {
    if (quickReplyEmail) {
      handleSendReply(content);
    }
    handleTemplateMenuClose();
  };

  // Handle Ask ASTI
  const handleAskASTI = (event: React.MouseEvent<HTMLElement>, email: EmailMessage) => {
    event.stopPropagation();
    console.log(`Asking ASTI about email ${email.id}`);
    
    // Use the prop if available, otherwise use the context
    if (onOpenSpeakToMe) {
      onOpenSpeakToMe();
    } else {
      openSpeakToMe();
    }
  };

  const renderEmailItem = (email: EmailMessage, index: number) => (
    <ListItem
      key={email.id}
      selected={selectedEmailId ? email.id === selectedEmailId : index === selectedIndex}
      onClick={() => {
        setSelectedIndex(index);
        onSelectEmail(email);
      }}
      sx={{
        mb: 1,
        borderRadius: 1,
        transition: preferences.reducedMotion ? 'none' : 'all 0.2s ease',
        cursor: 'pointer',
        backgroundColor: theme => {
          if (selectedEmailId && email.id === selectedEmailId) {
            return theme.palette.action.selected;
          }
          return preferences.highContrast 
            ? email.is_read 
              ? theme.palette.background.paper
              : theme.palette.primary.light
            : 'inherit';
        },
        '&:hover': {
          backgroundColor: 'action.hover',
        },
        ...(email.stress_level === 'HIGH' && {
          borderLeft: theme => `4px solid ${theme.palette.error.main}`,
        }),
      }}
      secondaryAction={
        <Tooltip title="Quick Reply">
          <IconButton 
            edge="end" 
            aria-label="quick reply"
            onClick={(e) => handleQuickReply(e, email)}
            size="small"
          >
            <ReplyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      }
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
    </ListItem>
  );

  return (
    <Paper 
      elevation={1}
      sx={{ 
        p: 2, 
        overflowY: 'auto',
        borderRadius: 2, 
        height: '70vh',
        minHeight: 400,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        Inbox
        <Chip 
          label={`${emails.filter(e => !e.is_read).length} unread`} 
          size="small" 
          sx={{ ml: 1 }}
        />
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : emails.length === 0 ? (
        <Typography variant="body1" align="center" sx={{ p: 4, color: 'text.secondary' }}>
          No emails found
        </Typography>
      ) : (
        <List>
          {emails.map(renderEmailItem)}
        </List>
      )}

      {/* Quick Reply Menu */}
      <Menu
        anchorEl={replyAnchorEl}
        open={Boolean(replyAnchorEl)}
        onClose={handleMenuClose}
      >
        {isLoadingReplies ? (
          <MenuItem disabled>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Generating AI replies...
          </MenuItem>
        ) : (
          <>
            {replyOptions.map((option, index) => (
              <MenuItem 
                key={index} 
                onClick={() => handleSendReply(option)}
                sx={{ maxWidth: 350 }}
              >
                <Box display="flex" alignItems="center">
                  <AIIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography noWrap>{option.substring(0, 40)}...</Typography>
                </Box>
              </MenuItem>
            ))}
            <MenuItem onClick={handleTemplateMenuOpen}>
              <Box display="flex" alignItems="center">
                <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography>Use Template...</Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleCustomReply}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Edit reply...
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Templates Menu */}
      <Menu
        anchorEl={templateMenuAnchor}
        open={Boolean(templateMenuAnchor)}
        onClose={handleTemplateMenuClose}
      >
        {emailTemplates.map((template, index) => (
          <MenuItem 
            key={index} 
            onClick={() => handleTemplateSelect(template.content)}
          >
            <Typography variant="body2" fontWeight="bold">{template.name}</Typography>
          </MenuItem>
        ))}
      </Menu>

      {/* Custom Reply Dialog */}
      <Dialog 
        open={customReplyOpen} 
        onClose={() => setCustomReplyOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit AI-Generated Reply</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            You can edit the AI-suggested reply below before sending.
          </DialogContentText>
          <TextField
            multiline
            rows={6}
            fullWidth
            value={customReplyText}
            onChange={(e) => setCustomReplyText(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomReplyOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleSendReply(customReplyText)} 
            variant="contained" 
            color="primary"
            startIcon={<SendIcon />}
            disabled={!customReplyText.trim()}
          >
            Send Reply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}; 