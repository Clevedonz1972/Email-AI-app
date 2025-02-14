import { http, HttpResponse } from 'msw';
import { mockEmails } from '../../test-utils/test-utils';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const handlers = [
  // Auth handlers
  http.post(`${API_URL}/api/auth/login`, () => {
    return HttpResponse.json({
      token: 'fake-jwt-token',
      user: {
        id: 1,
        email: 'test@example.com'
      }
    });
  }),

  // AI handlers
  http.post(`${API_URL}/api/ai/summarize`, () => {
    return HttpResponse.json({
      success: true,
      summary: 'Test summary',
      priority: 'HIGH',
      actions: ['Action 1', 'Action 2']
    });
  }),

  http.post(`${API_URL}/api/ai/priority`, () => {
    return HttpResponse.json({
      success: true,
      priority: 'HIGH'
    });
  }),

  http.get(`${API_URL}/emails`, () => {
    return HttpResponse.json(mockEmails);
  }),

  http.get(`${API_URL}/emails/:id`, ({ params }) => {
    const { id } = params;
    const email = mockEmails.find(email => email.id === id);
    
    if (!email) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(email);
  }),
]; 