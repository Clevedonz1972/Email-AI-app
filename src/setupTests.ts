import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure longer timeout for accessibility checks
configure({ asyncUtilTimeout: 5000 });

// Mock matchMedia for theme testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Add any other global mocks or setup here 