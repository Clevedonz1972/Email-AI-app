import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Paper,
  Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { EmailTemplate } from '@/types/template';

interface TemplateListProps {
  templates: EmailTemplate[];
  onEdit: (template: EmailTemplate) => void;
  onDelete: (templateId: string) => Promise<void>;
}

export const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  onEdit,
  onDelete
}) => {
  if (templates.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography color="textSecondary">
          No templates available. Create one to get started.
        </Typography>
      </Box>
    );
  }

  return (
    <Paper>
      <List>
        {templates.map((template) => (
          <ListItem key={template.id} divider>
            <ListItemText
              primary={template.name}
              secondary={template.subject}
              secondaryTypographyProps={{
                sx: {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }
              }}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => onEdit(template)}
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => onDelete(template.id)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}; 