import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
  value: MockIntersectionObserver
}); 