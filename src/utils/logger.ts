import { LogLevel } from './types';

interface LogMessage {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
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

  async log(level: LogLevel, message: string, context?: Record<string, any>) {
    const logMessage: LogMessage = {
      level,
      message,
      context,
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
    try {
      await fetch(this.loggingEndpoint!, {
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
      default:
        console.log(message, context);
    }
  }

  private getSessionId(): string {
    // Implement session tracking
    return 'session-id';
  }

  private getUserId(): string | undefined {
    // Get user ID from auth context
    return undefined;
  }
}

export const logger = Logger.getInstance(); 