import { render } from './test-utils';
import { mockEmails, mockUser, mockAuthResponse } from './mockData';
import { screen, waitFor, fireEvent, within } from '@testing-library/react';

export {
  render,
  mockEmails,
  mockUser,
  mockAuthResponse,
};

// Export testing-library utilities
export { screen, waitFor, fireEvent, within } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Common test utilities
export const waitForLoadingToFinish = async () => {
  await waitFor(() => {
    const loadingElement = screen.queryByRole('status', { hidden: true });
    if (loadingElement) {
      throw new Error('Loading not finished');
    }
  });
};

export const mockConsoleError = () => {
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });
}; 