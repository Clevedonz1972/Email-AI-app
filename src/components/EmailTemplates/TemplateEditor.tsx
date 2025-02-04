import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip
} from '@mui/material';
import { EmailTemplate, TemplateVariable } from '../../types/template';

interface TemplateEditorProps {
  open: boolean;
  template?: EmailTemplate;
  onClose: () => void;
  onSave: (template: Partial<EmailTemplate>) => Promise<void>;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  open,
  template,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setSubject(template.subject_template);
      setContent(template.content_template);
      setVariables(template.variables || []);
    } else {
      setName('');
      setSubject('');
      setContent('');
      setVariables([]);
    }
  }, [template]);

  const handleSave = async () => {
    try {
      setError(null);
      await onSave({
        name,
        subject_template: subject,
        content_template: content,
        variables
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template');
    }
  };

  const handleVariableClick = (variable: TemplateVariable) => {
    const cursorPosition = (document.activeElement as HTMLTextAreaElement)?.selectionStart;
    if (cursorPosition !== undefined) {
      const newContent = content.slice(0, cursorPosition) + 
        `{{${variable.name}}}` + 
        content.slice(cursorPosition);
      setContent(newContent);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {template ? 'Edit Template' : 'Create New Template'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Template Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Subject Template"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Content Template"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            multiline
            rows={6}
            fullWidth
            required
          />
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Available Variables:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {variables.map((variable) => (
                <Chip
                  key={variable.name}
                  label={variable.name}
                  onClick={() => handleVariableClick(variable)}
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Template
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 