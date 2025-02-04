import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from './test-utils';

expect.extend(toHaveNoViolations);

interface AccessibilityTestOptions {
  timeout?: number;
  rules?: Record<string, { enabled: boolean }>;
}

export const testAccessibility = async (
  ui: React.ReactElement,
  options: AccessibilityTestOptions = {}
) => {
  const { container } = render(ui);
  const results = await axe(container, {
    rules: {
      'color-contrast': { enabled: true },
      'aria-hidden-focus': { enabled: true },
      ...options.rules
    },
    timeout: options.timeout || 5000
  });

  expect(results).toHaveNoViolations();
  return container;
};

export const checkColorContrast = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);
  expect(style.color).toHaveAdequateColorContrast(style.backgroundColor);
};

export const checkFocusability = async (element: HTMLElement) => {
  element.focus();
  expect(document.activeElement).toBe(element);
}; 