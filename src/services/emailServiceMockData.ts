// Mock data for emailService
import { EmailAnalysis, Priority, StressLevel } from '../types/email';

// Mock analysis of emails for testing
export const mockEmailAnalysis: EmailAnalysis = {
  summary: 'This email requires immediate attention regarding the project deadline.',
  stress_level: 'MEDIUM' as StressLevel,
  priority: 'HIGH' as Priority,
  action_items: [
    {
      id: 'action-1',
      description: 'Review project timeline',
      completed: false
    },
    {
      id: 'action-2',
      description: 'Schedule team meeting',
      completed: false
    },
    {
      id: 'action-3',
      description: 'Prepare status report',
      completed: false
    }
  ],
  sentiment_score: 0.3
};

// Mock reply options for testing
export const mockReplyOptions = {
  suggestions: [
    "I'll review the project timeline and get back to you by tomorrow.",
    "Thanks for bringing this to my attention. Let's discuss this in our next meeting.",
    "I understand the urgency and will prioritize this task."
  ],
  simplified_version: "I'll address this as soon as possible and update you by tomorrow.",
  available_tones: ['Professional', 'Friendly', 'Concise', 'Detailed']
};

// Mock stress report for testing
export const mockStressReport = {
  overallStress: 'MEDIUM',
  needsBreak: false,
  recommendations: [
    'Set specific times during the day to check emails rather than constantly monitoring',
    'Use filters to organize your inbox based on priority',
    'Take short breaks between handling stressful emails'
  ],
  stressBreakdown: {
    high: 3,
    medium: 12,
    low: 25
  }
}; 