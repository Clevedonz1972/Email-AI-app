import { logger } from './logger';

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

export const logAnalytics = async (event: AnalyticsEvent): Promise<void> => {
  try {
    // Log to our analytics service
    await fetch('/api/analytics/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    // Also log to our application logger
    logger.info('Analytics event logged', { event });
  } catch (error) {
    logger.error('Failed to log analytics event', { error, event });
  }
}; 