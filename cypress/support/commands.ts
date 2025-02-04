declare namespace Cypress {
  interface Chainable {
    login(): void;
    createTemplate(template: any): void;
    checkA11y(): Chainable<void>;
  }
}

// Login command
Cypress.Commands.add('login', () => {
  cy.request('POST', '/api/auth/login', {
    email: Cypress.env('TEST_USER_EMAIL'),
    password: Cypress.env('TEST_USER_PASSWORD')
  }).then((response) => {
    window.localStorage.setItem('email_ai_access_token', response.body.access_token);
  });
});

// Create template command
Cypress.Commands.add('createTemplate', (template) => {
  cy.request({
    method: 'POST',
    url: '/api/templates',
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem('email_ai_access_token')}`
    },
    body: template
  });
});

Cypress.Commands.add('checkA11y', () => {
  cy.injectAxe();
  cy.checkA11y(null, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
    }
  });
}); 