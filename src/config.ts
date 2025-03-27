export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const APP_CONFIG = {
  api: {
    timeout: 15000,
    retries: 3,
  },
  accessibility: {
    minContrast: 4.5,
    animationDuration: 300,
    focusRingWidth: '3px',
  }
}; 