// Synthetic email service for generating test data
import { 
  SyntheticEmail, 
  generateEmailBatch, 
  generateStressTestEmails 
} from '../data/synthetic/emailGenerator';
import { mockEmails } from '../test/utils/mockData';
import { EmailMessage } from '../types/email';

// Storage for synthetic emails (in-memory DB)
let emails: SyntheticEmail[] = [];
const emailCache = new Map<string, SyntheticEmail>();

// Initialize with a batch of emails
const initializeEmails = () => {
  if (emails.length === 0) {
    // Generate 20 emails with mixed stress levels
    const syntheticEmails = generateStressTestEmails(20);
    
    // Add some predefined emails for consistent testing
    emails = syntheticEmails;
    
    // Cache emails by ID for quick lookup
    emails.forEach(email => {
      emailCache.set(email.id, email);
    });
  }
};

// Get all emails
const getAllEmails = async (): Promise<SyntheticEmail[]> => {
  initializeEmails();
  return emails;
};

// Get email by ID
const getEmailById = async (id: string): Promise<SyntheticEmail | null> => {
  initializeEmails();
  return emailCache.get(id) || null;
};

// Get emails by folder
const getEmailsByFolder = async (folder: string): Promise<SyntheticEmail[]> => {
  initializeEmails();
  return emails.filter(email => email.folder === folder);
};

// Get emails by category (inbox, sent, etc.)
const getEmailsByCategory = async (category: string): Promise<SyntheticEmail[]> => {
  initializeEmails();
  return emails.filter(email => email.folder === category);
};

// Get high priority emails
const getHighPriorityEmails = async (): Promise<SyntheticEmail[]> => {
  initializeEmails();
  return emails.filter(email => email.metadata.priority === 'high');
};

// Get emails that need a response
const getEmailsNeedingResponse = async (): Promise<SyntheticEmail[]> => {
  initializeEmails();
  return emails.filter(email => email.metadata.needsResponse);
};

// Get emails with action items
const getEmailsWithActionItems = async (): Promise<SyntheticEmail[]> => {
  initializeEmails();
  return emails.filter(email => email.metadata.actionItems.length > 0);
};

// Mark email as read
const markAsRead = async (id: string): Promise<boolean> => {
  initializeEmails();
  const email = emailCache.get(id);
  if (email) {
    email.isRead = true;
    return true;
  }
  return false;
};

// Toggle star status
const toggleStar = async (id: string): Promise<boolean> => {
  initializeEmails();
  const email = emailCache.get(id);
  if (email) {
    email.isStarred = !email.isStarred;
    return true;
  }
  return false;
};

// Archive email
const archiveEmail = async (id: string): Promise<boolean> => {
  initializeEmails();
  const email = emailCache.get(id);
  if (email) {
    email.isArchived = true;
    email.folder = 'sent'; // Using 'sent' as archive for simplicity
    return true;
  }
  return false;
};

// Delete email
const deleteEmail = async (id: string): Promise<boolean> => {
  initializeEmails();
  const email = emailCache.get(id);
  if (email) {
    email.folder = 'trash';
    return true;
  }
  return false;
};

// Generate a reply to an email
const generateReply = async (id: string): Promise<any> => {
  const email = await getEmailById(id);
  if (!email) {
    return null;
  }
  
  // Simple reply generator
  const sender = email.from;
  const firstName = sender.name.split(' ')[0];
  
  // Different reply templates based on email content
  let replyContent = '';
  let suggestions = [];
  
  if (email.metadata.priority === 'high') {
    replyContent = `Hi ${firstName},\n\nThank you for bringing this urgent matter to my attention. I'm looking into it immediately and will update you as soon as possible.\n\nBest regards,\n[Your Name]`;
    suggestions = [
      "I'll address this right away.",
      "I've prioritized this issue and am working on it now.",
      "This is at the top of my list - I'll get back to you shortly with more information."
    ];
  } else if (email.body.toLowerCase().includes('meeting') || email.body.toLowerCase().includes('schedule')) {
    replyContent = `Hi ${firstName},\n\nThank you for the meeting invitation. I've checked my calendar, and I can attend at the specified time.\n\nLooking forward to it,\n[Your Name]`;
    suggestions = [
      "I've added this to my calendar.",
      "I'll be there.",
      "Looking forward to our discussion."
    ];
  } else {
    replyContent = `Hi ${firstName},\n\nThank you for your email. I've received your message and will get back to you soon.\n\nBest regards,\n[Your Name]`;
    suggestions = [
      "I'll review this and respond in detail later.",
      "Thanks for reaching out.",
      "I appreciate you sharing this information."
    ];
  }
  
  return {
    suggestions,
    replyContent,
    simplified_version: replyContent.split('\n\n')[1], // Just the middle part
    available_tones: ['Professional', 'Friendly', 'Concise', 'Detailed']
  };
};

// Generate stress report based on current email state
const getStressReport = async () => {
  initializeEmails();
  
  // Count emails by stress level
  const highStress = emails.filter(email => email.metadata.stressLevel >= 8).length;
  const mediumStress = emails.filter(email => email.metadata.stressLevel >= 4 && email.metadata.stressLevel < 8).length;
  const lowStress = emails.filter(email => email.metadata.stressLevel < 4).length;
  
  // Calculate overall stress level
  const totalEmails = emails.length;
  const weightedScore = (highStress * 10 + mediumStress * 5 + lowStress * 1) / totalEmails;
  
  // Generate recommendations based on stress level
  const recommendations = [];
  if (weightedScore > 7) {
    recommendations.push(
      'Consider delegating some high-priority tasks',
      'Block time in your calendar for focused work without email interruptions',
      'Use the "Mark as Unread" feature to come back to important emails later'
    );
  } else if (weightedScore > 4) {
    recommendations.push(
      'Set specific times during the day to check emails rather than constantly monitoring',
      'Use filters to organize your inbox based on priority',
      'Take short breaks between handling stressful emails'
    );
  } else {
    recommendations.push(
      'Continue your current email management approach',
      'Consider helping colleagues who may be experiencing high email stress',
      'Maintain your healthy email habits'
    );
  }
  
  return {
    overallStress: weightedScore > 7 ? 'HIGH' : weightedScore > 4 ? 'MEDIUM' : 'LOW',
    needsBreak: weightedScore > 7,
    recommendations,
    stressBreakdown: {
      high: highStress,
      medium: mediumStress,
      low: lowStress
    }
  };
};

// Export service functions
export default {
  getAllEmails,
  getEmailById,
  getEmailsByFolder,
  getEmailsByCategory,
  getHighPriorityEmails,
  getEmailsNeedingResponse,
  getEmailsWithActionItems,
  markAsRead,
  toggleStar,
  archiveEmail,
  deleteEmail,
  generateReply,
  getStressReport
}; 