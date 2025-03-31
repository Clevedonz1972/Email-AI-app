import React, { useState } from 'react';
import {
  List,
  ListItem,
  Box,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Paper,
  Tooltip,
  useTheme,
  ListItemIcon,
  Divider,
  CardContent,
  Card,
  Badge,
  Button,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ListAltIcon from '@mui/icons-material/ListAlt';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { useNavigate } from 'react-router-dom';
import type { EmailMessage, ActionItem } from '@/types/email';
import ActionButtons from '@/components/shared/ActionButtons';
import { AutoReplyDialog } from '@/components/Email/AutoReplyDialog';

interface EmailListProps {
  emails: readonly EmailMessage[];
  selectedCategory?: string;
  stressFilter?: string;
  isLoading?: boolean;
  onDoItNow?: (emailId: string) => void;
  onDefer?: (emailId: string) => void;
  onAskASTI?: (emailId: string) => void;
  onAutoReply?: (emailId: string) => void;
  onMarkRead?: (id: number) => void;
  onFlag?: (id: number) => void;
  onOpenSpeakToMe?: () => void;
  extraActions?: Array<{
    label: string;
    icon: React.ReactNode;
    action: (emailId: string) => void;
    showIf: (email: EmailMessage) => boolean;
  }>;
}

const EmailItem = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isRead' && prop !== 'stressLevel',
})<{ isRead?: boolean; stressLevel: string }>(({ theme, isRead, stressLevel }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  opacity: isRead ? 0.8 : 1,
  borderLeft: `4px solid ${
    stressLevel === 'high'
      ? theme.palette.error.main
      : stressLevel === 'medium'
      ? theme.palette.warning.main
      : theme.palette.success.main
  }`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateX(4px)',
    boxShadow: theme.shadows[4],
  },
}));

const StressChip = styled(Chip)<{ level: string }>(({ theme, level }) => ({
  marginRight: theme.spacing(1),
  backgroundColor:
    level === 'high'
      ? theme.palette.error.light
      : level === 'medium'
      ? theme.palette.warning.light
      : theme.palette.success.light,
}));

const AiAnalysisCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.light, 0.07),
  borderRadius: theme.shape.borderRadius,
}));

interface ActionItemProps {
  item: ActionItem;
  index: number;
  emailId: number;
}

const ActionItemComponent: React.FC<ActionItemProps> = ({ item, index, emailId }) => (
  <ListItem key={`${emailId}-action-${index}`} sx={{ py: 0.5 }}>
    <ListItemIcon sx={{ minWidth: 36 }}>
      <AssignmentIcon color="action" fontSize="small" />
    </ListItemIcon>
    <Typography variant="body2">{item.description}</Typography>
  </ListItem>
);

