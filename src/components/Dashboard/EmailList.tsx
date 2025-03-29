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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNavigate } from 'react-router-dom';
import type { EmailMessage, ActionItem } from '@/types/email';
import ActionButtons from '@/components/shared/ActionButtons';

interface EmailListProps {
  emails: readonly EmailMessage[];
  selectedCategory: string;
  stressFilter: string;
  isLoading?: boolean;
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
  selectedCategory,
  stressFilter,
  isLoading,
}) => {
  const theme = useTheme();
  const [expandedEmail, setExpandedEmail] = useState<number | null>(null);
  const navigate = useNavigate();

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

  // Action button handlers
  const handleDoItNow = (type: 'email' | 'calendar' | 'task' | 'wellbeing', emailId?: number) => {
    console.log(`Do it now clicked for ${type} with ID: ${emailId}`);
    if (type === 'email' && emailId) {
      navigate(`/email-detail/${emailId}`);
    }
  };

  const handleDefer = (type: 'email' | 'calendar' | 'task' | 'wellbeing', emailId?: number) => {
    console.log(`Deferring ${type} with ID: ${emailId}`);
    // Implementation for deferring emails
  };

  const handleAskASTI = (type: 'email' | 'calendar' | 'task' | 'wellbeing', emailId?: number) => {
    console.log(`Asking ASTI about ${type} with ID: ${emailId}`);
    // Implementation for asking ASTI about emails
  };

  const handleAutoReply = (type: 'email' | 'calendar' | 'task' | 'wellbeing', emailId?: number) => {
    console.log(`Auto-replying to ${type} with ID: ${emailId}`);
    // Implementation for auto-replying to emails
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
    <Box>
      {filteredEmails.map((email) => (
        <EmailItem
          key={email.id}
          isRead={email.is_read}
          stressLevel={email.stress_level.toLowerCase()}
        >
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Box display="flex" alignItems="center" mb={1}>
                <StressChip
                  level={email.stress_level.toLowerCase()}
                  label={`${email.stress_level} Stress`}
                  size="small"
                />
                <Chip
                  icon={getPriorityIcon(email.priority)}
                  label={`${email.priority} Priority`}
                  size="small"
                  variant="outlined"
                />
              </Box>
              <Typography variant="h6" component="h3">
                {email.subject}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                From: {email.sender.name} ({email.sender.email})
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <ActionButtons 
                type="email"
                onDoItNow={(type) => handleDoItNow(type, email.id)}
                onDefer={(type) => handleDefer(type, email.id)}
                onAskASTI={(type) => handleAskASTI(type, email.id)}
                onAutoReply={(type) => handleAutoReply(type, email.id)}
                showAutoReply={true}
                size="small"
              />
              <IconButton
                onClick={() => handleExpand(email.id)}
                aria-expanded={expandedEmail === email.id}
                aria-label="show more"
              >
                {expandedEmail === email.id ? (
                  <ExpandLessIcon />
                ) : (
                  <ExpandMoreIcon />
                )}
              </IconButton>
            </Box>
          </Box>

          <Collapse in={expandedEmail === email.id} timeout="auto" unmountOnExit>
            <Box mt={2}>
              <Typography variant="body1">{email.content}</Typography>
              {renderActionItems(email)}
            </Box>
          </Collapse>
        </EmailItem>
      ))}
    </Box>
  );
}; 