describe('Email Templates', () => {
  beforeEach(() => {
    // Login before each test
    cy.login();
    cy.visit('/templates');
  });

  it('should display empty state when no templates exist', () => {
    cy.get('[data-testid="empty-templates"]')
      .should('be.visible')
      .and('contain', 'No email templates yet');
  });

  it('should create a new template', () => {
    cy.get('[data-testid="create-template-btn"]').click();
    
    // Fill in template details
    cy.get('input[name="name"]').type('Meeting Request');
    cy.get('input[name="subject_template"]').type('Meeting: {{topic}}');
    cy.get('textarea[name="content_template"]').type(
      'Hi {{recipient_name}},\n\nCan we schedule a meeting to discuss {{topic}}?\n\nBest regards,\n{{sender_name}}'
    );
    
    // Save template
    cy.get('[data-testid="save-template-btn"]').click();
    
    // Verify template was created
    cy.get('[data-testid="template-list"]')
      .should('contain', 'Meeting Request');
  });

  it('should edit an existing template', () => {
    // Create a template first
    cy.createTemplate({
      name: 'Original Template',
      subject_template: 'Original Subject',
      content_template: 'Original Content'
    });
    
    // Edit the template
    cy.get('[data-testid="edit-template-btn"]').first().click();
    cy.get('input[name="name"]')
      .clear()
      .type('Updated Template');
    cy.get('[data-testid="save-template-btn"]').click();
    
    // Verify changes
    cy.get('[data-testid="template-list"]')
      .should('contain', 'Updated Template')
      .should('not.contain', 'Original Template');
  });

  it('should delete a template', () => {
    // Create a template first
    cy.createTemplate({
      name: 'Template to Delete',
      subject_template: 'Subject',
      content_template: 'Content'
    });
    
    // Delete the template
    cy.get('[data-testid="delete-template-btn"]').first().click();
    cy.get('[data-testid="confirm-delete-btn"]').click();
    
    // Verify template was deleted
    cy.get('[data-testid="template-list"]')
      .should('not.contain', 'Template to Delete');
  });

  it('should use template variables correctly', () => {
    // Create a template with variables
    cy.createTemplate({
      name: 'Variable Template',
      subject_template: 'Hello {{name}}',
      content_template: 'Dear {{name}},\n\nRegards,\n{{sender}}',
      variables: [
        { name: 'name', description: 'Recipient name', required: true },
        { name: 'sender', description: 'Sender name', required: true }
      ]
    });
    
    // Navigate to compose email
    cy.visit('/compose');
    cy.get('[data-testid="use-template-btn"]').click();
    cy.get('[data-testid="template-select"]').click();
    cy.get('[data-testid="template-option-Variable Template"]').click();
    
    // Fill in variables
    cy.get('input[name="var-name"]').type('John');
    cy.get('input[name="var-sender"]').type('Alice');
    
    // Verify template was applied with variables
    cy.get('input[name="subject"]')
      .should('have.value', 'Hello John');
    cy.get('textarea[name="content"]')
      .should('contain', 'Dear John,\n\nRegards,\nAlice');
  });
}); 