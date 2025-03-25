import { EmailMessage, Priority, StressLevel, Category } from '../../types/email';

// Mock emails for testing
export const mockEmails: EmailMessage[] = [
  {
    id: 1,
    subject: 'Project Deadline Extension',
    sender: {
      name: 'Alex Johnson',
      email: 'boss@company.com'
    },
    content: `Hi Team,

I wanted to inform everyone that we're extending the project deadline by two weeks. 
We understand that there have been some unexpected challenges, and we want to ensure that the quality of work isn't compromised.

Please adjust your schedules accordingly and let me know if you have any concerns.

Best regards,
Alex Johnson
Project Manager`,
    preview: "I wanted to inform everyone that we're extending the project deadline by two weeks.",
    timestamp: new Date('2023-06-15T10:30:00').toISOString(),
    priority: 'MEDIUM' as Priority,
    is_read: true,
    category: 'inbox' as Category,
    processed: true,
    stress_level: 'LOW' as StressLevel,
    sentiment_score: 0.7,
    summary: 'Project deadline extended by two weeks due to unexpected challenges.',
    action_required: true,
    action_items: [
      {
        id: '1-1',
        description: 'Adjust project schedule',
        completed: false
      }
    ]
  },
  {
    id: 2,
    subject: 'URGENT: Server Outage Reported',
    sender: {
      name: 'IT Support',
      email: 'support@company.com'
    },
    content: `ALERT: CRITICAL SERVER OUTAGE

Our monitoring system has detected a critical outage on the main production servers.
Immediate action is required. All hands needed to resolve this issue.
Customers are reporting inability to access the platform.

Please respond ASAP with your availability to join the emergency response team.

IT Support Team`,
    preview: 'ALERT: CRITICAL SERVER OUTAGE',
    timestamp: new Date('2023-06-14T16:45:00').toISOString(),
    priority: 'HIGH' as Priority,
    is_read: false,
    category: 'inbox' as Category,
    processed: true,
    stress_level: 'HIGH' as StressLevel,
    sentiment_score: -0.8,
    summary: 'Critical server outage detected. Immediate action required.',
    action_required: true,
    action_items: [
      {
        id: '2-1',
        description: 'Respond with availability',
        completed: false
      },
      {
        id: '2-2',
        description: 'Join emergency response team',
        completed: false
      }
    ]
  },
  {
    id: 3,
    subject: 'Friendly Reminder: Team Lunch Tomorrow',
    sender: {
      name: 'HR Team',
      email: 'hr@company.com'
    },
    content: `Hello everyone,

Just a friendly reminder that we have our monthly team lunch scheduled for tomorrow at 12:30 PM at The Garden Restaurant.

Looking forward to seeing you all there for some good food and great conversation!

Cheers,
HR Team`,
    preview: 'Just a friendly reminder that we have our monthly team lunch scheduled for tomorrow at 12:30 PM.',
    timestamp: new Date('2023-06-13T11:15:00').toISOString(),
    priority: 'LOW' as Priority,
    is_read: true,
    category: 'inbox' as Category,
    processed: true,
    stress_level: 'LOW' as StressLevel,
    sentiment_score: 0.9,
    summary: 'Monthly team lunch reminder for tomorrow at 12:30 PM at The Garden Restaurant.',
    action_required: false
  },
  {
    id: 4,
    subject: 'Quarterly Performance Review',
    sender: {
      name: 'Taylor Smith',
      email: 'manager@company.com'
    },
    content: `Dear Team Member,

It's time for our quarterly performance reviews. I've scheduled your individual review for next Tuesday at 2:00 PM.

Please prepare a brief summary of your achievements this quarter and any challenges you've faced.

This is a good opportunity to discuss your career goals and any support you might need.

Regards,
Taylor Smith
Department Manager`,
    preview: "It's time for our quarterly performance reviews. I've scheduled your individual review for next Tuesday.",
    timestamp: new Date('2023-06-12T09:00:00').toISOString(),
    priority: 'MEDIUM' as Priority,
    is_read: true,
    category: 'inbox' as Category,
    processed: true,
    stress_level: 'MEDIUM' as StressLevel,
    sentiment_score: 0.1,
    summary: 'Quarterly performance review scheduled for next Tuesday at 2:00 PM.',
    action_required: true,
    action_items: [
      {
        id: '4-1',
        description: 'Prepare summary of achievements',
        completed: false
      },
      {
        id: '4-2',
        description: 'Note down career goals to discuss',
        completed: false
      }
    ]
  },
  {
    id: 5,
    subject: 'Past Due Invoice Reminder',
    sender: {
      name: 'Accounts Receivable',
      email: 'billing@vendor.com'
    },
    content: `FINAL NOTICE: PAYMENT PAST DUE

This is a final reminder that invoice #INV-3829 for $5,643.00 is now 30 days past due.

If payment is not received within 7 days, we may be forced to suspend services and apply late payment fees.

Please contact our billing department immediately to resolve this issue.

Accounts Receivable Department`,
    preview: 'FINAL NOTICE: PAYMENT PAST DUE. Invoice #INV-3829 for $5,643.00 is now 30 days past due.',
    timestamp: new Date('2023-06-11T14:30:00').toISOString(),
    priority: 'HIGH' as Priority,
    is_read: false,
    category: 'inbox' as Category,
    processed: true,
    stress_level: 'HIGH' as StressLevel,
    sentiment_score: -0.7,
    summary: 'Final notice for past due invoice #INV-3829 for $5,643.00. Payment needed within 7 days.',
    action_required: true,
    action_items: [
      {
        id: '5-1',
        description: 'Contact billing department',
        completed: false
      },
      {
        id: '5-2',
        description: 'Process payment for invoice #INV-3829',
        completed: false
      }
    ]
  },
  {
    id: 6,
    subject: 'Weekend Hiking Trip Plan',
    sender: {
      name: 'Jamie',
      email: 'friend@personal.com'
    },
    content: `Hey there!

I'm planning a hiking trip this weekend to Mountain Trail Park. Would you like to join?

We're thinking of starting early on Saturday, around 7:00 AM. Should be back by afternoon.

Let me know if you're interested, and I'll send more details.

Cheers,
Jamie`,
    preview: "I'm planning a hiking trip this weekend to Mountain Trail Park. Would you like to join?",
    timestamp: new Date('2023-06-10T18:20:00').toISOString(),
    priority: 'LOW' as Priority,
    is_read: true,
    category: 'inbox' as Category,
    processed: true,
    stress_level: 'LOW' as StressLevel,
    sentiment_score: 0.8,
    summary: 'Invitation to join a hiking trip to Mountain Trail Park this Saturday at 7:00 AM.',
    action_required: true,
    action_items: [
      {
        id: '6-1',
        description: 'Respond to hiking invitation',
        completed: false
      }
    ]
  },
  {
    id: 7,
    subject: 'Job Application Status Update',
    sender: {
      name: 'Recruitment Team',
      email: 'careers@dreamcompany.com'
    },
    content: `Dear Applicant,

Thank you for your patience regarding your application for the Senior Developer position.

We are pleased to inform you that you have been shortlisted for the next round of interviews.

You will receive a separate email shortly with details about the technical assessment and interview schedule.

Best regards,
Recruitment Team
Dream Company Inc.`,
    preview: 'Thank you for your patience regarding your application for the Senior Developer position.',
    timestamp: new Date('2023-06-09T15:10:00').toISOString(),
    priority: 'MEDIUM' as Priority,
    is_read: true,
    category: 'inbox' as Category,
    processed: true,
    stress_level: 'MEDIUM' as StressLevel,
    sentiment_score: 0.6,
    summary: 'Job application for Senior Developer position has been shortlisted for next round.',
    action_required: false
  },
  {
    id: 8,
    subject: 'Changes to Company Benefits Policy',
    sender: {
      name: 'Human Resources',
      email: 'hr@company.com'
    },
    content: `Important Notice to All Employees:

Please be informed that there will be changes to our company benefits policy effective next month.

Key changes include:
- Revised health insurance coverage
- Updates to the retirement plan contribution matching
- New wellness program benefits

A detailed document will be shared in the coming days, and an information session is scheduled for next Thursday.

Human Resources Department`,
    preview: 'Please be informed that there will be changes to our company benefits policy effective next month.',
    timestamp: new Date('2023-06-08T10:45:00').toISOString(),
    priority: 'MEDIUM' as Priority,
    is_read: false,
    category: 'inbox' as Category,
    processed: true,
    stress_level: 'LOW' as StressLevel,
    sentiment_score: 0.2,
    summary: 'Changes to company benefits policy starting next month. Information session next Thursday.',
    action_required: true,
    action_items: [
      {
        id: '8-1',
        description: 'Attend information session on Thursday',
        completed: false
      }
    ]
  },
  {
    id: 9,
    subject: 'Family Reunion Planning',
    sender: {
      name: 'Mom',
      email: 'mom@family.com'
    },
    content: `Hi sweetheart,

We're planning the family reunion for next month and wanted to check if July 15-16 works for you?

Everyone's excited to see you! Your uncle Joe is coming all the way from Australia.

Please let me know if you can make it, and if you're bringing anyone.

Love you lots,
Mom`,
    preview: "We're planning the family reunion for next month and wanted to check if July 15-16 works for you?",
    timestamp: new Date('2023-06-07T20:30:00').toISOString(),
    priority: 'LOW' as Priority,
    is_read: true,
    category: 'inbox' as Category,
    processed: true,
    stress_level: 'LOW' as StressLevel,
    sentiment_score: 0.9,
    summary: 'Family reunion planned for July 15-16. Need to confirm attendance.',
    action_required: true,
    action_items: [
      {
        id: '9-1',
        description: 'Respond about family reunion attendance',
        completed: false
      }
    ]
  },
  {
    id: 10,
    subject: 'Critical Security Vulnerability Alert',
    sender: {
      name: 'Security Operations Center',
      email: 'security@company.com'
    },
    content: `SECURITY ALERT: IMMEDIATE ACTION REQUIRED

A critical vulnerability has been identified in our core systems.

All team members must:
1. Change their passwords immediately
2. Update all system software
3. Verify two-factor authentication is enabled

This is not a drill. Please comply within the next 24 hours.

Security Operations Center`,
    preview: 'SECURITY ALERT: IMMEDIATE ACTION REQUIRED. A critical vulnerability has been identified in our core systems.',
    timestamp: new Date('2023-06-06T08:15:00').toISOString(),
    priority: 'HIGH' as Priority,
    is_read: false,
    category: 'inbox' as Category,
    processed: true,
    stress_level: 'HIGH' as StressLevel,
    sentiment_score: -0.9,
    summary: 'Critical security vulnerability identified. Password change, software updates, and 2FA verification required within 24 hours.',
    action_required: true,
    action_items: [
      {
        id: '10-1',
        description: 'Change password',
        completed: false
      },
      {
        id: '10-2',
        description: 'Update system software',
        completed: false
      },
      {
        id: '10-3',
        description: 'Verify two-factor authentication',
        completed: false
      }
    ]
  }
];

// Mock user profile data
export const mockUserProfile = {
  id: 'user1',
  name: 'Alex Smith',
  email: 'alex.smith@company.com',
  role: 'Software Developer',
  department: 'Engineering',
  stressLevel: 'moderate',
  emailVolume: {
    daily: 45,
    weekly: 315,
    monthly: 1350
  },
  preferredWorkingHours: {
    start: '09:00',
    end: '17:00'
  }
};

// Mock stress report data
export const mockStressReport = {
  overall: {
    score: 6.7,
    level: 'Moderate',
    trend: 'Increasing'
  },
  sources: [
    { type: 'Urgent emails', percentage: 35 },
    { type: 'After-hours communication', percentage: 28 },
    { type: 'High-priority tasks', percentage: 22 },
    { type: 'Meeting invitations', percentage: 15 }
  ],
  recommendations: [
    'Consider establishing "no-email" hours during your day',
    'Set up email filters to prioritize important messages',
    'Delegate some responses to team members when appropriate',
    'Schedule specific times for checking and responding to email'
  ],
  historicalData: [
    { week: '1', score: 5.2 },
    { week: '2', score: 5.8 },
    { week: '3', score: 6.1 },
    { week: '4', score: 6.7 }
  ]
}; 