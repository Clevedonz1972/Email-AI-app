// Mock service for generating synthetic emails

export interface SyntheticEmail {
  id: string;
  subject: string;
  body: string;
  from: {
    email: string;
    name: string;
  };
  date: Date;
  isRead: boolean;
  folder: string;
  metadata: {
    needsResponse: boolean;
    priority: string;
    stressLevel: string;
    actionItems: string[];
    sentiment: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
  };
}

const syntheticEmailService = {
  generateSyntheticEmail: (): SyntheticEmail => {
    return {
      id: Math.random().toString(36).substring(2, 10),
      subject: "Synthetic Email Subject",
      body: "This is a synthetic email body generated for testing purposes.",
      from: {
        email: "synthetic@example.com",
        name: "Synthetic Sender"
      },
      date: new Date(),
      isRead: Math.random() > 0.5,
      folder: Math.random() > 0.7 ? "inbox" : Math.random() > 0.4 ? "archive" : "trash",
      metadata: {
        needsResponse: Math.random() > 0.5,
        priority: Math.random() > 0.7 ? "HIGH" : Math.random() > 0.4 ? "MEDIUM" : "LOW",
        stressLevel: Math.random() > 0.7 ? "HIGH" : Math.random() > 0.4 ? "MEDIUM" : "LOW",
        actionItems: ["Review synthetic data", "Test email interface"],
        sentiment: Math.random() > 0.8 ? "very_positive" : 
                  Math.random() > 0.6 ? "positive" : 
                  Math.random() > 0.4 ? "neutral" : 
                  Math.random() > 0.2 ? "negative" : "very_negative"
      }
    };
  },
  
  generateSyntheticEmails: (count: number): SyntheticEmail[] => {
    return Array(count).fill(null).map(() => syntheticEmailService.generateSyntheticEmail());
  },

  // Add missing methods
  getAllEmails: async (): Promise<SyntheticEmail[]> => {
    return Promise.resolve(syntheticEmailService.generateSyntheticEmails(10));
  },

  getStressReport: async () => {
    return Promise.resolve({
      overall_score: Math.random(),
      daily_trend: [0.3, 0.5, 0.7, 0.4, 0.6],
      sources: [
        { source: 'Work', percentage: 60 },
        { source: 'Personal', percentage: 30 },
        { source: 'Other', percentage: 10 }
      ],
      recommendations: [
        'Take regular breaks',
        'Use email filters',
        'Schedule email checking times'
      ],
      overallStress: Math.random() > 0.7 ? "HIGH" : Math.random() > 0.4 ? "MEDIUM" : "LOW",
      needsBreak: Math.random() > 0.5,
      stressBreakdown: {
        high: Math.floor(Math.random() * 10),
        medium: Math.floor(Math.random() * 20),
        low: Math.floor(Math.random() * 30)
      }
    });
  },

  generateReply: async (emailId: string) => {
    return Promise.resolve({
      id: Math.random().toString(36).substring(2, 10),
      body: "Thank you for your email. I'll review the details and get back to you soon with more information.\n\nBest regards,\nUser",
      subject: "Re: Synthetic Email"
    });
  },

  getEmailById: async (id: string): Promise<SyntheticEmail | null> => {
    return Promise.resolve(syntheticEmailService.generateSyntheticEmail());
  },

  getEmailsByFolder: async (folder: string): Promise<SyntheticEmail[]> => {
    return Promise.resolve(syntheticEmailService.generateSyntheticEmails(5).map(email => ({
      ...email,
      folder
    })));
  },

  getEmailsByCategory: async (category: string): Promise<SyntheticEmail[]> => {
    return Promise.resolve(syntheticEmailService.generateSyntheticEmails(5));
  },

  getHighPriorityEmails: async (): Promise<SyntheticEmail[]> => {
    return Promise.resolve(syntheticEmailService.generateSyntheticEmails(3).map(email => ({
      ...email,
      metadata: {
        ...email.metadata,
        priority: "HIGH"
      }
    })));
  },

  // New method to generate emails that require action
  getEmailsRequiringAction: async (): Promise<SyntheticEmail[]> => {
    const actionEmails = [
      {
        id: Math.random().toString(36).substring(2, 10),
        subject: "Request for Project Updates",
        body: "Hi there,\n\nCan you please provide an update on the current project status? We need to prepare for the upcoming client meeting, and I would appreciate if you could send me the latest metrics and any blockers you're facing.\n\nPlease send this by EOD tomorrow.\n\nThanks,\nProject Manager",
        from: {
          email: "manager@company.com",
          name: "Project Manager"
        },
        date: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        isRead: false,
        folder: "inbox",
        metadata: {
          needsResponse: true,
          priority: "HIGH",
          stressLevel: "MEDIUM",
          actionItems: [
            "Prepare project status report",
            "Compile latest metrics",
            "Document current blockers",
            "Send response by end of day tomorrow"
          ],
          sentiment: "neutral" as 'neutral'
        }
      },
      {
        id: Math.random().toString(36).substring(2, 10),
        subject: "Urgent: Invoice Approval Needed",
        body: "Hello,\n\nThere is an urgent invoice that requires your approval. The vendor is requesting payment as soon as possible to avoid service interruptions.\n\nPlease review and approve invoice #INV-2023-456 attached to this email.\n\nBest regards,\nFinance Team",
        from: {
          email: "finance@company.com",
          name: "Finance Department"
        },
        date: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
        isRead: false,
        folder: "inbox",
        metadata: {
          needsResponse: true,
          priority: "HIGH",
          stressLevel: "HIGH",
          actionItems: [
            "Review invoice #INV-2023-456",
            "Approve payment",
            "Confirm approval with Finance team"
          ],
          sentiment: "negative" as 'negative'
        }
      },
      {
        id: Math.random().toString(36).substring(2, 10),
        subject: "Meeting Request with Client",
        body: "Hi,\n\nOur client has requested a meeting to discuss the next phase of the project. They're available next Tuesday or Wednesday afternoon.\n\nCould you please let me know your availability so I can schedule this important meeting?\n\nRegards,\nAccount Manager",
        from: {
          email: "accounts@company.com",
          name: "Account Manager"
        },
        date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        isRead: true,
        folder: "inbox",
        metadata: {
          needsResponse: true,
          priority: "MEDIUM",
          stressLevel: "LOW",
          actionItems: [
            "Check calendar for Tuesday and Wednesday",
            "Send availability to Account Manager",
            "Prepare for client meeting"
          ],
          sentiment: "positive" as 'positive'
        }
      },
      {
        id: Math.random().toString(36).substring(2, 10),
        subject: "Action Required: Update Your Password",
        body: "Dear User,\n\nOur system indicates that your password will expire in 3 days. Please update your password to maintain access to all company systems.\n\nThis is an automated message, please do not reply.\n\nIT Department",
        from: {
          email: "it@company.com",
          name: "IT Department"
        },
        date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        isRead: false,
        folder: "inbox",
        metadata: {
          needsResponse: true,
          priority: "MEDIUM",
          stressLevel: "LOW",
          actionItems: [
            "Update password within 3 days",
            "Ensure password meets security requirements"
          ],
          sentiment: "neutral" as 'neutral'
        }
      }
    ];
    
    return Promise.resolve(actionEmails);
  },

  markAsRead: async (id: string) => {
    return Promise.resolve({ success: true });
  },

  getEmailsNeedingResponse: async (): Promise<SyntheticEmail[]> => {
    return syntheticEmailService.getEmailsRequiringAction();
  },

  getEmailsWithActionItems: async (): Promise<SyntheticEmail[]> => {
    return syntheticEmailService.getEmailsRequiringAction();
  },

  toggleStar: async (id: string): Promise<boolean> => {
    return Promise.resolve(true);
  },

  archiveEmail: async (id: string): Promise<boolean> => {
    return Promise.resolve(true);
  },

  deleteEmail: async (id: string): Promise<boolean> => {
    return Promise.resolve(true);
  }
};

export default syntheticEmailService; 