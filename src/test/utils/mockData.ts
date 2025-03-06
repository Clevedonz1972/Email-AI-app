import { EmailMessage, Priority, Category } from '@/types/email';

export const mockEmails: EmailMessage[] = [
  {
    id: 1,
    subject: 'Project Deadline Update',
    content: 'The project deadline has been moved to next week.',
    preview: 'The project deadline has been...',
    sender: {
      email: 'manager@company.com',
      name: 'Project Manager'
    },
    timestamp: '2024-02-20T10:00:00Z',
    priority: 'HIGH',
    stress_level: 'HIGH',
    is_read: false,
    category: 'inbox',
    processed: true,
    action_required: true,
    summary: 'Project deadline changed, action required',
    action_items: [
      { id: '1', description: 'Review updated timeline', completed: false }
    ],
    sentiment_score: 0.3
  },
  {
    id: 2,
    subject: 'Team Meeting Notes',
    content: 'Here are the notes from today\'s team meeting...',
    preview: 'Here are the notes from...',
    sender: {
      email: 'team@company.com',
      name: 'Team Lead'
    },
    timestamp: '2024-02-20T09:00:00Z',
    priority: 'MEDIUM',
    stress_level: 'LOW',
    is_read: true,
    category: 'inbox',
    processed: true,
    action_required: false,
    sentiment_score: 0.7
  }
];

export const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User'
};

export const mockAuthResponse = {
  user: mockUser,
  tokens: {
    accessToken: 'fake-access-token',
    refreshToken: 'fake-refresh-token',
    expiresIn: 3600
  }
}; 