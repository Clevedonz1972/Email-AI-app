/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    login(): void;
    createTemplate(template: any): void;
    checkA11y(): Chainable<void>;
    injectAxe(): void;
    /**
     * Custom command to select DOM element by data-testid attribute.
     * @example cy.findByTestId('greeting')
     */
    findByTestId(testId: string): Chainable<JQuery<HTMLElement>>
    
    /**
     * Custom command to select by role
     * @example cy.findByRole('button', { name: /submit/i })
     */
    findByRole(role: string, options?: { name?: RegExp | string }): Chainable<JQuery<HTMLElement>>
  }
} 