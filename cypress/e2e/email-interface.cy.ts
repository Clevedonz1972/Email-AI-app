describe('Email Interface', () => {
  beforeEach(() => {
    cy.visit('/');
    // Intercept API calls and provide mock data
    cy.intercept('GET', '/api/emails', { fixture: 'emails.json' }).as('getEmails');
  });

  it('loads and displays emails', () => {
    cy.wait('@getEmails');
    cy.get('[data-testid="email-card"]').should('have.length.at.least', 1);
  });

  it('allows marking emails as read', () => {
    cy.wait('@getEmails');
    cy.get('[aria-label="mark as read"]').first().click();
    cy.get('[data-testid="email-card"]').first().should('have.class', 'read');
  });

  it('supports keyboard navigation', () => {
    cy.wait('@getEmails');
    // Focus first email with tab
    cy.get('body').tab();
    cy.get('[data-testid="email-card"]').first().should('have.focus');
    
    // Navigate to action buttons
    cy.focused().tab();
    cy.get('[aria-label="mark as read"]').should('have.focus');
  });

  it('maintains settings across page reloads', () => {
    // Open settings
    cy.get('[aria-label="settings"]').click();
    
    // Change theme
    cy.get('[aria-label="Dark Mode"]').click();
    cy.get('button').contains('Apply Changes').click();
    
    // Reload page
    cy.reload();
    
    // Verify settings persisted
    cy.get('body').should('have.class', 'dark-mode');
  });
}); 