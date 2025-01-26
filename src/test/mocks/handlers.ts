import { rest } from 'msw';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const handlers = [
  // Auth handlers
  rest.post(`${API_URL}/api/auth/login`, (req, res, ctx) => {
    return res(
      ctx.json({
        token: 'fake-jwt-token',
        user: {
          id: 1,
          email: 'test@example.com'
        }
      })
    );
  }),

  // AI handlers
  rest.post(`${API_URL}/api/ai/summarize`, (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        summary: 'Test summary',
        priority: 'HIGH',
        actions: ['Action 1', 'Action 2']
      })
    );
  }),

  rest.post(`${API_URL}/api/ai/priority`, (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        priority: 'HIGH'
      })
    );
  })
]; 