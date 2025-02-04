import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TemplateList } from '../TemplateList';
import { EmailTemplate } from '../../../types/template';

const mockTemplates: EmailTemplate[] = [
  {
    id: 1,
    name: 'Test Template',
    subject_template: 'Test Subject',
    content_template: 'Test Content',
    variables: [],
    created_at: '2024-02-20T12:00:00Z',
    updated_at: '2024-02-20T12:00:00Z'
  }
];

describe('TemplateList', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no templates exist', () => {
    render(
      <TemplateList
        templates={[]}
        onEditTemplate={mockOnEdit}
        onDeleteTemplate={mockOnDelete}
      />
    );

    expect(screen.getByText(/No email templates/i)).toBeInTheDocument();
  });

  it('renders template list when templates exist', () => {
    render(
      <TemplateList
        templates={mockTemplates}
        onEditTemplate={mockOnEdit}
        onDeleteTemplate={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Template')).toBeInTheDocument();
    expect(screen.getByText('Test Subject')).toBeInTheDocument();
  });

  it('calls edit handler when edit button is clicked', () => {
    render(
      <TemplateList
        templates={mockTemplates}
        onEditTemplate={mockOnEdit}
        onDeleteTemplate={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByLabelText('edit'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockTemplates[0]);
  });

  it('calls delete handler when delete button is clicked', () => {
    render(
      <TemplateList
        templates={mockTemplates}
        onEditTemplate={mockOnEdit}
        onDeleteTemplate={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByLabelText('delete'));
    expect(mockOnDelete).toHaveBeenCalledWith(mockTemplates[0].id);
  });
}); 