import { useCallback } from 'react';
import { logger } from '@/utils/logger';

interface AccessibilityEvent {
  type: string;
  element: string;
  action: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export const useAccessibilityTracking = () => {
  const trackAccessibilityEvent = useCallback((event: AccessibilityEvent) => {
    logger.info('Accessibility event tracked', {
      ...event,
      timestamp: Date.now()
    });
  }, []);

  return { trackAccessibilityEvent };
}; 