export interface TemplateVariable {
  name: string;
  description: string;
  required: boolean;
}

export interface EmailTemplate {
  id: number;
  name: string;
  subject_template: string;
  content_template: string;
  variables: TemplateVariable[];
  category_id?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateDto {
  name: string;
  subject_template: string;
  content_template: string;
  variables: TemplateVariable[];
  category_id?: number;
}

export interface UpdateTemplateDto extends Partial<CreateTemplateDto> {} 