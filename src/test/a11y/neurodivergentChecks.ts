import { axe, toHaveNoViolations } from 'jest-axe';
import { render, RenderResult } from '@testing-library/react';

interface NeurodivergentTestOptions {
  checkColorContrast?: boolean;
  checkFocusOrder?: boolean;
  checkAnimations?: boolean;
  checkTextSpacing?: boolean;
}

export const runNeurodivergentChecks = async (
  ui: React.ReactElement,
  options: NeurodivergentTestOptions = {}
): Promise<RenderResult> => {
  const renderResult = render(ui);
  const { container } = renderResult;

  // Run axe with enhanced rules for neurodivergent users
  const results = await axe(container, {
    rules: {
      'color-contrast': { enabled: true },
      'motion-animation': { enabled: true },
      'text-spacing': { enabled: true },
      'focus-order-semantics': { enabled: true }
    }
  });

  expect(results).toHaveNoViolations();

  // Additional neurodivergent-specific checks
  if (options.checkColorContrast) {
    const elements = container.querySelectorAll('*');
    elements.forEach(element => {
      const style = window.getComputedStyle(element);
      if (style.color && style.backgroundColor) {
        expect(style.color).toHaveAdequateColorContrast(style.backgroundColor);
      }
    });
  }

  if (options.checkFocusOrder) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    expect(focusableElements.length).toBeGreaterThan(0);
  }

  return renderResult;
}; 