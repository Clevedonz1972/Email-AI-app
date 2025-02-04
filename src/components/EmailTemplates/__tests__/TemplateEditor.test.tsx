import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TemplateEditor } from '../TemplateEditor';
import { EmailTemplate } from '../../../types/template';

const mockTemplate: EmailTemplate = {
  id: 1,
  name: 'Test Template',
  subject_template: 'Hello {{name}}',
  content_template: 'Dear {{name}},\n\nBest regards,\n{{sender}}',
  variables: [
    { name: 'name', description: 'Recipient name', required: true },
    { name: 'sender', description: 'Sender name', required: true }
  ],
  created_at: '2024-02-20T12:00:00Z',
  updated_at: '2024-02-20T12:00:00Z'
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

    expect(screen.getByLabelText(/template name/i)).toHaveValue('');
    expect(screen.getByLabelText(/subject template/i)).toHaveValue('');
    expect(screen.getByLabelText(/content template/i)).toHaveValue('');
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

    expect(screen.getByLabelText(/template name/i)).toHaveValue('Test Template');
    expect(screen.getByLabelText(/subject template/i)).toHaveValue('Hello {{name}}');
    expect(screen.getByLabelText(/content template/i)).toHaveValue(mockTemplate.content_template);
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

    const contentInput = screen.getByLabelText(/content template/i);
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

    fireEvent.click(screen.getByText(/save template/i));

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  });
}); 