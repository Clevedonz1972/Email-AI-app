import { axe, toHaveNoViolations } from 'jest-axe';
import { render, RenderResult } from '@testing-library/react';
import { act } from '@testing-library/react';
import { getColorContrast } from '../../utils/accessibility/colorContrast';

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

export const neurodivergentHelpers = {
  async checkKeyboardNavigation(container: HTMLElement): Promise<void> {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    for (const element of Array.from(focusableElements)) {
      await act(async () => {
        (element as HTMLElement).focus();
        expect(document.activeElement).toBe(element);
      });
    }
  },

  async checkErrorRecovery(
    triggerError: () => void,
    expectedSteps: string[]
  ): Promise<void> {
    await act(async () => {
      triggerError();
    });

    expectedSteps.forEach(step => {
      const stepElement = document.querySelector(`[aria-label*="${step}"]`);
      expect(stepElement).toBeInTheDocument();
    });
  },

  async checkContentClarity(container: HTMLElement): Promise<void> {
    // Check text contrast
    const textElements = container.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, label');
    textElements.forEach(element => {
      const style = window.getComputedStyle(element);
      if (style.color && style.backgroundColor) {
        const ratio = getColorContrast(style.color, style.backgroundColor);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }
    });

    // Check font size
    const minFontSize = 14; // Minimum readable font size
    textElements.forEach(element => {
      const fontSize = parseInt(window.getComputedStyle(element).fontSize);
      expect(fontSize).toBeGreaterThanOrEqual(minFontSize);
    });

    // Check line height
    const minLineHeight = 1.5;
    textElements.forEach(element => {
      const lineHeight = parseFloat(window.getComputedStyle(element).lineHeight);
      const fontSize = parseFloat(window.getComputedStyle(element).fontSize);
      expect(lineHeight / fontSize).toBeGreaterThanOrEqual(minLineHeight);
    });
  }
}; 