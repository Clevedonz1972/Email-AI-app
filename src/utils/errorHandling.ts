import React from 'react';
import * as Sentry from '@sentry/react';
import type { Context, Scope, Severity } from '@sentry/types';
import { logger } from '@/utils/logger';

export enum ErrorSeverity {
  LOW = 'debug',
  MEDIUM = 'warning',
  HIGH = 'error',
  CRITICAL = 'fatal'
}

interface ErrorContext extends Record<string, unknown> {
  componentStack?: string;
  severity?: ErrorSeverity;
  userId?: string;
  additionalData?: Record<string, unknown>;
  metadata?: Record<string, string | number>;
}

export class AppError extends Error {
  severity: ErrorSeverity;
  context?: Record<string, unknown>;

  constructor(message: string, severity: ErrorSeverity = ErrorSeverity.MEDIUM, context?: Record<string, unknown>) {
    super(message);
    this.name = 'AppError';
    this.severity = severity;
    this.context = context;
  }
}

export const logError = (error: Error, context?: ErrorContext): void => {
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    ...context
  });

  if (process.env.NODE_ENV === 'production') {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      Sentry.captureException(error);
    });
  }
};

export const handleApiError = async (error: unknown): Promise<string> => {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  
  logError(error instanceof Error ? error : new Error(message));
  
  return message;
};

export const createErrorBoundaryFallback = (message: string) => {
  return React.createElement('div', { role: 'alert' },
    React.createElement('h2', null, 'Something went wrong'),
    React.createElement('p', null, message),
    React.createElement('button', {
      onClick: () => window.location.reload()
    }, 'Try again')
  );
};

export const handleError = (error: Error | AppError, context?: ErrorContext) => {
  const isAppError = error instanceof AppError;
  const severity = isAppError ? error.severity : context?.severity || ErrorSeverity.MEDIUM;

  if (process.env.NODE_ENV === 'production') {
    Sentry.withScope((scope: Scope) => {
      const sentrySeverity = (severity.toLowerCase() as unknown) as Severity;
      scope.setLevel(sentrySeverity);
      
      if (context) {
        scope.setContext('error', context);
      }

      if (isAppError && error.context) {
        scope.setContext('app_error', error.context);
      }

      Sentry.captureException(error);
    });
  } else {
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
      severity,
      context: {
        ...(isAppError ? error.context : {}),
        ...context
      }
    });
  }
};

export const captureError = (error: Error, context?: ErrorContext) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.withScope((scope: Scope) => {
      if (context) {
        const sentryContext: Context = {
          ...context,
          timestamp: Date.now(),
          environment: process.env.NODE_ENV
        };
        scope.setContext('error', sentryContext);
      }
      Sentry.captureException(error);
    });
  }
  console.error('Error:', error, context);
}; 