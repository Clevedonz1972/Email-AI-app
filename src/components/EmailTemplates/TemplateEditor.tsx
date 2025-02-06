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
  Chip,
  Paper,
  Grid
} from '@mui/material';
import type { EmailTemplate, TemplateVariable } from '@/types/template';

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
  const [variables, setVariables] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setSubject(template.subject);
      setContent(template.content);
      setVariables(template.variables || []);
    } else {
      setName('');
      setSubject('');
      setContent('');
      setVariables([]);
    }
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await onSave({
        name,
        subject,
        content,
        variables,
        updatedAt: new Date()
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
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {template ? 'Edit Template' : 'Create New Template'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Template Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Available Variables:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {variables.map((variable) => (
                      <Chip
                        key={variable}
                        label={variable}
                        onClick={() => handleVariableClick({ name: variable } as TemplateVariable)}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  {template ? 'Update Template' : 'Create Template'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}; 