describe('Email Workflow', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/auth/login').as('login');
    cy.intercept('GET', '/api/emails').as('getEmails');
    cy.intercept('POST', '/api/ai/summarize').as('summarize');
  });

  it('should login and process emails', () => {
    // Login
    cy.visit('/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.wait('@login');

    // Check dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome').should('be.visible');

    // Check email processing
    cy.wait('@getEmails');
    cy.get('[data-testid="email-card"]').first().should('be.visible');
    cy.wait('@summarize');
    cy.contains('Summary:').should('be.visible');
  });

  it('should handle email replies', () => {
    cy.login(); // Custom command
    cy.visit('/dashboard');
    
    cy.get('[data-testid="email-card"]').first().click();
    cy.get('[data-testid="reply-button"]').click();
    cy.get('[data-testid="generate-reply"]').click();
    
    cy.contains('Generated reply').should('be.visible');
    cy.get('[data-testid="send-reply"]').click();
    
    cy.contains('Email sent successfully').should('be.visible');
  });
}); 