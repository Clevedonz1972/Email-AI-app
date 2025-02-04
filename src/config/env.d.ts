declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_BACKEND_URL: string;
    REACT_APP_SENTRY_DSN?: string;
    REACT_APP_AI_ENDPOINT?: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
} 