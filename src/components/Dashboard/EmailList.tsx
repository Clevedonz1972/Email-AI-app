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
import type { EmailMessage, ActionItem } from '@/types/email';

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
    <List aria-label="Email list">
      {filteredEmails.map((email) => (
        <ListItem
          key={email.id}
          disablePadding
          sx={{ display: 'block', mb: 2 }}
        >
          <EmailItem
            isRead={email.is_read}
            stressLevel={email.stress_level}
            role="article"
            aria-expanded={expandedEmail === email.id}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {email.subject}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  From: {email.sender.name} ({email.sender.email})
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <StressChip
                  level={email.stress_level}
                  label={`${email.stress_level} stress`}
                  size="small"
                />
                <Tooltip title={`Priority: ${email.priority}`}>
                  {getPriorityIcon(email.priority)}
                </Tooltip>
                <IconButton
                  onClick={() => handleExpand(email.id)}
                  aria-label={
                    expandedEmail === email.id
                      ? 'Show less details'
                      : 'Show more details'
                  }
                >
                  {expandedEmail === email.id ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </IconButton>
              </Box>
            </Box>

            <Collapse in={expandedEmail === email.id}>
              <Box mt={2}>
                {email.summary && (
                  <Box mb={2} component="section" aria-label="Email summary">
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      AI Summary
                    </Typography>
                    <Typography variant="body2">{email.summary}</Typography>
                  </Box>
                )}

                {renderActionItems(email)}
              </Box>
            </Collapse>
          </EmailItem>
        </ListItem>
      ))}
    </List>
  );
}; 