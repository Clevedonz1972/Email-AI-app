import { EmailMessage, EmailAnalysis, Priority, StressLevel } from '../types/email';

// Mock emails for development and testing
export const mockEmails: EmailMessage[] = [
  {
    id: 1,
    subject: 'Project Deadline Extension',
    content: 'Hi team, I wanted to let you know that we\'ve been granted a two-week extension on the current project. This should give us ample time to refine our deliverables and ensure everything meets our quality standards. Please adjust your timelines accordingly and let me know if you have any questions.',
    preview: 'Hi team, I wanted to let you know that we\'ve been granted a two-week extension on the current project...',
    sender: {
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com'
    },
    recipient: {
      name: 'You',
      email: 'you@example.com'
    },
    timestamp: '2023-06-15T09:30:00Z',
    is_read: false,
    processed: true,
    priority: 'MEDIUM',
    stress_level: 'LOW',
    sentiment_score: 0.7,
    category: 'work',
    is_processed: true,
    action_items: ['Adjust project timeline', 'Update team on new deadline'],
    summary: 'Project deadline extended by two weeks. Adjust timelines accordingly.'
  },
  {
    id: 2,
    subject: 'URGENT: Server Outage Reported',
    content: 'We are experiencing a critical server outage affecting all production systems. The engineering team has been notified and is working to resolve the issue ASAP. Please do not deploy any new code until further notice. We will send an update within the hour with more details and an estimated time to resolution.',
    preview: 'We are experiencing a critical server outage affecting all production systems...',
    sender: {
      name: 'IT Support',
      email: 'itsupport@example.com'
    },
    recipient: {
      name: 'You',
      email: 'you@example.com'
    },
    timestamp: '2023-06-14T23:15:00Z',
    is_read: false,
    processed: true,
    priority: 'HIGH',
    stress_level: 'HIGH',
    sentiment_score: -0.8,
    category: 'alerts',
    is_processed: true,
    action_items: ['Pause deployments', 'Wait for update', 'Check system status'],
    summary: 'Critical server outage affecting production. Engineering team notified and working on resolution.'
  },
  {
    id: 3,
    subject: 'Friendly Reminder: Team Lunch Tomorrow',
    content: 'Just a friendly reminder that we have our monthly team lunch tomorrow at 12:30 PM at Riverfront Grill. It\'s a great opportunity to catch up with everyone outside of work discussions. The company will cover the expenses as usual. Hope to see you all there!',
    preview: 'Just a friendly reminder that we have our monthly team lunch tomorrow at 12:30 PM...',
    sender: {
      name: 'HR Team',
      email: 'hr@example.com'
    },
    recipient: {
      name: 'You',
      email: 'you@example.com'
    },
    timestamp: '2023-06-14T16:45:00Z',
    is_read: true,
    processed: true,
    priority: 'LOW',
    stress_level: 'LOW',
    sentiment_score: 0.9,
    category: 'social',
    is_processed: true,
    action_items: ['Attend team lunch at 12:30 PM', 'Mark in calendar'],
    summary: 'Monthly team lunch reminder for tomorrow at Riverfront Grill, 12:30 PM.'
  }
];

// Mock email analysis for development
export const mockEmailAnalysis: EmailAnalysis = {
  stress_level: 'MEDIUM',
  priority: 'MEDIUM',
  summary: 'This is a sample email analysis summary that gives an overview of the content.',
  action_items: [
    'Follow up with the sender by Friday',
    'Review attached documents',
    'Schedule meeting with team'
  ],
  sentiment_score: 0.2
};

// Mock stress report
export const mockStressReport = {
  overall_stress: 'MEDIUM',
  high_stress_emails: 2,
  medium_stress_emails: 5,
  low_stress_emails: 10,
  needs_break: false,
  recommendations: [
    'Consider taking a 5-minute break',
    'Process high-priority emails first',
    'Enable focus mode for better concentration'
  ],
  trigger_words_detected: ['urgent', 'immediately', 'deadline']
};

// Mock reply options
export const mockReplyOptions = [
  {
    id: 1,
    tone: 'professional',
    content: 'Thank you for your email. I appreciate your input and will review the information provided. I\'ll get back to you with my thoughts by the end of the week.',
    sentiment_score: 0.6
  },
  {
    id: 2,
    tone: 'casual',
    content: 'Thanks for reaching out! I\'ll take a look at this and get back to you soon with some feedback.',
    sentiment_score: 0.8
  },
  {
    id: 3,
    tone: 'formal',
    content: 'I am writing to acknowledge receipt of your email. The matter will be given due consideration, and a response will be provided in a timely manner.',
    sentiment_score: 0.3
  }
]; 