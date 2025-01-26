import { useEffect, useCallback } from 'react';
import { logger } from '../utils/logger';

interface AccessibilityEvent {
  type: 'screenReader' | 'keyboard' | 'zoom' | 'highContrast';
  action: string;
  element?: string;
  timestamp: number;
}

export const useAccessibilityTracking = () => {
  const trackAccessibilityEvent = useCallback((event: AccessibilityEvent) => {
    logger.log('info', 'Accessibility Event', {
      ...event,
      userAgent: navigator.userAgent,
      url: window.location.pathname
    });
  }, []);

  useEffect(() => {
    const handleKeyboardNavigation = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        trackAccessibilityEvent({
          type: 'keyboard',
          action: 'navigation',
          element: (document.activeElement as HTMLElement)?.tagName,
          timestamp: Date.now()
        });
      }
    };

    document.addEventListener('keydown', handleKeyboardNavigation);
    return () => document.removeEventListener('keydown', handleKeyboardNavigation);
  }, [trackAccessibilityEvent]);

  return { trackAccessibilityEvent };
}; 