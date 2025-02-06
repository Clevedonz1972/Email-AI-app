import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

export const initializeMonitoring = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      integrations: [new Integrations.BrowserTracing()],
      tracesSampleRate: 1.0,
      beforeSend(event) {
        // Sanitize sensitive data
        if (event.request?.headers) {
          delete event.request.headers['Authorization'];
        }
        return event;
      }
    });
  }
};

export const logError = (error: Error, info?: Record<string, unknown>) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.withScope((scope) => {
      if (info) {
        scope.setContext('additional', info);
      }
      Sentry.captureException(error);
    });
  }
  console.error('Error:', error, info);
}; 