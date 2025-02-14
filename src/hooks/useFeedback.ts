import { useState } from 'react';
import { logAnalytics } from '../utils/analytics';

export const useFeedback = () => {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  
  const submitFeedback = async (data: FeedbackData) => {
    try {
      await api.post('/feedback', data);
      logAnalytics('feedback_submitted', {
        type: data.type,
        page: window.location.pathname
      });
    } catch (error) {
      console.error('Feedback submission failed:', error);
      throw new Error('Unable to submit feedback. Please try again.');
    }
  };
  
  return { feedback, submitFeedback };
}; 