export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogContext {
  [key: string]: unknown;
}

export interface LogMessage {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
} 