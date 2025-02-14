import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import type { EmailTemplate } from '@/types/template';

interface TemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (subject: string, content: string) => void;
  templates: EmailTemplate[];
  selectedTemplate?: EmailTemplate;
  onTemplateSelect: (template: EmailTemplate) => void;
  loading?: boolean;
  error?: string | null;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  open,
  onClose,
  onSelect,
  templates,
  selectedTemplate,
  onTemplateSelect,
  loading = false,
  error = null
}) => {
  const [variables, setVariables] = useState<Record<string, string>>({});

  const handleTemplateSelect = (template: EmailTemplate) => {
    onTemplateSelect(template);
    // Initialize variables
    const initialVariables: Record<string, string> = {};
    template.variables.forEach(variableName => {
      initialVariables[variableName] = '';  // Use string directly
    });
    setVariables(initialVariables);
  };

  const handleChange = (event: SelectChangeEvent<string>) => {
    const template = templates.find(t => t.id === Number(event.target.value));
    if (template) {
      handleTemplateSelect(template);
    }
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplate) return;

    let subject = selectedTemplate.subject;  // Updated property name
    let content = selectedTemplate.content;  // Updated property name

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
    return selectedTemplate.variables.every(variableName => 
      variables[variableName]?.trim() !== ''  // Check if variable has value
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
            <FormControl fullWidth>
              <InputLabel id="template-select-label">Select Template</InputLabel>
              <Select
                labelId="template-select-label"
                id="template-select"
                value={selectedTemplate?.id ? String(selectedTemplate.id) : ''}
                onChange={handleChange}
                label="Select Template"
              >
                {templates.map((template) => (
                  <MenuItem key={template.id} value={String(template.id)}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedTemplate && (
              <Box sx={{ width: '60%', p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Template Variables
                </Typography>
                {selectedTemplate.variables.map((variableName) => (
                  <TextField
                    key={variableName}
                    label={`Variable: ${variableName}`}
                    value={variables[variableName] || ''}
                    onChange={(e) => setVariables({
                      ...variables,
                      [variableName]: e.target.value
                    })}
                    required
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