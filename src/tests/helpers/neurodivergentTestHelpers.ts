import { act } from '@testing-library/react';

export const neurodivergentTestHelpers = {
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
      expect(style.color).toHaveAdequateColorContrast(style.backgroundColor);
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