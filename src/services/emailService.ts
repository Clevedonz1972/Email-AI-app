import { mockEmails } from './mockData';
import { EmailMessage } from '../types/email';
import mockEmailService from './mockEmailService';

// Export interfaces
export interface ReplyOptions {
  emailId: string | number;
  content: string;
  approve?: boolean;
  edit?: boolean;
  regenerate?: boolean;
  suggestions?: Array<{id?: string; content: string; tone?: string}>;
  simplified_version?: string;
  available_tones?: string[];
}

// Simple error logger
const logError = (error: unknown, message: string) => {
  console.error(message, error);
};

// Email service
export const emailService = {
  // Get emails - only use mock emails from localStorage
  getEmails: async (): Promise<EmailMessage[]> => {
    try {
      console.log('Getting emails from localStorage');
      
      // Check for stored mock emails
      const storedMockEmails = mockEmailService.getStoredMockEmails();
      
      if (storedMockEmails && storedMockEmails.length > 0) {
        console.log(`Found ${storedMockEmails.length} mock emails in storage`);
        return storedMockEmails;
      }
      
      console.log('No stored mock emails found, returning empty array');
      return [];
    } catch (error) {
      logError(error, 'Error getting emails:');
      return [];
    }
  },

  // Get test emails - same implementation as getEmails
  getTestEmails: async (): Promise<EmailMessage[]> => {
    try {
      console.log('Getting test emails from localStorage');
      
      // Check for stored mock emails
      const storedMockEmails = mockEmailService.getStoredMockEmails();
      
      if (storedMockEmails && storedMockEmails.length > 0) {
        console.log(`Found ${storedMockEmails.length} mock emails in storage`);
        return storedMockEmails;
      }
      
      console.log('No stored mock emails found, returning empty array');
      return [];
    } catch (error) {
      logError(error, 'Error getting test emails:');
      return [];
    }
  },
  
  // Get unread emails - filter mock emails
  getUnreadEmails: async (): Promise<EmailMessage[]> => {
    try {
      // Check for stored mock emails
      const storedMockEmails = mockEmailService.getStoredMockEmails();
      
      if (storedMockEmails && storedMockEmails.length > 0) {
        // Filter unread emails
        return storedMockEmails.filter(email => !email.is_read);
      }
      
      return [];
    } catch (error) {
      logError(error, 'Error getting unread emails:');
      return [];
    }
  },
  
  // Get emails requiring action - filter mock emails
  getEmailsRequiringAction: async (): Promise<EmailMessage[]> => {
    try {
      // Check for stored mock emails
      const storedMockEmails = mockEmailService.getStoredMockEmails();
      
      if (storedMockEmails && storedMockEmails.length > 0) {
        // Filter emails requiring action
        return storedMockEmails.filter(email => email.action_required);
      }
      
      return [];
    } catch (error) {
      logError(error, 'Error getting emails requiring action:');
      return [];
    }
  },
  
  // Mock implementation for markAsRead
  markAsRead: async (emailId: string | number): Promise<boolean> => {
    try {
      console.log(`Marking email ${emailId} as read (mock implementation)`);
      return true;
    } catch (error) {
      logError(error, 'Error marking email as read:');
      return false;
    }
  },
  
  // Mock implementation for markAllAsRead
  markAllAsRead: async (): Promise<boolean> => {
    try {
      console.log('Marking all emails as read (mock implementation)');
      return true;
    } catch (error) {
      logError(error, 'Error marking all emails as read:');
      return false;
    }
  },
  
  // Mock implementation for deleteEmail
  deleteEmail: async (emailId: string | number): Promise<boolean> => {
    try {
      console.log(`Deleting email ${emailId} (mock implementation)`);
      return true;
    } catch (error) {
      logError(error, 'Error deleting email:');
      return false;
    }
  },
  
  // Mock implementation for analyzeEmail
  analyzeEmail: async (emailId: string | number): Promise<EmailMessage | null> => {
    try {
      console.log(`Analyzing email ${emailId} (mock implementation)`);
      const idToCompare = typeof emailId === 'number' ? emailId.toString() : emailId;
      
      // Get stored mock emails
      const storedMockEmails = mockEmailService.getStoredMockEmails();
      
      if (storedMockEmails && storedMockEmails.length > 0) {
        // Find email by ID, ensuring string comparison
        const email = storedMockEmails.find(email => {
          const emailIdStr = typeof email.id === 'number' ? email.id.toString() : email.id;
          return emailIdStr === idToCompare;
        });
        
        if (email) {
          // Return email with processed flag
          return { ...email, processed: true };
        }
      }
      
      return null;
    } catch (error) {
      logError(error, 'Error analyzing email:');
      return null;
    }
  },
  
  // Mock implementation for getReplyOptions
  getReplyOptions: async (emailId: string | number): Promise<ReplyOptions> => {
    try {
      console.log(`Getting reply options for email ${emailId} (mock implementation)`);
      
      return {
        emailId,
        content: 'This is a mock reply generated for testing purposes.',
        approve: true,
        edit: true,
        regenerate: true,
        suggestions: [
          {
            id: '1',
            content: 'Thank you for your email. I have reviewed the information and will get back to you shortly with more details.',
            tone: 'professional'
          },
          {
            id: '2',
            content: "Thanks for reaching out! I'll look into this right away and let you know what I find.",
            tone: 'friendly'
          },
          {
            id: '3',
            content: 'I acknowledge receipt of your message and will address your concerns at my earliest convenience.',
            tone: 'formal'
          }
        ],
        simplified_version: "Thanks for your email. I'll look into it and respond soon.",
        available_tones: ['professional', 'friendly', 'formal']
      };
    } catch (error) {
      logError(error, 'Error getting reply options:');
      // Return a minimal valid object instead of null to avoid null checks
      return {
        emailId,
        content: 'Error generating reply options',
        suggestions: []
      };
    }
  },
  
  // Mock implementation for sendReply
  sendReply: async (options: ReplyOptions): Promise<boolean> => {
    try {
      console.log('Sending reply (mock implementation):', options);
      return true;
    } catch (error) {
      logError(error, 'Error sending reply:');
      return false;
    }
  },
  
  // Mock implementation for getStressReport
  getStressReport: async () => {
    try {
      console.log('Getting stress report (mock implementation)');
      return {
        overallStress: 'MEDIUM',
        needsBreak: false,
        recommendations: [
          'Handle high-stress emails first thing in the morning.',
          'Consider scheduling email-free periods during your day.'
        ],
        stressBreakdown: {
          high: 2,
          medium: 5,
          low: 10
        }
      };
    } catch (error) {
      logError(error, 'Error getting stress report:');
      return {
        overallStress: 'LOW',
        needsBreak: false,
        recommendations: ['No stress data available.'],
        stressBreakdown: { high: 0, medium: 0, low: 0 }
      };
    }
  }
};

export default emailService; 