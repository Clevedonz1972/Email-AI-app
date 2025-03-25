// Email generator for synthetic test data
import { v4 as uuidv4 } from 'uuid';

// Define types for synthetic emails
export interface SyntheticEmail {
  id: string;
  subject: string;
  body: string;
  from: {
    name: string;
    email: string;
  };
  to: string[];
  cc?: string[];
  bcc?: string[];
  date: Date;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  folder: 'inbox' | 'sent' | 'draft' | 'trash';
  metadata: {
    priority: 'high' | 'medium' | 'low';
    stressLevel: number; // 1-10
    sentiment: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
    needsResponse: boolean;
    actionItems: string[];
  };
}

// Sample senders for synthetic emails
const senders = [
  { name: 'Alex Johnson', email: 'alex.johnson@company.com' },
  { name: 'Taylor Smith', email: 'taylor.smith@company.com' },
  { name: 'Jordan Lee', email: 'jordan.lee@company.com' },
  { name: 'CEO', email: 'ceo@company.com' },
  { name: 'HR Team', email: 'hr@company.com' },
  { name: 'IT Support', email: 'support@company.com' },
  { name: 'Project Manager', email: 'pm@company.com' },
  { name: 'Accounts Receivable', email: 'billing@vendor.com' },
  { name: 'Mom', email: 'mom@family.com' },
  { name: 'Jamie', email: 'jamie@friend.com' },
];

// Sample subjects for synthetic emails
const subjects = [
  'Project Update - Q3 Roadmap',
  'Meeting Notes from Yesterday',
  'URGENT: Server Outage',
  'Friendly Reminder: Team Lunch Tomorrow',
  'Quarterly Performance Review',
  'New Policy Implementation',
  'Invoice #12345 Due',
  'Weekend Plans?',
  'Job Application Status',
  'Company Benefits Update',
  'Security Alert: Required Action',
  'Congratulations on Your Achievement!'
];

// Sample email bodies for synthetic emails
const bodies = [
  `Hi Team,

I wanted to update everyone on our progress for the Q3 roadmap. We're currently on track with most initiatives, but there are a few areas where we need to focus more attention.

Please review the attached document and let me know if you have any questions or concerns.

Best regards,
Project Manager`,

  `Hello everyone,

Just a friendly reminder that we have our monthly team lunch scheduled for tomorrow at 12:30 PM at The Garden Restaurant.

Looking forward to seeing you all there for some good food and great conversation!

Cheers,
HR Team`,

  `ALERT: CRITICAL SERVER OUTAGE

Our monitoring system has detected a critical outage on the main production servers.
Immediate action is required. All hands needed to resolve this issue.
Customers are reporting inability to access the platform.

Please respond ASAP with your availability to join the emergency response team.

IT Support Team`,

  `Dear Team Member,

It's time for our quarterly performance reviews. I've scheduled your individual review for next Tuesday at 2:00 PM.

Please prepare a brief summary of your achievements this quarter and any challenges you've faced.

This is a good opportunity to discuss your career goals and any support you might need.

Regards,
Taylor Smith
Department Manager`,

  `FINAL NOTICE: PAYMENT PAST DUE

This is a final reminder that invoice #INV-3829 for $5,643.00 is now 30 days past due.

If payment is not received within 7 days, we may be forced to suspend services and apply late payment fees.

Please contact our billing department immediately to resolve this issue.

Accounts Receivable Department`
];

// Function to generate a random synthetic email
export function generateRandomEmail(): SyntheticEmail {
  const randomSender = senders[Math.floor(Math.random() * senders.length)];
  const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
  const randomBody = bodies[Math.floor(Math.random() * bodies.length)];
  
  // Generate a date within the last 7 days
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 7));
  
  // Determine priority, stress level, and sentiment
  let priority: 'high' | 'medium' | 'low';
  let stressLevel: number;
  let sentiment: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
  let needsResponse: boolean;
  
  // Assign values based on content
  if (randomBody.includes('URGENT') || randomBody.includes('CRITICAL') || randomBody.includes('ALERT')) {
    priority = 'high';
    stressLevel = 8 + Math.floor(Math.random() * 3); // 8-10
    sentiment = 'negative';
    needsResponse = true;
  } else if (randomBody.includes('review') || randomBody.includes('deadline') || randomBody.includes('payment')) {
    priority = 'medium';
    stressLevel = 5 + Math.floor(Math.random() * 3); // 5-7
    sentiment = 'neutral';
    needsResponse = Math.random() > 0.3;
  } else {
    priority = 'low';
    stressLevel = 1 + Math.floor(Math.random() * 4); // 1-4
    sentiment = randomBody.includes('congratulations') || randomBody.includes('friendly') ? 'positive' : 'neutral';
    needsResponse = Math.random() > 0.6;
  }
  
  // Generate action items based on content
  const actionItems: string[] = [];
  if (needsResponse) {
    actionItems.push('Reply to this email');
  }
  
  if (randomBody.includes('review')) {
    actionItems.push('Prepare for performance review');
  }
  
  if (randomBody.includes('meeting') || randomBody.includes('lunch')) {
    actionItems.push('Add to calendar');
  }
  
  if (randomBody.includes('payment') || randomBody.includes('invoice')) {
    actionItems.push('Process payment');
  }
  
  return {
    id: uuidv4(),
    subject: randomSubject,
    body: randomBody,
    from: randomSender,
    to: ['user@company.com'],
    date: date,
    isRead: Math.random() > 0.4,
    isStarred: Math.random() > 0.8,
    isArchived: false,
    folder: 'inbox',
    metadata: {
      priority,
      stressLevel,
      sentiment,
      needsResponse,
      actionItems: actionItems.slice(0, 3)
    }
  };
}

// Generate a batch of synthetic emails
export function generateEmailBatch(count: number): SyntheticEmail[] {
  const emails: SyntheticEmail[] = [];
  for (let i = 0; i < count; i++) {
    emails.push(generateRandomEmail());
  }
  return emails;
}

// Function to generate emails with predefined stress patterns
export function generateStressTestEmails(count: number): SyntheticEmail[] {
  const emails: SyntheticEmail[] = [];
  
  // Generate high-stress emails (30%)
  const highStressCount = Math.floor(count * 0.3);
  for (let i = 0; i < highStressCount; i++) {
    const email = generateRandomEmail();
    email.metadata.priority = 'high';
    email.metadata.stressLevel = 8 + Math.floor(Math.random() * 3); // 8-10
    email.metadata.sentiment = 'negative';
    email.metadata.needsResponse = true;
    email.isRead = false;
    emails.push(email);
  }
  
  // Generate medium-stress emails (40%)
  const mediumStressCount = Math.floor(count * 0.4);
  for (let i = 0; i < mediumStressCount; i++) {
    const email = generateRandomEmail();
    email.metadata.priority = 'medium';
    email.metadata.stressLevel = 4 + Math.floor(Math.random() * 4); // 4-7
    email.metadata.sentiment = 'neutral';
    emails.push(email);
  }
  
  // Generate low-stress emails (30%)
  const lowStressCount = count - highStressCount - mediumStressCount;
  for (let i = 0; i < lowStressCount; i++) {
    const email = generateRandomEmail();
    email.metadata.priority = 'low';
    email.metadata.stressLevel = 1 + Math.floor(Math.random() * 3); // 1-3
    email.metadata.sentiment = 'positive';
    email.metadata.needsResponse = false;
    emails.push(email);
  }
  
  return emails;
} 