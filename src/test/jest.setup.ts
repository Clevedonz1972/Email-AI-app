import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
// Reset any request handlers that we may add during the tests
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  sessionStorage.clear();
});
// Clean up after the tests are finished
afterAll(() => server.close()); 