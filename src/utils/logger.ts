import type { LogLevel, LogContext, LogMessage as ILogMessage } from '@/utils/types';

// Extend the base LogMessage interface with additional properties
interface LogMessage extends ILogMessage {
  userId?: string;
  sessionId: string;
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
      this.logToConsole(logMessage);
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

  private logToConsole(logMessage: LogMessage) {
    const { level, message, context } = logMessage;
    switch (level) {
      case 'error':
        console.error(message, context);
        break;
      case 'warn':
        console.warn(message, context);
        break;
      case 'info':
        console.info(message, context);
        break;
      case 'debug':
        console.log(message, context);
        break;
    }
  }

  private getSessionId(): string {
    return sessionStorage.getItem('sessionId') || 'unknown-session';
  }

  private getUserId(): string | undefined {
    return localStorage.getItem('userId') || undefined;
  }

  info(message: string, context?: Record<string, unknown>) {
    return this.log('info', message, context);
  }

  error(message: string | Error, context?: Record<string, unknown>) {
    return this.log('error', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    return this.log('warn', message, context);
  }

  debug(message: string, context?: Record<string, unknown>) {
    return this.log('debug', message, context);
  }
}

export const logger = Logger.getInstance(); 