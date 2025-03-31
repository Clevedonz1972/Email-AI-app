import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Tab,
  Tabs,
  CircularProgress,
  Paper,
  Tooltip,
  Alert,
  IconButton
} from '@mui/material';
import { 
  Info as InfoIcon,
  Psychology as PsychologyIcon,
  TheaterComedy as MasksIcon,
  SelfImprovement as AuthenticIcon,
  Bedtime as GentleIcon
} from '@mui/icons-material';
import { EmailMessage } from '@/types/email';
import { aiService, ReplyStyle, EmailReplyOptions } from '@/services/aiService';

interface AutoReplyDialogProps {
  open: boolean;
  onClose: () => void;
  email: EmailMessage;
  onSendReply: (content: string) => Promise<void>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab panel component for accessibility
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reply-tabpanel-${index}`}
      aria-labelledby={`reply-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const AutoReplyDialog: React.FC<AutoReplyDialogProps> = ({
  open,
  onClose,
  email,
  onSendReply
}) => {
  const [loading, setLoading] = useState(true);
  const [replyOptions, setReplyOptions] = useState<EmailReplyOptions & { gentle?: string }>({
    full: '',
    brief: '',
    needTime: '',
    gentle: ''
  });
  const [customizedReply, setCustomizedReply] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [replyStyle, setReplyStyle] = useState<ReplyStyle>('authentic');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Generate reply options when dialog opens or style changes
  useEffect(() => {
    const generateOptions = async () => {
      if (!open) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Use the aiService to generate reply options
        const options = await aiService.generateEmailReplyOptions(
          {
            sender: email.sender,
            subject: email.subject,
            content: email.content
          },
          replyStyle
        );
        
        // Add gentle placeholder option
        const gentlePrompt = `
          I need to acknowledge receipt of this email but I'm not ready to respond yet:
          From: ${email.sender.name} (${email.sender.email})
          Subject: ${email.subject}
          
          Write a gentle, kind placeholder response that:
          1. Acknowledges I've seen their email
          2. Asks for more time in a non-apologetic way
          3. Sets clear boundaries about response time
          4. Shows appreciation while protecting my mental energy
          
          Keep it under 5 sentences and be direct but warm.
        `;
        
        // Get gentle placeholder text
        const gentleResponse = await aiService.sendMessage(gentlePrompt, []);
        
        // Store all options
        const enhancedOptions = {
          ...options,
          gentle: gentleResponse.text
        };
        
        setReplyOptions(enhancedOptions);
        setCustomizedReply(enhancedOptions.full); // Default to the full reply
      } catch (error) {
        console.error('Error generating reply options:', error);
        setError('Failed to generate reply options. Please try again.');
        
        // Set fallback options
        const fallbackOptions = {
          full: `Hi ${email.sender.name},\n\nThank you for your email. I will respond in detail soon.\n\nBest regards,\n[Your Name]`,
          brief: `Hi ${email.sender.name},\n\nGot it, thanks!\n\n[Your Name]`,
          needTime: `Hi ${email.sender.name},\n\nI've received your email and need some time to respond properly. I'll get back to you soon.\n\n[Your Name]`,
          gentle: `Hi ${email.sender.name},\n\nI've seen your email and appreciate you reaching out. I need to give this proper thought, so I'll respond once I have the mental bandwidth to do so properly. Thanks for understanding.\n\n[Your Name]`
        };
        
        setReplyOptions(fallbackOptions);
        setCustomizedReply(fallbackOptions.full);
      } finally {
        setLoading(false);
      }
    };
    
    generateOptions();
  }, [open, email, replyStyle]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Update customized reply based on selected tab
    if (newValue === 0) setCustomizedReply(replyOptions.full);
    if (newValue === 1) setCustomizedReply(replyOptions.brief);
    if (newValue === 2) setCustomizedReply(replyOptions.needTime);
    if (newValue === 3) setCustomizedReply(replyOptions.gentle || replyOptions.needTime);
  };
  
  const handleSendReply = async () => {
    if (!customizedReply.trim()) return;
    
    setSending(true);
    setError(null);
    
    try {
      // Store this reply in context memory
      aiService.rememberContext({
        type: 'email',
        id: `email-reply-${Date.now()}`,
        content: `Replied to ${email.sender.name} about "${email.subject}" using ${getStyleName(replyStyle)} tone: ${customizedReply.substring(0, 100)}...`,
        metadata: {
          replyStyle,
          emailId: email.id,
          sender: email.sender,
          subject: email.subject
        }
      });
      
      // In a real app, you would use aiService.sendEmailReply here
      console.log(`Sending reply to: ${email.sender.email}`);
      console.log(`Subject: Re: ${email.subject}`);
      console.log(`Content: ${customizedReply}`);
      console.log(`Style: ${replyStyle}`);
      
      await onSendReply(customizedReply);
      onClose();
    } catch (error) {
      console.error('Error sending reply:', error);
      setError('Failed to send reply. Please try again.');
    } finally {
      setSending(false);
    }
  };
  
