import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import { EmailTemplate, TemplateVariable } from '../../types/template';
import TemplateService from '../../services/templateService';

interface TemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (subject: string, content: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  open,
  onClose,
  onSelect
}) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await TemplateService.getTemplates();
      setTemplates(data);
      setError(null);
    } catch (err) {
      setError('Failed to load templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    // Initialize variables
    const initialVariables: Record<string, string> = {};
    template.variables.forEach(v => {
      initialVariables[v.name] = '';
    });
    setVariables(initialVariables);
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplate) return;

    let subject = selectedTemplate.subject_template;
    let content = selectedTemplate.content_template;

    // Replace variables in subject and content
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value);
      content = content.replace(regex, value);
    });

    onSelect(subject, content);
    onClose();
  };

  const isValid = () => {
    if (!selectedTemplate) return false;
    return selectedTemplate.variables.every(v => 
      !v.required || (variables[v.name] && variables[v.name].trim() !== '')
    );
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Select Email Template</DialogTitle>
      <DialogContent>
        {error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Box display="flex" gap={2}>
            <List sx={{ width: '40%', borderRight: 1, borderColor: 'divider' }}>
              {templates.map((template) => (
                <ListItem
                  key={template.id}
                  button
                  selected={selectedTemplate?.id === template.id}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <ListItemText
                    primary={template.name}
                    secondary={template.subject_template}
                  />
                </ListItem>
              ))}
            </List>
            {selectedTemplate && (
              <Box sx={{ width: '60%', p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Template Variables
                </Typography>
                {selectedTemplate.variables.map((variable) => (
                  <TextField
                    key={variable.name}
                    label={variable.description}
                    value={variables[variable.name] || ''}
                    onChange={(e) => setVariables({
                      ...variables,
                      [variable.name]: e.target.value
                    })}
                    required={variable.required}
                    fullWidth
                    margin="normal"
                  />
                ))}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleApplyTemplate}
          disabled={!isValid()}
          variant="contained"
          color="primary"
        >
          Apply Template
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 