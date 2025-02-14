import { ApiClient } from './apiClient';
import type { EmailTemplate, CreateTemplateDto, UpdateTemplateDto } from '../types/template';

export class TemplateService {
  static async getTemplates(): Promise<EmailTemplate[]> {
    return ApiClient.get<EmailTemplate[]>('/templates');
  }

  static async getTemplate(id: number): Promise<EmailTemplate> {
    return ApiClient.get<EmailTemplate>(`/templates/${id}`);
  }

  static async createTemplate(template: CreateTemplateDto): Promise<EmailTemplate> {
    return ApiClient.post<EmailTemplate>('/templates', template);
  }

  static async updateTemplate(id: number, template: UpdateTemplateDto): Promise<EmailTemplate> {
    return ApiClient.put<EmailTemplate>(`/templates/${id}`, template);
  }

  static async deleteTemplate(id: number): Promise<void> {
    return ApiClient.delete(`/templates/${id}`);
  }
}

export default TemplateService; 