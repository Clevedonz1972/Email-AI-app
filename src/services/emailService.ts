import axios from 'axios';
import { EmailMessage, EmailAnalysis } from '@/types/email';
import { API_URL } from '@/config';

export const emailService = {
  async analyzeEmail(email: EmailMessage): Promise<EmailAnalysis> {
    const response = await axios.post(
      `${API_URL}/api/emails/analyze`, 
      email,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  },

  async getStressReport(): Promise<{
    overallStress: 'LOW' | 'MEDIUM' | 'HIGH';
    needsBreak: boolean;
    recommendations: string[];
  }> {
    const response = await axios.get(
      `${API_URL}/api/emails/stress-report`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  }
}; 