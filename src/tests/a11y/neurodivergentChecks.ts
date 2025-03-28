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
        expect(style).toHaveAdequateColorContrast();
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

export {};

/* Original implementation commented out
export const checkColorContrast = (element: HTMLElement) => {
  // Implementation of color contrast check
  const style = window.getComputedStyle(element);
  
  // Function to calculate contrast ratio between two colors
  const calculateContrastRatio = (color1: string, color2: string) => {
    // This would normally calculate the actual contrast ratio
    return 4.5; // Placeholder value
  };
  
  if (style.color && style.backgroundColor) {
    const contrastRatio = calculateContrastRatio(style.color, style.backgroundColor);
    return contrastRatio >= 4.5; // WCAG AA standard for normal text
  }
  
  return true; // Skip check if colors aren't available
};

// Main function to check elements for neurodivergent-friendly design
export const runNeurodivergentChecks = async (container: HTMLElement) => {
  // Check all elements for proper color contrast
  const allElements = container.querySelectorAll('*');
  
  allElements.forEach(element => {
    if (element instanceof HTMLElement) {
      const style = window.getComputedStyle(element);
      if (style.color && style.backgroundColor) {
        expect(style).toHaveAdequateColorContrast();
      }
    }
  });
};
*/ 