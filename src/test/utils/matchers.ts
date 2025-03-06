import { expect } from '@jest/globals';
import { getColorContrast } from '../../utils/accessibility/colorContrast';

expect.extend({
  toHaveError(received: HTMLElement, errorMessage: string) {
    const error = received.querySelector('[role="alert"]');
    const pass = Boolean(error?.textContent?.includes(errorMessage));

    return {
      pass,
      message: () =>
        `expected element to ${pass ? 'not ' : ''}have error message "${errorMessage}"`,
    };
  },

  toBeDisabled(received: HTMLElement) {
    const pass = Boolean(received.hasAttribute('disabled'));
    return {
      pass,
      message: () =>
        `expected element to ${pass ? 'not ' : ''}be disabled`,
    };
  },

  toHaveAdequateColorContrast(received: string, background: string) {
    const ratio = getColorContrast(received, background);
    const pass = ratio >= 4.5; // WCAG AA standard for normal text
    return {
      pass,
      message: () =>
        `expected color contrast ratio to be at least 4.5, but got ${ratio}`,
    };
  }
}); 