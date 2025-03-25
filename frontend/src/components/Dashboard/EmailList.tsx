import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Collapse, 
  IconButton, 
  Tooltip, 
  Divider, 
  Badge,
  Paper 
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon, 
  ExpandLess as ExpandLessIcon, 
  Error as ErrorIcon 
} from '@mui/icons-material';
import type { EmailMessage, ActionItem } from '../../types/email';
import { ActionItemComponent } from '../ActionItemComponent';

interface EmailListProps {
  emails: EmailMessage[];
  onSelectEmail?: (id: number) => void;
}

const EmailList: React.FC<EmailListProps> = ({ emails, onSelectEmail }) => {
  // State
  const [expandedEmail, setExpandedEmail] = useState<number | null>(null);

  const handleExpand = (id: number) => {
    setExpandedEmail(expandedEmail === id ? null : id);
  };

  if (!emails || emails.length === 0) {
    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography>No emails to display</Typography>
      </Paper>
    );
  }

  return (
    <List>
      {emails.map((email) => (
        <React.Fragment key={email.id}>
          <ListItem 
            onClick={() => onSelectEmail?.(email.id)}
            divider
            sx={{ 
              flexDirection: 'column', 
              alignItems: 'stretch',
              backgroundColor: email.is_read ? 'transparent' : 'action.hover',
              '&:hover': {
                backgroundColor: 'action.hover',
                cursor: 'pointer',
              }
            }}
            role="article"
            aria-expanded={expandedEmail === email.id}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box flex={1}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight={email.is_read ? 'normal' : 'bold'}
                >
                  {email.subject}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  From: {email.sender.name} ({email.sender.email})
                </Typography>
              </Box>
              <Box>
                <Tooltip 
                  title={`Priority: ${email.priority}`}
                >
                  <Badge 
                    color={
                      email.priority === 'HIGH' 
                        ? 'error' 
                        : email.priority === 'MEDIUM' 
                          ? 'warning' 
                          : 'success'
                    } 
                    variant="dot"
                    sx={{ mr: 1 }}
                  >
                    <ErrorIcon color="action" />
                  </Badge>
                </Tooltip>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpand(email.id);
                  }}
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
                    <Typography variant="subtitle2">Summary:</Typography>
                    <Typography variant="body2">{email.summary}</Typography>
                  </Box>
                )}
                
                {email.action_items && email.action_items.length > 0 && (
                  <Box component="section" aria-label="Action items">
                    <Typography variant="subtitle2" gutterBottom>Action Items:</Typography>
                    <List dense>
                      {email.action_items.map((item, index) => (
                        typeof item === 'string' ? (
                          <ListItem key={`${email.id}-action-${index}`}>
                            <ListItemIcon>
                              <Box component="span" sx={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                {index + 1}
                              </Box>
                            </ListItemIcon>
                            <ListItemText primary={item} />
                          </ListItem>
                        ) : (
                          <ActionItemComponent
                            key={`${email.id}-action-${index}`}
                            item={item as ActionItem}
                            index={index}
                            emailId={String(email.id)}
                          />
                        )
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            </Collapse>
          </ListItem>
        </React.Fragment>
      ))}
    </List>
  );
};

export default EmailList; 