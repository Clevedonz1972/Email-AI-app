import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TemplateEditor } from '../TemplateEditor';
import type { EmailTemplate } from '@/types/template';

const mockTemplate: EmailTemplate = {
  id: 1,
  name: 'Test Template',
  subject: 'Hello {{name}}',
  content: 'Dear {{name}},\n\nThis is a test template.\n\nBest regards,\n{{sender}}',
  variables: ['name', 'sender'],
  category: 'general',
  createdAt: new Date('2024-02-20T12:00:00Z'),
  updatedAt: new Date('2024-02-20T12:00:00Z')
};

describe('TemplateEditor', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty form for new template', () => {
    render(
      <TemplateEditor
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByLabelText('Template Name')).toHaveValue('');
    expect(screen.getByLabelText('Subject Template')).toHaveValue('');
    expect(screen.getByLabelText('Content Template')).toHaveValue('');
  });

  it('renders form with template data for editing', () => {
    render(
      <TemplateEditor
        open={true}
        template={mockTemplate}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByLabelText('Template Name')).toHaveValue('Test Template');
    expect(screen.getByLabelText('Subject Template')).toHaveValue('Hello {{name}}');
    expect(screen.getByLabelText('Content Template')).toHaveValue(mockTemplate.content);
  });

  it('handles variable insertion', () => {
    render(
      <TemplateEditor
        open={true}
        template={mockTemplate}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const contentInput = screen.getByLabelText('Content Template');
    contentInput.focus();
    fireEvent.click(screen.getByText('name'));

    expect(contentInput).toHaveValue(expect.stringContaining('{{name}}'));
  });

  it('validates required fields before saving', async () => {
    render(
      <TemplateEditor
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    fireEvent.click(screen.getByText('Save Template'));

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });
}); 