import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { TemplateList } from '../components/EmailTemplates/TemplateList';
import { TemplateEditor } from '../components/EmailTemplates/TemplateEditor';
import type { EmailTemplate, UpdateTemplateDto, CreateTemplateDto, TemplateVariable } from '../types/template';
import TemplateService from '../services/templateService';
import { useSnackbar } from 'notistack';

export const TemplateManagement: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | undefined>();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    loadTemplates();
  }, []);

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

  const handleCreateTemplate = () => {
    setSelectedTemplate(undefined);
    setEditorOpen(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditorOpen(true);
  };

  const handleDeleteTemplate = async (templateId: number) => {
    try {
      await TemplateService.deleteTemplate(templateId);
      setTemplates(templates.filter(t => t.id !== templateId));
      enqueueSnackbar('Template deleted successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to delete template', { variant: 'error' });
      console.error(err);
    }
  };

  const handleSaveTemplate = async (templateData: Partial<EmailTemplate>) => {
    try {
      if (selectedTemplate) {
        const updateDto: UpdateTemplateDto = {
          name: templateData.name,
          subject_template: templateData.subject,
          content_template: templateData.content,
          variables: templateData.variables?.map(name => ({
            name,
            required: true,
            defaultValue: ''
          }))
        };

        const updated = await TemplateService.updateTemplate(
          selectedTemplate.id,
          updateDto
        );
        setTemplates(templates.map(t => 
          t.id === selectedTemplate.id ? updated : t
        ));
        enqueueSnackbar('Template updated successfully', { variant: 'success' });
      } else {
        const createDto: CreateTemplateDto = {
          name: templateData.name!,
          subject_template: templateData.subject!,
          content_template: templateData.content!,
          variables: templateData.variables?.map(name => ({
            name,
            required: true,
            defaultValue: ''
          })) || []
        };

        const created = await TemplateService.createTemplate(createDto);
        setTemplates([...templates, created]);
        enqueueSnackbar('Template created successfully', { variant: 'success' });
      }
      setEditorOpen(false);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to save template');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" m={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Email Templates
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateTemplate}
            data-testid="create-template-btn"
          >
            Create Template
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <TemplateList
          templates={templates}
          onEdit={handleEditTemplate}
          onDelete={handleDeleteTemplate}
        />

        <TemplateEditor
          open={editorOpen}
          template={selectedTemplate}
          onClose={() => setEditorOpen(false)}
          onSave={handleSaveTemplate}
        />
      </Box>
    </Container>
  );
}; 