import { render } from '@testing-library/react';
import { Login } from '@/components/Auth/Login';
import { ForgotPassword } from '@/components/Auth/ForgotPassword';
import { ResetPassword } from '@/components/Auth/ResetPassword';

describe('Auth Components Performance', () => {
  it('Login component renders within performance budget', () => {
    const start = performance.now();
    render(<Login />);
    const end = performance.now();
    expect(end - start).toBeLessThan(100); // 100ms budget
  });

  // ... similar tests for other components
}); 