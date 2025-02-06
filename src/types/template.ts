import type { EmailMessage } from '@/types/email';

export interface TemplateVariable {
  name: string;
  defaultValue?: string;
  required: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  category: string;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTemplateDto {
  name: string;
  subject_template: string;
  content_template: string;
  variables: TemplateVariable[];
  category_id?: number;
}

export interface UpdateTemplateDto extends Partial<CreateTemplateDto> {}

export interface ProcessedTemplate {
  template: EmailTemplate;
  email: EmailMessage;
  variables: Record<string, string>;
} 