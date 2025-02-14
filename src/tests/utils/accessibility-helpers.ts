import { axe, toHaveNoViolations } from 'jest-axe';
import type { AxeResults } from 'axe-core';
import { render } from '@testing-library/react';

expect.extend(toHaveNoViolations);

interface AccessibilityTestOptions {
  rules?: Record<string, { enabled: boolean }>;
}

export const testAccessibility = async (
  ui: React.ReactElement,
  options: AccessibilityTestOptions = {}
) => {
  const { container } = render(ui);
  const { rules } = options;
  
  const results = await axe(container, {
    rules: {
      'color-contrast': { enabled: true },
      'aria-hidden-focus': { enabled: true },
      ...rules
    }
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

export const checkAccessibility = async (container: Element) => {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
}; 