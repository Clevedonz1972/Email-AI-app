import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';
import { ReactElement } from 'react';

expect.extend(toHaveNoViolations);

export const testAccessibility = async (ui: ReactElement) => {
  const { container } = render(ui);
  const results = await axe(container, {
    rules: {
      // Custom rules for neurodivergent users
      'color-contrast': { enabled: true },
      'aria-hidden-focus': { enabled: true },
      'scrollable-region-focusable': { enabled: true },
      'focus-order-semantics': { enabled: true }
    }
  });
  
  expect(results).toHaveNoViolations();
};

export const getViolationSummary = (violations: any[]) => {
  return violations.map(violation => ({
    id: violation.id,
    impact: violation.impact,
    description: violation.description,
    nodes: violation.nodes.length,
    help: violation.help,
    helpUrl: violation.helpUrl
  }));
}; 