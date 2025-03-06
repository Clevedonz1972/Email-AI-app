import { http, HttpResponse } from 'msw';
import { mockEmails } from '@/test/utils/mockData';

const API_URL = process.env.REACT_APP_API_URL || '/api';

export const handlers = [
  // Auth endpoints
  http.post(`${API_URL}/auth/login`, () => {
    return HttpResponse.json({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User'
      },
      tokens: {
        accessToken: 'fake-access-token',
        refreshToken: 'fake-refresh-token'
      }
    });
  }),

  http.post(`${API_URL}/auth/forgot-password`, () => {
    return HttpResponse.json({ message: 'Password reset email sent' });
  }),

  http.post(`${API_URL}/auth/reset-password/:token`, () => {
    return HttpResponse.json({ message: 'Password updated successfully' });
  }),

  // Email endpoints
  http.get(`${API_URL}/emails`, () => {
    return HttpResponse.json(mockEmails);
  }),

  http.get(`${API_URL}/emails/:id`, ({ params }) => {
    const { id } = params;
    const email = mockEmails.find(email => email.id === Number(id));
    
    if (!email) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(email);
  }),
]; 