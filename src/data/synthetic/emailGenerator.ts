// Simple type definition for synthetic emails
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

// The actual implementation would be more sophisticated
export const generateSyntheticEmail = (): SyntheticEmail => {
  return {
    id: Math.random().toString(36).substring(2, 10),
    subject: "Placeholder Subject",
    body: "This is a placeholder email body.",
    from: {
      email: "synthetic@example.com",
      name: "Synthetic Sender"
    },
    date: new Date(),
    isRead: false,
    folder: "inbox",
    metadata: {
      needsResponse: false,
      priority: "MEDIUM",
      stressLevel: "LOW",
      actionItems: ["Placeholder action item"],
      sentiment: "neutral"
    }
  };
}; 