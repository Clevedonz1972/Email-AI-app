import React, { memo } from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { EmailTemplate } from '../../types/template';

interface TemplateListProps {
  templates: EmailTemplate[];
  onEditTemplate: (template: EmailTemplate) => void;
  onDeleteTemplate: (templateId: number) => void;
}

export const TemplateList = memo<TemplateListProps>(({
  templates,
  onEditTemplate,
  onDeleteTemplate
}) => {
  if (templates.length === 0) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="textSecondary">
          No email templates yet. Create one to get started!
        </Typography>
      </Paper>
    );
  }

  return (
    <List>
      {templates.map((template) => (
        <ListItem key={template.id}>
          <ListItemText
            primary={template.name}
            secondary={template.subject_template}
          />
          <ListItemSecondaryAction>
            <IconButton 
              edge="end" 
              aria-label="edit"
              onClick={() => onEditTemplate(template)}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => onDeleteTemplate(template.id)}
            >
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
}); 