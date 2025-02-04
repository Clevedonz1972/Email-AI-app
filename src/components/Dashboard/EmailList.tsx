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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface Email {
  id: string;
  subject: string;
  sender: string;
  preview: string;
  timestamp: string;
  priority: string;
  stress_level: string;
  category: string;
  is_read: boolean;
  ai_summary?: string;
  action_items?: string[];
}

interface EmailListProps {
  emails: Email[];
  selectedCategory: string;
  stressFilter: string;
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

export const EmailList: React.FC<EmailListProps> = ({
  emails,
  selectedCategory,
  stressFilter,
}) => {
  const theme = useTheme();
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  const filteredEmails = emails.filter((email) => {
    const categoryMatch =
      selectedCategory === 'all' || email.category === selectedCategory;
    const stressMatch =
      stressFilter === 'all' || email.stress_level === stressFilter;
    return categoryMatch && stressMatch;
  });

  const handleExpand = (emailId: string) => {
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
                  From: {email.sender}
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
                {email.ai_summary && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="primary">
                      AI Summary
                    </Typography>
                    <Typography variant="body2">{email.ai_summary}</Typography>
                  </Box>
                )}

                {email.action_items && email.action_items.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="primary">
                      Action Items
                    </Typography>
                    <List dense>
                      {email.action_items.map((item, index) => (
                        <ListItem key={index}>
                          <Typography variant="body2">• {item}</Typography>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            </Collapse>
          </EmailItem>
        </ListItem>
      ))}
    </List>
  );
}; 