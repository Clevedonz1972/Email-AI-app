import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export const initializeMonitoring = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 0.2,
      // Optimize for neurodivergent user experience monitoring
      beforeBreadcrumb(breadcrumb) {
        // Track user interactions with accessibility features
        if (breadcrumb.category === 'ui.click') {
          const target = breadcrumb.message?.includes('aria-');
          if (target) {
            breadcrumb.level = 'info';
            breadcrumb.data = { ...breadcrumb.data, accessibilityEvent: true };
          }
        }
        return breadcrumb;
      }
    });
  }
}; 