// App configuration

// API URL - defaults to localhost in development
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Feature flags
export const FEATURES = {
  stressMonitoring: true,
  aiSuggestions: true,
  emailAnalytics: true,
  darkMode: true
};

// UI Configuration
export const UI_CONFIG = {
  emailsPerPage: 20,
  refreshInterval: 60000, // 1 minute
  defaultTheme: 'light'
};

// User preferences (these would normally be stored in user profile)
export const DEFAULT_USER_PREFERENCES = {
  emailFormat: 'html', // 'html' or 'plain'
  notificationsEnabled: true,
  autoRefresh: true,
  showUnreadFirst: true
}; 