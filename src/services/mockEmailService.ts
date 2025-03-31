import { ApiClient } from './apiClient';
import { EmailMessage } from '../types/email';
import { v4 as uuidv4 } from 'uuid';

// Local storage key for mock emails
const MOCK_EMAILS_STORAGE_KEY = 'mockEmails';

/**
 * Service for handling mock emails across the application
 * This acts as a bridge between the testing dashboard and main email dashboard
 */
export const mockEmailService = {
  /**
   * Store mock emails in local storage for the main application to access
   * @param emails The testing mock emails to transfer to the main app
   */
  transferMockEmailsToInbox: async (emails: EmailMessage[]): Promise<boolean> => {
    try {
      if (!emails || emails.length === 0) {
        console.warn('No emails to transfer');
        return false;
      }

      // Add a unique ID and timestamp if not present
      const formattedEmails = emails.map(email => ({
        ...email,
        id: email.id || uuidv4(),
        timestamp: email.timestamp || new Date().toISOString(),
        is_read: false, // Mark as unread to show up in inbox
      }));

      localStorage.setItem(MOCK_EMAILS_STORAGE_KEY, JSON.stringify(formattedEmails));
      console.log(`Stored ${formattedEmails.length} mock emails in localStorage`);

      // Try notifying the backend (optional)
      try {
        await ApiClient.post('/api/testing/mock-emails-transferred', { count: formattedEmails.length });
      } catch (error) {
        console.warn('Failed to notify backend about transferred emails:', error);
        // Non-critical, continue
      }

      return true;
    } catch (error) {
      console.error('Error transferring mock emails to inbox:', error);
      return false;
    }
  },
  
  /**
   * Get the stored mock emails from local storage
   */
  getStoredMockEmails: () => {
    try {
      const storedEmails = localStorage.getItem(MOCK_EMAILS_STORAGE_KEY);
      if (!storedEmails) {
        return []; // Return empty array instead of null
      }
      return JSON.parse(storedEmails) as EmailMessage[];
    } catch (error) {
      console.error('Error parsing stored mock emails:', error);
      return []; // Return empty array on error
    }
  },
  
  /**
   * Clear all stored mock emails
   */
  clearStoredMockEmails: () => {
    try {
      localStorage.removeItem(MOCK_EMAILS_STORAGE_KEY);
      console.log('Cleared stored mock emails from localStorage');
      return true;
    } catch (error) {
      console.error('Error clearing stored mock emails:', error);
      return false;
    }
  }
};

export default mockEmailService; 