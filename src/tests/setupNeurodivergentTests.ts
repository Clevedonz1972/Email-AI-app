import { configure } from '@testing-library/react';
import { toHaveNoViolations } from 'jest-axe';
import { getColorContrast, isColorContrastValid } from '../utils/accessibility/colorContrast';
import { expect } from '@jest/globals';

// Extend timeout for users who might need more time
configure({ 
  asyncUtilTimeout: 10000,
  testIdAttribute: 'data-testid'
});

expect.extend(toHaveNoViolations);

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveAdequateColorContrast: (background: string) => R;
      toHaveConsistentFocusIndicator: () => R;
      toHaveAppropriateSpacing: () => R;
    }
  }
}

// Custom matchers for neurodivergent-specific tests
expect.extend({
  toHaveAdequateColorContrast(foreground: string, background: string) {
    const ratio = getColorContrast(foreground, background);
    const pass = ratio >= 4.5;  // WCAG AA standard for normal text

    return {
      pass,
      message: () =>
        `expected color contrast ratio to be at least 4.5, but got ${ratio}`,
    };
  },

  toHaveConsistentFocusIndicator(element: HTMLElement) {
    const focusStyle = window.getComputedStyle(element, ':focus');
    const outlineWidth = parseInt(focusStyle.outlineWidth);
    const outlineColor = focusStyle.outlineColor;
    
    const pass = outlineWidth >= 2 && outlineColor !== 'transparent';
    return {
      pass,
      message: () => 
        pass
          ? 'Expected element not to have visible focus indicator'
          : 'Expected element to have visible focus indicator (outline width >= 2px and visible color)'
    };
  },

  toHaveAppropriateSpacing(element: HTMLElement) {
    const style = window.getComputedStyle(element);
    const lineHeight = parseFloat(style.lineHeight);
    const fontSize = parseFloat(style.fontSize);
    
    const pass = lineHeight / fontSize >= 1.5;
    return {
      pass,
      message: () =>
        pass
          ? 'Expected line height to be less than 1.5x font size'
          : 'Expected line height to be at least 1.5x font size for readability'
    };
  }
}); 