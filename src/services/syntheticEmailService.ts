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

  getEmailsNeedingResponse: async (): Promise<SyntheticEmail[]> => {
    return Promise.resolve(syntheticEmailService.generateSyntheticEmails(4).map(email => ({
      ...email,
      metadata: {
        ...email.metadata,
        needsResponse: true
      }
    })));
  },

  getEmailsWithActionItems: async (): Promise<SyntheticEmail[]> => {
    return Promise.resolve(syntheticEmailService.generateSyntheticEmails(3).map(email => ({
      ...email,
      metadata: {
        ...email.metadata,
        actionItems: ["Action item 1", "Action item 2"]
      }
    })));
  },

  markAsRead: async (id: string): Promise<boolean> => {
    return Promise.resolve(true);
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