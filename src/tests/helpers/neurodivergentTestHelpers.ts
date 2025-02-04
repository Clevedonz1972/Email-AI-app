import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export const neurodivergentTestHelpers = {
  async checkKeyboardNavigation(container: HTMLElement) {
    const focusableElements = within(container).queryAllByRole('button, link, textbox, checkbox, radio');
    
    // Test tab navigation
    for (const element of focusableElements) {
      await userEvent.tab();
      expect(document.activeElement).toBe(element);
    }
  },

  async checkErrorRecovery(errorTrigger: () => void, recoverySteps: string[]) {
    // Trigger error
    errorTrigger();
    
    // Check error message clarity
    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toBeVisible();
    expect(errorMessage).toHaveAppropriateSpacing();
    
    // Check recovery steps
    const steps = within(errorMessage).queryAllByRole('listitem');
    expect(steps).toHaveLength(recoverySteps.length);
    
    // Verify each step is clear and actionable
    steps.forEach((step, index) => {
      expect(step).toHaveTextContent(recoverySteps[index]);
      expect(step).toHaveAppropriateSpacing();
    });
  },

  async checkContentClarity(container: HTMLElement) {
    const textElements = container.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, label');
    
    textElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      
      // Check text spacing
      expect(element).toHaveAppropriateSpacing();
      
      // Check color contrast
      expect(styles.color).toHaveAdequateColorContrast(styles.backgroundColor);
      
      // Check font size
      const fontSize = parseFloat(styles.fontSize);
      expect(fontSize).toBeGreaterThanOrEqual(16);
    });
  }
}; 