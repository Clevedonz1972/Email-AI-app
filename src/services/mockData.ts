import { EmailMessage, Priority, StressLevel } from '../types/email';

export const mockEmails: EmailMessage[] = [
  {
    id: 1,
    subject: "Urgent: Project Deadline Update",
    content: "Hi Team,\n\nThe project deadline has been moved forward to next Friday. We need to adjust our timeline and prioritize the remaining tasks.\n\nPlease update your schedules accordingly and let me know if you foresee any issues meeting this new deadline.\n\nRegards,\nSarah",
    preview: "The project deadline has been moved forward to next Friday...",
    sender: {
      email: "sarah@example.com",
      name: "Sarah Johnson"
    },
    timestamp: new Date(2023, 2, 15, 9, 30).toISOString(),
    is_read: false,
    priority: "HIGH",
    stress_level: "HIGH",
    category: "inbox",
    processed: true,
    action_required: true,
    sentiment_score: 0.3,
    action_items: [
      {
        id: "1-1",
        description: "Update project timeline",
        completed: false
      },
      {
        id: "1-2",
        description: "Adjust task priorities",
        completed: false
      },
      {
        id: "1-3",
        description: "Schedule team meeting",
        completed: false
      }
    ]
  },
  {
    id: 2,
    subject: "Weekly Team Check-in",
    content: "Hello everyone,\n\nJust a reminder that we have our weekly team check-in tomorrow at 10:00 AM. Please come prepared with updates on your current tasks and any blockers you're facing.\n\nLooking forward to catching up!\n\nBest,\nMike",
    preview: "Just a reminder that we have our weekly team check-in tomorrow...",
    sender: {
      email: "mike@example.com",
      name: "Mike Smith"
    },
    timestamp: new Date(2023, 2, 14, 16, 45).toISOString(),
    is_read: true,
    priority: "MEDIUM",
    stress_level: "MEDIUM",
    category: "inbox",
    processed: true,
    action_required: true,
    sentiment_score: 0.7,
    action_items: [
      {
        id: "2-1",
        description: "Prepare task updates",
        completed: false
      },
      {
        id: "2-2",
        description: "Note any blockers",
        completed: false
      }
    ]
  },
  {
    id: 3,
    subject: "Budget Approval Needed",
    content: "Hello,\n\nWe need your approval for the Q2 budget proposal by EOD today. The finance team is waiting on this to proceed with resource allocation.\n\nThe documents are attached for your review.\n\nThanks,\nFinance Team",
    preview: "We need your approval for the Q2 budget proposal by EOD today...",
    sender: {
      email: "finance@example.com",
      name: "Finance Team"
    },
    timestamp: new Date(2023, 2, 14, 11, 20).toISOString(),
    is_read: false,
    priority: "HIGH",
    stress_level: "HIGH",
    category: "inbox",
    processed: true,
    action_required: true,
    sentiment_score: 0.2,
    action_items: [
      {
        id: "3-1",
        description: "Review budget proposal",
        completed: false
      },
      {
        id: "3-2",
        description: "Provide approval",
        completed: false
      },
      {
        id: "3-3",
        description: "Confirm to Finance team",
        completed: false
      }
    ]
  },
  {
    id: 4,
    subject: "Office Party Next Friday",
    content: "Hi all,\n\nWe're planning a small office celebration next Friday at 4:00 PM to mark the successful launch of our new product. Snacks and drinks will be provided.\n\nHope to see you all there!\n\nCheers,\nHR Team",
    preview: "We're planning a small office celebration next Friday at 4:00 PM...",
    sender: {
      email: "hr@example.com",
      name: "HR Team"
    },
    timestamp: new Date(2023, 2, 13, 14, 15).toISOString(),
    is_read: true,
    priority: "LOW",
    stress_level: "LOW",
    category: "inbox",
    processed: true,
    action_required: false,
    sentiment_score: 0.9,
    action_items: [
      {
        id: "4-1",
        description: "RSVP to HR",
        completed: false
      }
    ]
  },
  {
    id: 5,
    subject: "System Maintenance Notification",
    content: "Important Notice:\n\nThere will be a planned system maintenance this Saturday from 10:00 PM to 2:00 AM. During this time, all company systems will be unavailable.\n\nPlease plan your work accordingly and ensure you save any important data before the maintenance window.\n\nIT Department",
    preview: "There will be a planned system maintenance this Saturday from 10:00 PM to 2:00 AM...",
    sender: {
      email: "it@example.com",
      name: "IT Department"
    },
    timestamp: new Date(2023, 2, 13, 9, 0).toISOString(),
    is_read: false,
    priority: "MEDIUM",
    stress_level: "MEDIUM",
    category: "inbox",
    processed: true,
    action_required: true,
    sentiment_score: 0.5,
    action_items: [
      {
        id: "5-1",
        description: "Save important work",
        completed: false
      },
      {
        id: "5-2",
        description: "Adjust weekend work plans",
        completed: false
      }
    ]
  },
  {
    id: 6,
    subject: "Client Feedback: Urgent Issues",
    content: "Team,\n\nWe just received some concerning feedback from our biggest client. They've identified several critical issues with the latest release that need immediate attention.\n\nI've scheduled an emergency meeting at 2:00 PM today to discuss our response. Please prioritize this over other tasks.\n\nThank you,\nAccount Manager",
    preview: "We just received some concerning feedback from our biggest client...",
    sender: {
      email: "accounts@example.com",
      name: "Account Manager"
    },
    timestamp: new Date(2023, 2, 15, 10, 30).toISOString(),
    is_read: false,
    priority: "HIGH",
    stress_level: "HIGH",
    category: "inbox",
    processed: true,
    action_required: true,
    sentiment_score: 0.1,
    action_items: [
      {
        id: "6-1",
        description: "Attend emergency meeting",
        completed: false
      },
      {
        id: "6-2",
        description: "Review client issues",
        completed: false
      },
      {
        id: "6-3",
        description: "Prepare response plan",
        completed: false
      }
    ]
  },
  {
    id: 7,
    subject: "Vacation Request Approved",
    content: "Hi John,\n\nI've approved your vacation request for next month. Enjoy your well-deserved break!\n\nPlease ensure your tasks are properly handed over before you leave.\n\nBest regards,\nYour Manager",
    preview: "I've approved your vacation request for next month. Enjoy your well-deserved break!",
    sender: {
      email: "manager@example.com",
      name: "Your Manager"
    },
    timestamp: new Date(2023, 2, 12, 11, 45).toISOString(),
    is_read: true,
    priority: "LOW",
    stress_level: "LOW",
    category: "inbox",
    processed: true,
    action_required: true,
    sentiment_score: 0.8,
    action_items: [
      {
        id: "7-1",
        description: "Prepare handover document",
        completed: false
      },
      {
        id: "7-2",
        description: "Set up out-of-office reply",
        completed: false
      }
    ]
  },
  {
    id: 8,
    subject: "Performance Review Scheduled",
    content: "Dear Employee,\n\nYour annual performance review has been scheduled for next Wednesday at 11:00 AM in meeting room 3.\n\nPlease come prepared with a self-assessment of your achievements and goals for the coming year.\n\nHR Department",
    preview: "Your annual performance review has been scheduled for next Wednesday at 11:00 AM...",
    sender: {
      email: "hr@example.com",
      name: "HR Department"
    },
    timestamp: new Date(2023, 2, 12, 9, 10).toISOString(),
    is_read: false,
    priority: "MEDIUM",
    stress_level: "MEDIUM",
    category: "inbox",
    processed: true,
    action_required: true,
    sentiment_score: 0.4,
    action_items: [
      {
        id: "8-1",
        description: "Prepare self-assessment",
        completed: false
      },
      {
        id: "8-2",
        description: "Document achievements",
        completed: false
      },
      {
        id: "8-3",
        description: "Set future goals",
        completed: false
      }
    ]
  }
];

export const mockEmailAnalysis = {
  sentiment_score: 0.7,
  summary: "This is a sample email with positive sentiment.",
  stress_level: "LOW" as StressLevel,
  priority: "MEDIUM" as Priority,
  action_items: [
    { id: "1", description: "Review attachments", completed: false },
    { id: "2", description: "Follow up with sender", completed: false }
  ]
};

export const mockStressReport = {
  overall_score: 0.35,
  daily_trend: [0.5, 0.4, 0.6, 0.3, 0.35],
  sources: [
    { source: "Work emails", percentage: 60 },
    { source: "Personal emails", percentage: 25 },
    { source: "Newsletter", percentage: 15 }
  ],
  recommendations: [
    "Schedule dedicated time for email responses",
    "Consider turning off notifications during focus hours",
    "Use AI tools to prioritize your inbox"
  ]
};

export const mockReplyOptions = {
  suggestions: [
    "Thanks for your email. I'll review the information and get back to you soon.",
    "I appreciate your message. Let me look into this and I'll respond with more details.",
    "Thank you for reaching out. I'll address your questions in my response."
  ],
  tone_suggestions: ["Professional", "Friendly", "Concise"]
}; 