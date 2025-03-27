import type { LogLevel, LogContext, LogMessage as ILogMessage } from '@/utils/types';

// Extend the base LogMessage interface with additional properties
interface LogMessage extends ILogMessage {
  userId?: string;
  sessionId: string;
}

interface LoggerOptions {
  level?: 'info' | 'warn' | 'error';
  metadata?: Record<string, unknown>;
}

class Logger {
  private static instance: Logger;
  private readonly loggingEndpoint = process.env.REACT_APP_LOGGING_API;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  async log(level: LogLevel, message: string | Error, context?: Record<string, unknown>) {
    const logMessage: LogMessage = {
      level,
      message: message instanceof Error ? message.message : message,
      context: message instanceof Error 
        ? { ...context, stack: message.stack }
        : context,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
      userId: this.getUserId()
    };

    if (process.env.NODE_ENV === 'production') {
      await this.sendToLoggingService(logMessage);
    } else {
      this.logToConsole(level, logMessage.message, logMessage.context);
    }
  }

  private async sendToLoggingService(logMessage: LogMessage) {
    if (!this.loggingEndpoint) return;

    try {
      await fetch(this.loggingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logMessage)
      });
    } catch (error) {
      console.error('Failed to send log:', error);
    }
  }

  private logToConsole(level: string, message: string, metadata?: Record<string, unknown>) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...metadata,
    };

    switch (level) {
      case 'error':
        console.error(logData);
        break;
      case 'warn':
        console.warn(logData);
        break;
      default:
        console.log(logData);
    }
  }

  private getSessionId(): string {
    return sessionStorage.getItem('sessionId') || 'unknown-session';
  }

  private getUserId(): string | undefined {
    return localStorage.getItem('userId') || undefined;
  }

  info(message: string, metadata?: Record<string, unknown>) {
    this.logToConsole('info', message, metadata);
  }

  error(message: string | Error, metadata?: Record<string, unknown>) {
    const errorMessage = message instanceof Error ? message.message : message;
    const errorMetadata = message instanceof Error 
      ? { ...metadata, stack: message.stack }
      : metadata;
    this.logToConsole('error', errorMessage, errorMetadata);
  }

  warn(message: string, metadata?: Record<string, unknown>) {
    this.logToConsole('warn', message, metadata);
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context);
  }
}

export const logger = Logger.getInstance(); 