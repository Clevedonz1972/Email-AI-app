export const TEST_CONFIG = {
  timeouts: {
    api: 5000,
    animation: 1000,
    render: 1000,
  },
  testIds: {
    loading: 'loading-spinner',
    error: 'error-message',
    success: 'success-message',
  },
  mockData: {
    batchSize: 20,
    categories: ['inbox', 'sent', 'draft', 'trash'],
    priorities: ['LOW', 'MEDIUM', 'HIGH'],
  }
};

export const TEST_ROUTES = {
  auth: {
    login: '/login',
    register: '/register',
    resetPassword: '/reset-password',
    forgotPassword: '/forgot-password',
  },
  app: {
    dashboard: '/dashboard',
    settings: '/settings',
    emails: '/emails',
  }
}; 