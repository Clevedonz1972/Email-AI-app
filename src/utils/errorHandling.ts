import * as Sentry from '@sentry/react';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

interface ErrorContext {
  severity?: ErrorSeverity;
  userId?: string;
  additionalData?: Record<string, unknown>;
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

export const handleError = (error: Error | AppError, context?: ErrorContext) => {
  const isAppError = error instanceof AppError;
  const severity = isAppError ? error.severity : context?.severity || ErrorSeverity.MEDIUM;

  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
      severity,
      context: {
        ...(isAppError ? error.context : {}),
        ...context
      }
    });
    return;
  }

  // Send to Sentry in production
  Sentry.withScope((scope) => {
    scope.setLevel(severity as Sentry.SeverityLevel);
    
    if (context?.userId) {
      scope.setUser({ id: context.userId });
    }

    scope.setExtras({
      ...(isAppError ? error.context : {}),
      ...context?.additionalData
    });

    Sentry.captureException(error);
  });
}; 