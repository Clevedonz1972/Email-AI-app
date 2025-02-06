import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid
} from '@mui/material';
import type { EmailTemplate } from '@/types/template';

interface TemplateFormProps {
  template?: EmailTemplate;
  onSubmit: (data: Partial<EmailTemplate>) => Promise<void>;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({
  template,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    variables: {} as Record<string, string>
  });

  useEffect(() => {
    if (template) {
      // Initialize form with template data
      const initialVariables: Record<string, string> = {};
      // Variables is now a string array, so we can use each string directly
      template.variables.forEach(variableName => {
        initialVariables[variableName] = '';  // Use the string directly as the key
      });

      setFormData({
        name: template.name,
        subject: template.subject,
        content: template.content,
        variables: initialVariables
      });
    }
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      variables: Object.keys(formData.variables), // Convert back to string array
      updatedAt: new Date()
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Template Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Subject"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            required
            helperText="Use {{variableName}} to insert variables"
          />
        </Grid>

        {/* Variable fields */}
        {Object.entries(formData.variables).map(([variableName, value]) => (
          <Grid item xs={12} key={variableName}>
            <TextField
              fullWidth
              label={`Variable: ${variableName}`}
              value={value}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                variables: {
                  ...prev.variables,
                  [variableName]: e.target.value
                }
              }))}
            />
          </Grid>
        ))}

        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary">
            {template ? 'Update Template' : 'Create Template'}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}; 