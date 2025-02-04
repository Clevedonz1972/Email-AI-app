describe('Template Management', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/templates');
  });

  it('handles the complete template management flow', () => {
    // Create template
    cy.get('[data-testid="create-template-btn"]').click();
    cy.get('input[name="name"]').type('Meeting Request');
    cy.get('input[name="subject_template"]').type('Meeting: {{topic}}');
    cy.get('textarea[name="content_template"]').type(
      'Hi {{recipient_name}},\n\nCan we schedule a meeting to discuss {{topic}}?\n\nBest regards,\n{{sender_name}}'
    );
    cy.get('[data-testid="save-template-btn"]').click();

    // Verify template was created
    cy.get('[data-testid="template-list"]')
      .should('contain', 'Meeting Request');

    // Edit template
    cy.get('[data-testid="edit-template-btn"]').first().click();
    cy.get('input[name="name"]')
      .clear()
      .type('Updated Meeting Request');
    cy.get('[data-testid="save-template-btn"]').click();

    // Verify changes
    cy.get('[data-testid="template-list"]')
      .should('contain', 'Updated Meeting Request');

    // Use template in composer
    cy.visit('/compose');
    cy.get('[data-testid="use-template-btn"]').click();
    cy.get('[data-testid="template-option"]').first().click();

    // Fill variables
    cy.get('input[name="var-recipient_name"]').type('John');
    cy.get('input[name="var-topic"]').type('Project Update');
    cy.get('input[name="var-sender_name"]').type('Alice');

    // Verify template application
    cy.get('input[name="subject"]')
      .should('have.value', 'Meeting: Project Update');
    cy.get('textarea[name="content"]')
      .should('contain', 'Hi John,')
      .and('contain', 'Project Update')
      .and('contain', 'Best regards,\nAlice');

    // Delete template
    cy.visit('/templates');
    cy.get('[data-testid="delete-template-btn"]').first().click();
    cy.get('[data-testid="confirm-delete-btn"]').click();

    // Verify deletion
    cy.get('[data-testid="template-list"]')
      .should('not.contain', 'Updated Meeting Request');
  });

  it('validates template fields', () => {
    cy.get('[data-testid="create-template-btn"]').click();
    cy.get('[data-testid="save-template-btn"]').click();

    // Check validation messages
    cy.get('[data-testid="name-error"]')
      .should('be.visible')
      .and('contain', 'Name is required');
    
    cy.get('[data-testid="subject-error"]')
      .should('be.visible')
      .and('contain', 'Subject template is required');
  });
}); 