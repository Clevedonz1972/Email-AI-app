import axios, { AxiosError } from 'axios';
import { EmailMessage, EmailAnalysis, Priority, StressLevel, Category } from '@/types/email';
import { API_URL } from '../config';
import { mockEmails, mockEmailAnalysis, mockStressReport, mockReplyOptions } from './mockData';
import syntheticEmailService from './syntheticEmailService';
import { SyntheticEmail } from '../data/synthetic/emailGenerator';

export interface ReplyOptions {
  suggestions?: string[];
  simplified_version?: string;
  available_tones?: string[];
}

export interface ReplyRequestOptions {
  tone?: string;
  simplified?: boolean;
  breakdownTasks?: boolean;
}

// Helper function to convert SyntheticEmail to EmailMessage
const convertSyntheticToEmailMessage = (syntheticEmail: SyntheticEmail): EmailMessage => {
  // Map stress levels and priorities
  const mapStressLevel = (level: string): StressLevel => {
    const upperLevel = level.toUpperCase();
    if (upperLevel === 'HIGH') return 'HIGH';
    if (upperLevel === 'MEDIUM') return 'MEDIUM';
    return 'LOW';
  };
  
  const mapPriority = (priority: string): Priority => {
    const upperPriority = priority.toUpperCase();
    if (upperPriority === 'HIGH') return 'HIGH';
    if (upperPriority === 'MEDIUM') return 'MEDIUM';
    return 'LOW';
  };
  
  // Map folder to category
  const mapFolderToCategory = (folder: string): Category => {
    if (folder === 'archive') return 'trash';
    if (folder === 'spam') return 'trash';
    if (folder === 'drafts') return 'draft';
    if (['inbox', 'sent', 'draft', 'trash'].includes(folder)) return folder as Category;
    return 'inbox'; // Default
  };
  
  return {
    id: parseInt(syntheticEmail.id) || Math.floor(Math.random() * 10000), // Convert string ID to number or use random
    subject: syntheticEmail.subject,
    content: syntheticEmail.body,
    preview: syntheticEmail.body.substring(0, 100) + (syntheticEmail.body.length > 100 ? '...' : ''),
    sender: {
      email: syntheticEmail.from.email,
      name: syntheticEmail.from.name
    },
    timestamp: syntheticEmail.date.toISOString(),
    priority: mapPriority(syntheticEmail.metadata.priority),
    stress_level: mapStressLevel(syntheticEmail.metadata.stressLevel),
    is_read: syntheticEmail.isRead,
    category: mapFolderToCategory(syntheticEmail.folder),
    processed: true,
    action_required: syntheticEmail.metadata.needsResponse,
    summary: syntheticEmail.body.substring(0, 150) + (syntheticEmail.body.length > 150 ? '...' : ''),
    action_items: syntheticEmail.metadata.actionItems.map((item, index) => ({
      id: `action-${syntheticEmail.id}-${index}`,
      description: item,
      completed: false
    })),
    sentiment_score: syntheticEmail.metadata.sentiment === 'very_positive' ? 0.9 :
                    syntheticEmail.metadata.sentiment === 'positive' ? 0.7 :
                    syntheticEmail.metadata.sentiment === 'neutral' ? 0.5 :
                    syntheticEmail.metadata.sentiment === 'negative' ? 0.3 : 0.1
  };
};

// Helper function to handle API errors consistently
const handleApiError = (error: unknown, endpoint: string, useFallback = true) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    console.error(`API Error (${endpoint}):`, {
      message: axiosError.message,
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      url: axiosError.config?.url,
    });
    
    // For debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Full error details:', axiosError);
    }
    
    // Network or CORS errors should be reported differently
    if (!axiosError.response || axiosError.code === 'ECONNABORTED') {
      console.warn(`API connectivity issue (${endpoint}): ${axiosError.message}`);
    }
    
    // Authentication errors should be handled differently
    if (axiosError.response?.status === 401) {
      console.warn('Authentication token may be invalid or expired');
      // In production you might want to trigger re-authentication
    }
  } else {
    console.error(`Unexpected error in API call (${endpoint}):`, error);
  }
  
  // Only throw if we don't want to use fallback data
  if (!useFallback) {
    throw error;
  }
};

// Flag to control whether to use synthetic data or real API
const USE_SYNTHETIC_DATA = true;

