import { render, screen, waitFor } from '@/test/utils';
import { Login } from '../Login';
import { server } from '@/test/mocks/server';
import { http } from 'msw';
import { API_URL } from '@/config';

describe('Login Component', () => {
  it('handles successful login', async () => {
    server.use(
      http.post(`${API_URL}/auth/login`, () => {
        return new Response(JSON.stringify({
          user: { id: '1', email: 'test@example.com' },
          token: 'fake-token'
        }));
      })
    );

    render(<Login />);
    // ... rest of test
  });
}); 