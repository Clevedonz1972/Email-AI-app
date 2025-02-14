import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TemplateList } from '../TemplateList';
import type { EmailTemplate } from '@/types/template';

const mockTemplates: EmailTemplate[] = [
  {
    id: 1,
    name: 'Test Template',
    subject: 'Test Subject',
    content: 'Test Content',
    variables: [],
    category: 'general',
    createdAt: new Date('2024-02-20T12:00:00Z'),
    updatedAt: new Date('2024-02-20T12:00:00Z')
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
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/No templates available/i)).toBeInTheDocument();
  });

  it('renders template list when templates exist', () => {
    render(
      <TemplateList
        templates={mockTemplates}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Template')).toBeInTheDocument();
    expect(screen.getByText('Test Subject')).toBeInTheDocument();
  });

  it('calls edit handler when edit button is clicked', () => {
    render(
      <TemplateList
        templates={mockTemplates}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByLabelText('edit'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockTemplates[0]);
  });

  it('calls delete handler when delete button is clicked', () => {
    render(
      <TemplateList
        templates={mockTemplates}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByLabelText('delete'));
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });
}); 