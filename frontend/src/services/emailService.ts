import axios from 'axios';
import type { EmailMessage } from '../types/email';
import { API_BASE_URL } from '../config';

const emailService = {
  async getEmails(): Promise<{ data: EmailMessage[] }> {
    const response = await axios.get(`${API_BASE_URL}/api/emails`);
    return response;
  },

  async getEmailById(id: number): Promise<{ data: EmailMessage }> {
    const response = await axios.get(`${API_BASE_URL}/api/emails/${id}`);
    return response;
  },

  async markAsRead(id: number): Promise<void> {
    await axios.patch(`${API_BASE_URL}/api/emails/${id}/read`);
  },

  async markAsUnread(id: number): Promise<void> {
    await axios.patch(`${API_BASE_URL}/api/emails/${id}/unread`);
  },

  async deleteEmail(id: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/api/emails/${id}`);
  },

  async sendEmail(email: Partial<EmailMessage>): Promise<{ data: EmailMessage }> {
    const response = await axios.post(`${API_BASE_URL}/api/emails`, email);
    return response;
  }
};

export { emailService }; 