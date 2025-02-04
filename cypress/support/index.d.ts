/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    login(): void;
    createTemplate(template: any): void;
    checkA11y(): Chainable<void>;
    injectAxe(): void;
  }
} 