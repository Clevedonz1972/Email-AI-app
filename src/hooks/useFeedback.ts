import { useState } from 'react';
import { logAnalytics } from '../utils/analytics';
import type { Feedback, FeedbackData } from '../types/feedback';
import { api } from '../services/api';

export const useFeedback = () => {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  
  const submitFeedback = async (data: FeedbackData) => {
    try {
      const response = await api.post<Feedback>('/feedback', data);
      setFeedback(response.data);
      logAnalytics({
        category: 'feedback',
        action: 'submit',
        label: data.type,
        metadata: {
          page: window.location.pathname,
          category: data.category
        }
      });
    } catch (error) {
      console.error('Feedback submission failed:', error);
      throw new Error('Unable to submit feedback. Please try again.');
    }
  };
  
  return { feedback, submitFeedback };
}; 