  const handleStyleChange = (style: ReplyStyle) => {
    setReplyStyle(style);
  };
  
  // Get human-readable name for the style
  const getStyleName = (style: ReplyStyle): string => {
    switch (style) {
      case 'simple': return 'Cognitive Ease';
      case 'masked': return 'Professional Masking';
      case 'authentic': return 'Authentic You';
      default: return style;
    }
  };
  
  // Style explanation tooltips
  const getStyleExplanation = (style: ReplyStyle): string => {
    switch (style) {
      case 'simple':
        return 'Simple, easy-to-process language that minimizes cognitive load, perfect for when you want clarity without mental strain.';
      case 'masked':
        return 'Conventionally professional language that matches neurotypical expectations in formal contexts.';
      case 'authentic':
        return 'Your natural communication style, honoring your authentic voice and preferences.';
      default:
        return '';
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Auto-Reply to: {email.subject}
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {/* Email summary */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
              <Typography variant="subtitle2" color="text.secondary">From: {email.sender.name} ({email.sender.email})</Typography>
              <Typography variant="subtitle1" gutterBottom>{email.subject}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ 
                maxHeight: '100px', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis' 
              }}>
                {email.content.slice(0, 200)}...
              </Typography>
            </Paper>
            
            {/* Reply style selector */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                Select your communication style:
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Tooltip title={getStyleExplanation('authentic')}>
                  <Button 
                    variant={replyStyle === 'authentic' ? 'contained' : 'outlined'}
                    onClick={() => handleStyleChange('authentic')}
                    startIcon={<AuthenticIcon />}
                    sx={{ flex: '1 1 auto', minWidth: '180px' }}
                  >
                    🧠 Authentic You
                  </Button>
                </Tooltip>
                <Tooltip title={getStyleExplanation('masked')}>
                  <Button 
                    variant={replyStyle === 'masked' ? 'contained' : 'outlined'}
                    onClick={() => handleStyleChange('masked')}
                    startIcon={<MasksIcon />}
                    sx={{ flex: '1 1 auto', minWidth: '180px' }}
                  >
                    🎭 Professional Masking
                  </Button>
                </Tooltip>
                <Tooltip title={getStyleExplanation('simple')}>
                  <Button 
                    variant={replyStyle === 'simple' ? 'contained' : 'outlined'}
                    onClick={() => handleStyleChange('simple')}
                    startIcon={<PsychologyIcon />}
                    sx={{ flex: '1 1 auto', minWidth: '180px' }}
                  >
                    💬 Cognitive Ease
                  </Button>
                </Tooltip>
              </Box>
            </Box>
            
            {/* Reply options tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                aria-label="reply options"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Full Reply" id="reply-tab-0" aria-controls="reply-tabpanel-0" />
                <Tab label="Brief Acknowledgment" id="reply-tab-1" aria-controls="reply-tabpanel-1" />
                <Tab label="Need More Time" id="reply-tab-2" aria-controls="reply-tabpanel-2" />
                <Tab label="Gentle Placeholder" id="reply-tab-3" aria-controls="reply-tabpanel-3" />
              </Tabs>
            </Box>
            
            <TabPanel value={activeTab} index={0}>
              <TextField
                label="Customized Reply"
                multiline
                fullWidth
                rows={8}
                value={customizedReply}
                onChange={(e) => setCustomizedReply(e.target.value)}
                variant="outlined"
              />
            </TabPanel>
            
            <TabPanel value={activeTab} index={1}>
              <TextField
                label="Brief Acknowledgment"
                multiline
                fullWidth
                rows={4}
                value={customizedReply}
                onChange={(e) => setCustomizedReply(e.target.value)}
                variant="outlined"
              />
            </TabPanel>
            
            <TabPanel value={activeTab} index={2}>
              <TextField
                label="Need More Time"
                multiline
                fullWidth
                rows={4}
                value={customizedReply}
                onChange={(e) => setCustomizedReply(e.target.value)}
                variant="outlined"
              />
            </TabPanel>
            
            <TabPanel value={activeTab} index={3}>
              <TextField
                label="Gentle Placeholder"
                multiline
                fullWidth
                rows={4}
                value={customizedReply}
                onChange={(e) => setCustomizedReply(e.target.value)}
                variant="outlined"
              />
            </TabPanel>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={sending}>
          Cancel
        </Button>
        <Button 
          onClick={handleSendReply} 
          color="primary" 
          variant="contained"
          disabled={loading || sending || !customizedReply.trim()}
        >
          {sending ? 'Sending...' : 'Send Reply'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 