// Email service that can switch between synthetic data and real API
export const emailService = {
  
  // Get test emails for demonstration
  getTestEmails: async () => {
    if (USE_SYNTHETIC_DATA) {
      const syntheticEmails = await syntheticEmailService.getAllEmails();
      return syntheticEmails.map(convertSyntheticToEmailMessage);
    }
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/emails/test-emails`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching test emails:', error);
      throw error;
    }
  },

  // Analyze an email for sentiment, priority, etc.
  // Accepts either a string (content) or an EmailMessage object
  analyzeEmail: async (emailContentOrObject: string | any) => {
    // Extract email content from the input
    const emailContent = typeof emailContentOrObject === 'string' 
      ? emailContentOrObject 
      : emailContentOrObject.content || emailContentOrObject.body || '';
    
    if (USE_SYNTHETIC_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate random analysis results
      const sentiments = ['very_negative', 'negative', 'neutral', 'positive', 'very_positive'];
      const priorities = ['high', 'medium', 'low'];
      const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const stressLevel = Math.floor(Math.random() * 10) + 1;
      
      // Extract potential action items based on simple keyword matching
      const actionItems = [];
      const lines = emailContent.split('\n');
      
      for (const line of lines) {
        const lowerLine = line.toLowerCase();
        if (
          lowerLine.includes('please') ||
          lowerLine.includes('could you') ||
          lowerLine.includes('need to') ||
          lowerLine.includes('required') ||
          lowerLine.includes('deadline') ||
          lowerLine.includes('due by')
        ) {
          actionItems.push(line.trim());
        }
      }
      
      return {
        sentiment,
        priority: priority.toUpperCase(), // Ensure compatibility with existing code
        stressLevel,
        actionItems: actionItems.slice(0, 3), // Limit to 3 items
        needsResponse: Math.random() > 0.4, // 60% chance of needing a response
      };
    }
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/emails/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: emailContent })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error analyzing email:', error);
      throw error;
    }
  },

  // Get email stress report
  getStressReport: async () => {
    if (USE_SYNTHETIC_DATA) {
      try {
        const rawReport = await syntheticEmailService.getStressReport();
        
        // Ensure the report has all required properties
        const report = {
          overallStress: rawReport.overallStress || 'LOW',
          needsBreak: rawReport.needsBreak || false,
          recommendations: rawReport.recommendations || [
            'You are handling your emails well today!',
            'Consider taking a short break every hour as a preventive measure.'
          ],
          stressBreakdown: rawReport.stressBreakdown || {
            high: 0,
            medium: 0,
            low: 0
          }
        };
        
        return report;
      } catch (error) {
        console.error('Error generating synthetic stress report:', error);
        // Return fallback data
        return mockStressReport;
      }
    }
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/emails/stress-report`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching stress report:', error);
      return mockStressReport; // Use mock data as fallback
    }
  },

  // Get AI-generated reply options for an email
  getReplyOptions: async (emailId: string | number, options?: {
    tone?: string;
    simplified?: boolean;
    breakdownTasks?: boolean;
  }) => {
    // Convert number id to string if needed
    const idString = String(emailId);
    
    if (USE_SYNTHETIC_DATA) {
      try {
        const reply = await syntheticEmailService.generateReply(idString);
        
        // Apply tone changes based on options
        let toneAdjustedReply = reply.body;
        if (options?.tone === 'formal') {
          toneAdjustedReply = toneAdjustedReply
            .replace('Thanks', 'Thank you')
            .replace('Best,', 'Best regards,');
        } else if (options?.tone === 'casual') {
          toneAdjustedReply = toneAdjustedReply
            .replace('Best regards,', 'Cheers,')
            .replace('Thank you', 'Thanks');
        }
        
        // Create a simplified version if requested
        let simplifiedVersion = "";
        if (options?.simplified) {
          // Extract first sentence of each paragraph and join
          simplifiedVersion = reply.body
            .split('\n\n')
            .map((paragraph: string) => {
              const firstSentence = paragraph.split(/[.!?]+/)[0] + '.';
              return firstSentence;
            })
            .join('\n\n');
        }
        
        // Generate suggestions based on options
        const suggestions = [
          {
            id: '1',
            content: reply.body,
            tone: options?.tone || 'professional'
          },
          {
            id: '2',
            content: reply.body.replace('I\'ll get back to you with updates as soon as possible.', 'I\'ll work on this today and get back to you by the end of the day.'),
            tone: 'urgent'
          },
          {
            id: '3',
            content: reply.body.replace('Best regards,', 'Thanks,'),
            tone: 'casual'
          }
        ];
        
        return {
          suggestions,
          simplified_version: simplifiedVersion || suggestions[0].content,
          available_tones: ['professional', 'formal', 'casual', 'friendly', 'urgent']
        };
      } catch (error) {
        console.error('Error generating reply options:', error);
        throw error;
      }
    }
    
    try {
      // Build query parameters from options
      const params = new URLSearchParams();
      if (options?.tone) params.append('tone', options.tone);
      if (options?.simplified !== undefined) params.append('simplified', String(options.simplified));
      if (options?.breakdownTasks !== undefined) params.append('breakdown_tasks', String(options.breakdownTasks));
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/emails/reply-options/${idString}${queryString}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching reply options:', error);
      throw error;
    }
  },

  // Get email by ID
  getEmailById: async (id: string) => {
    if (USE_SYNTHETIC_DATA) {
      const syntheticEmail = await syntheticEmailService.getEmailById(id);
      return syntheticEmail ? convertSyntheticToEmailMessage(syntheticEmail) : null;
    }
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/emails/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching email with ID ${id}:`, error);
      throw error;
    }
  },

  // Get emails by folder
  getEmailsByFolder: async (folder: string) => {
    if (USE_SYNTHETIC_DATA) {
      const syntheticEmails = await syntheticEmailService.getEmailsByFolder(folder);
      return syntheticEmails.map(convertSyntheticToEmailMessage);
    }
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/emails/folder/${folder}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching emails in folder ${folder}:`, error);
      throw error;
    }
  },

  // Get emails by label/category
  getEmailsByCategory: async (category: string) => {
    if (USE_SYNTHETIC_DATA) {
      const syntheticEmails = await syntheticEmailService.getEmailsByCategory(category);
      return syntheticEmails.map(convertSyntheticToEmailMessage);
    }
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/emails/category/${category}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching emails with category ${category}:`, error);
      throw error;
    }
  },

  // Get high priority emails
  getHighPriorityEmails: async () => {
    if (USE_SYNTHETIC_DATA) {
      const syntheticEmails = await syntheticEmailService.getHighPriorityEmails();
      return syntheticEmails.map(convertSyntheticToEmailMessage);
    }
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/emails/priority/high`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching high priority emails:', error);
      throw error;
    }
  },

  // Get emails needing response
  getEmailsNeedingResponse: async () => {
    if (USE_SYNTHETIC_DATA) {
      const syntheticEmails = await syntheticEmailService.getEmailsNeedingResponse();
      return syntheticEmails.map(convertSyntheticToEmailMessage);
    }
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/emails/needs-response`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching emails needing response:', error);
      throw error;
    }
  },

  // Get action item emails
  getEmailsWithActionItems: async () => {
    if (USE_SYNTHETIC_DATA) {
      const syntheticEmails = await syntheticEmailService.getEmailsWithActionItems();
      return syntheticEmails.map(convertSyntheticToEmailMessage);
    }
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/emails/action-items`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching emails with action items:', error);
      throw error;
    }
  },

  // Operations on emails
  markAsRead: async (id: string) => {
    if (USE_SYNTHETIC_DATA) {
      return syntheticEmailService.markAsRead(id);
    }
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/emails/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error marking email ${id} as read:`, error);
      throw error;
    }
  },

  toggleStar: async (id: string) => {
    if (USE_SYNTHETIC_DATA) {
      return syntheticEmailService.toggleStar(id);
    }
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/emails/${id}/star`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error toggling star for email ${id}:`, error);
      throw error;
    }
  },

  archiveEmail: async (id: string) => {
    if (USE_SYNTHETIC_DATA) {
      return syntheticEmailService.archiveEmail(id);
    }
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/emails/${id}/archive`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error archiving email ${id}:`, error);
      throw error;
    }
  },

  deleteEmail: async (id: string) => {
    if (USE_SYNTHETIC_DATA) {
      return syntheticEmailService.deleteEmail(id);
    }
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/emails/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error deleting email ${id}:`, error);
      throw error;
    }
  },

  /**
   * Analyze tone of an email message
   * @param emailId Email ID to analyze
   * @returns Tone analysis object
   */
  async analyzeTone(emailId: string | number): Promise<any> {
    try {
      const idString = typeof emailId === 'number' ? String(emailId) : emailId;
      const response = await fetch(`${API_URL}/api/emails/analyze-tone/${idString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to analyze tone: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error analyzing tone:', error);
      
      // For development purposes, return mock data
      return {
        dominant_tone: 'neutral',
        tones: [
          { tone: 'neutral', score: 0.7 },
          { tone: 'formal', score: 0.6 },
          { tone: 'direct', score: 0.4 },
        ],
        simplified_explanation: 'This email appears to have a neutral, professional tone.',
        potential_misunderstandings: [
          'The brevity might be misinterpreted as coldness.',
          'Formal language might be perceived as distance rather than professionalism.'
        ],
        suggested_response_tone: 'neutral, professional, with appropriate warmth',
        recommendations: [
          'Consider adding a personal greeting to warm up the tone',
          'Be clear and concise, but include context for your points',
          'End with an appreciative closing to balance formality'
        ]
      };
    }
  },

  // Get emails requiring action
  getEmailsRequiringAction: async (): Promise<EmailMessage[]> => {
    if (USE_SYNTHETIC_DATA) {
      const syntheticEmails = await syntheticEmailService.getEmailsRequiringAction();
      return syntheticEmails.map(convertSyntheticToEmailMessage);
    }
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/emails/action-required`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching emails requiring action:', error);
      throw error;
    }
  },
};

export default emailService; 