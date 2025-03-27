import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Login } from '@/components/Auth/Login';
import { ForgotPassword } from '@/components/Auth/ForgotPassword';
import { ResetPassword } from '@/components/Auth/ResetPassword';

expect.extend(toHaveNoViolations);

describe('Auth Components Accessibility', () => {
  it('Login form should have no accessibility violations', async () => {
    const { container } = render(<Login />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Forgot Password form should have no accessibility violations', async () => {
    const { container } = render(<ForgotPassword />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Reset Password form should have no accessibility violations', async () => {
    const { container } = render(<ResetPassword />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 