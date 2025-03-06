describe('Authentication', () => {
  it('completes the forgot password flow', () => {
    // Start at login page
    cy.visit('/login');
    
    // Click forgot password
    cy.findByText(/forgot password/i).click();
    
    // Enter email
    cy.findByLabelText(/email/i).type('test@example.com');
    
    // Submit form
    cy.findByRole('button', { name: /send reset link/i }).click();
    
    // Verify success message
    cy.findByText(/reset link sent/i).should('exist');
    
    // Simulate clicking email link
    cy.visit('/reset-password/test-token');
    
    // Enter new password
    cy.findByLabelText(/new password/i).type('NewPassword123!');
    cy.findByLabelText(/confirm password/i).type('NewPassword123!');
    
    // Submit form
    cy.findByRole('button', { name: /reset password/i }).click();
    
    // Should redirect to login
    cy.url().should('include', '/login');
  });
}); 