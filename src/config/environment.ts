interface Environment {
  apiUrl: string;
  sentryDsn?: string;
  aiEndpoint?: string;
  isProduction: boolean;
  features: {
    aiAssistance: boolean;
    templateManagement: boolean;
    accessibilityTools: boolean;
  };
}

export const config: Environment = {
  apiUrl: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000',
  sentryDsn: process.env.REACT_APP_SENTRY_DSN,
  aiEndpoint: process.env.REACT_APP_AI_ENDPOINT,
  isProduction: process.env.NODE_ENV === 'production',
  features: {
    aiAssistance: true,
    templateManagement: true,
    accessibilityTools: true
  }
}; 