export const EmailList: React.FC<EmailListProps> = ({
  emails,
  selectedCategory = 'all',
  stressFilter = 'all',
  isLoading,
  onDoItNow,
  onDefer,
  onAskASTI,
  onAutoReply,
  onMarkRead,
  onFlag,
  onOpenSpeakToMe,
  extraActions,
}) => {
  const theme = useTheme();
  const [expandedEmail, setExpandedEmail] = useState<number | null>(null);
  const navigate = useNavigate();
  const [autoReplyDialogOpen, setAutoReplyDialogOpen] = useState(false);
  const [selectedEmailForReply, setSelectedEmailForReply] = useState<EmailMessage | null>(null);

  const filteredEmails = emails.filter((email) => {
    const categoryMatch =
      selectedCategory === 'all' || email.category === selectedCategory;
    const stressMatch =
      stressFilter === 'all' || email.stress_level === stressFilter;
    return categoryMatch && stressMatch;
  });

  const handleExpand = (emailId: number) => {
    setExpandedEmail(expandedEmail === emailId ? null : emailId);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return <ErrorIcon color="error" />;
      case 'medium':
        return <AccessTimeIcon color="warning" />;
      default:
        return <CheckCircleIcon color="success" />;
    }
  };

  const getEmotionalToneIcon = (tone: string | undefined) => {
    if (!tone) return <SentimentNeutralIcon color="action" />;
    
    // Convert tone to lowercase for comparison
    const lowerTone = tone.toLowerCase();
    
    if (
      lowerTone.includes('positive') || 
      lowerTone.includes('friendly') || 
      lowerTone.includes('happy') ||
      lowerTone.includes('enthusiastic')
    ) {
      return <SentimentSatisfiedAltIcon color="success" />;
    } else if (
      lowerTone.includes('negative') || 
      lowerTone.includes('angry') || 
      lowerTone.includes('urgent') ||
      lowerTone.includes('frustrated')
    ) {
      return <SentimentVeryDissatisfiedIcon color="error" />;
    } else {
      return <SentimentNeutralIcon color="action" />;
    }
  };

  // Action button handlers
  const handleDoItNow = (type: 'email' | 'calendar' | 'task' | 'wellbeing', emailId?: number) => {
    console.log(`Do it now clicked for ${type} with ID: ${emailId}`);
    if (onDoItNow && emailId) {
      onDoItNow(emailId.toString());
    } else if (type === 'email' && emailId) {
      navigate(`/email-detail/${emailId}`);
    }
  };

  const handleDefer = (type: 'email' | 'calendar' | 'task' | 'wellbeing', emailId?: number) => {
    console.log(`Deferring ${type} with ID: ${emailId}`);
    if (onDefer && emailId) {
      onDefer(emailId.toString());
    }
  };

  const handleAskASTI = (type: 'email' | 'calendar' | 'task' | 'wellbeing', emailId?: number) => {
    console.log(`Asking ASTI about ${type} with ID: ${emailId}`);
    if (onAskASTI && emailId) {
      onAskASTI(emailId.toString());
    }
    // Open the SpeakToMe dialog if available
    if (onOpenSpeakToMe) {
      onOpenSpeakToMe();
    }
  };

  const handleAutoReply = (type: 'email' | 'calendar' | 'task' | 'wellbeing', emailId?: number) => {
    console.log(`Auto-replying to ${type} with ID: ${emailId}`);
    if (emailId) {
      const email = emails.find(e => e.id === emailId);
      if (email) {
        setSelectedEmailForReply(email);
        setAutoReplyDialogOpen(true);
      }
    }
    if (onAutoReply && emailId) {
      onAutoReply(emailId.toString());
    }
  };

  const handleSendReply = async (content: string) => {
    console.log(`Sending reply: ${content}`);
    // Here you would typically call an API to send the reply
    // For now, just log it and close the dialog
    return Promise.resolve();
  };

  const renderActionItems = (email: EmailMessage) => {
    if (!email.action_items?.length) return null;
    
    return (
      <Box component="section" aria-label="Action items">
        <Typography variant="subtitle2" color="primary" gutterBottom>
          Action Items
        </Typography>
        <List dense aria-label="Action items list">
          {email.action_items.map((item, index) => (
            <ActionItemComponent
              key={`${email.id}-action-${index}`}
              item={item}
              index={index}
              emailId={email.id}
            />
          ))}
        </List>
      </Box>
    );
  };

  const renderAiAnalysis = (email: EmailMessage) => {
    // Check if AI analysis is available
    const hasAiAnalysis = email.ai_summary || 
                          email.ai_emotional_tone || 
                          (email.ai_suggested_action && Array.isArray(email.ai_suggested_action) && email.ai_suggested_action.length > 0);
    
    if (!hasAiAnalysis) return null;
    
    return (
      <AiAnalysisCard>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <SmartToyIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" color="primary">
              AI Analysis
            </Typography>
          </Box>
          
          {email.ai_summary && (
            <Box mt={1}>
              <Typography variant="subtitle2" color="textSecondary">
                Summary:
              </Typography>
              <Typography variant="body2">{email.ai_summary}</Typography>
            </Box>
          )}
          
          {email.ai_emotional_tone && (
            <Box mt={1} sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mr: 1 }}>
                Emotional Tone:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getEmotionalToneIcon(email.ai_emotional_tone)}
                <Typography variant="body2" sx={{ ml: 0.5 }}>
                  {email.ai_emotional_tone}
                </Typography>
              </Box>
            </Box>
          )}
          
          {email.ai_suggested_action && Array.isArray(email.ai_suggested_action) && email.ai_suggested_action.length > 0 && (
            <Box mt={1}>
              <Typography variant="subtitle2" color="textSecondary">
                Suggested Action:
              </Typography>
              {email.ai_suggested_action.map((action, idx) => (
                <Chip 
                  key={`${email.id}-suggested-${idx}`}
                  label={action}
                  size="small"
                  color="primary"
                  variant="outlined"
                  icon={<FlashOnIcon />}
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ))}
            </Box>
          )}
        </CardContent>
      </AiAnalysisCard>
    );
  };

  // Render extra custom actions
  const renderExtraActions = (email: EmailMessage) => {
    if (!extraActions || extraActions.length === 0) return null;
    
    return (
      <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {extraActions.map((action, index) => (
          action.showIf(email) && (
            <Tooltip key={`extra-action-${index}`} title={action.label}>
              <IconButton 
                size="small"
                onClick={() => action.action(email.id.toString())}
                color="primary"
              >
                {action.icon}
              </IconButton>
            </Tooltip>
          )
        ))}
      </Box>
    );
  };

  if (filteredEmails.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="body1" color="textSecondary">
          No emails found matching your filters
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <List sx={{ width: '100%', padding: 0 }}>
        {filteredEmails.length === 0 ? (
          <Typography variant="body1" align="center" sx={{ py: 4 }}>
            No emails found matching your criteria.
          </Typography>
        ) : (
          filteredEmails.map((email) => (
            <EmailItem
              key={email.id}
              isRead={email.is_read}
              stressLevel={email.stress_level.toUpperCase()}
            >
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box flex={1}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Tooltip title={`Priority: ${email.priority}`}>
                      <Box mr={1}>{getPriorityIcon(email.priority || 'low')}</Box>
                    </Tooltip>
                    <Typography variant="subtitle1" component="h3">
                      {email.subject}
                    </Typography>
                    {!email.is_read && (
                      <Badge 
                        color="primary" 
                        variant="dot" 
                        sx={{ ml: 2 }}
                      />
                    )}
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" color="textSecondary" mr={1}>
                      From:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {email.sender.name} &lt;{email.sender.email}&gt;
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" color="textSecondary" mr={1}>
                      Received:
                    </Typography>
                    <Typography variant="body2">
                      {new Date(email.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography 
                      variant="body1" 
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: expandedEmail === email.id ? 'unset' : 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 1
                      }}
                    >
                      {email.content}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => handleExpand(email.id)}
                      endIcon={expandedEmail === email.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      sx={{ mb: 1 }}
                    >
                      {expandedEmail === email.id ? 'Show less' : 'Show more'}
                    </Button>
                  </Box>
                  
                  <Box display="flex" flexWrap="wrap" mt={1}>
                    <StressChip
                      level={email.stress_level || 'low'}
                      label={`Stress: ${email.stress_level || 'Low'}`}
                      size="small"
                      icon={
                        email.stress_level === 'HIGH' ? (
                          <SentimentVeryDissatisfiedIcon fontSize="small" />
                        ) : email.stress_level === 'MEDIUM' ? (
                          <SentimentNeutralIcon fontSize="small" />
                        ) : (
                          <SentimentSatisfiedAltIcon fontSize="small" />
                        )
                      }
                    />
                    
                    {(email as any).needs_immediate_attention && (
                      <Chip
                        label="Urgent"
                        size="small"
                        color="error"
                        sx={{ mr: 1 }}
                      />
                    )}
                    
                    {email.action_required && (
                      <Chip
                        label="Action Required"
                        size="small"
                        color="warning"
                        icon={<AssignmentIcon />}
                        sx={{ mr: 1 }}
                      />
                    )}
                  </Box>
                </Box>
                
                <Box>
                  <ActionButtons
                    type="email"
                    onDoItNow={(type) => handleDoItNow(type, email.id)}
                    onDefer={(type) => handleDefer(type, email.id)}
                    onAskASTI={(type) => handleAskASTI(type, email.id)}
                    onAutoReply={(type) => handleAutoReply(type, email.id)}
                    vertical
                  />
                  {/* Render extra custom actions */}
                  {renderExtraActions(email)}
                </Box>
              </Box>

              <Collapse in={expandedEmail === email.id} timeout="auto" unmountOnExit>
                <Box mt={2} sx={{ borderTop: `1px solid ${theme.palette.divider}`, pt: 2 }}>
                  {/* Render action items if available */}
                  {renderActionItems(email)}
                  
                  {/* AI analysis card */}
                  {renderAiAnalysis(email)}
                  
                  {/* Suggested response if available */}
                  {(email as any).suggested_response && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Suggested Response
                      </Typography>
                      <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.background.default, 0.7) }}>
                        <Typography variant="body2">{(email as any).suggested_response}</Typography>
                      </Paper>
                    </Box>
                  )}
                </Box>
              </Collapse>
            </EmailItem>
          ))
        )}
      </List>
      
      {selectedEmailForReply && (
        <AutoReplyDialog
          open={autoReplyDialogOpen}
          onClose={() => setAutoReplyDialogOpen(false)}
          email={selectedEmailForReply}
          onSendReply={handleSendReply}
        />
      )}
    </>
  );
}; 