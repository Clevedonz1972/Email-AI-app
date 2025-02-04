export const config = {
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    timeout: 30000
  },
  ai: {
    modelName: process.env.REACT_APP_AI_MODEL || 'gpt-4',
    maxTokens: parseInt(process.env.REACT_APP_MAX_TOKENS || '200', 10)
  },
  monitoring: {
    sentryDsn: process.env.REACT_APP_SENTRY_DSN,
    analyticsId: process.env.REACT_APP_ANALYTICS_ID,
    loggingEndpoint: process.env.REACT_APP_LOGGING_API
  },
  accessibility: {
    defaultFontScale: parseFloat(process.env.REACT_APP_DEFAULT_FONT_SCALE || '1'),
    defaultHighContrast: process.env.REACT_APP_DEFAULT_HIGH_CONTRAST === 'true',
    defaultReducedMotion: process.env.REACT_APP_DEFAULT_REDUCED_MOTION === 'true'
  }
}; 