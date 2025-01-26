import { useEffect, useRef } from 'react';
import { logger } from '../utils/logger';

interface InteractionMetrics {
  timeToFirstInteraction: number;
  interactionDuration: number;
  errorCount: number;
  recoveryAttempts: number;
}

export const usePerformanceTracking = (componentName: string) => {
  const metrics = useRef<InteractionMetrics>({
    timeToFirstInteraction: 0,
    interactionDuration: 0,
    errorCount: 0,
    recoveryAttempts: 0
  });

  const startTime = useRef(Date.now());

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        logger.log('info', 'Performance Metric', {
          component: componentName,
          metric: entry.name,
          value: entry.startTime,
          duration: entry.duration
        });
      }
    });

    observer.observe({ entryTypes: ['longtask', 'event'] });
    return () => observer.disconnect();
  }, [componentName]);

  return metrics.current;
}; 