# Email Templates

## Overview
The email templates system allows users to create, manage, and use predefined email templates with variable substitution.

## Features
- Create and manage email templates
- Variable substitution
- Category organization
- Template versioning
- Access control

## Components
1. Template Management
   - CRUD operations for templates
   - Variable definition
   - Category assignment

2. Template Selection
   - Template browsing
   - Variable input
   - Preview functionality

3. Template Application
   - Variable substitution
   - Format preservation
   - Undo/Redo support

## Usage
```typescript
// Using a template in the email composer
const handleTemplateSelect = (subject: string, content: string) => {
  setEmailSubject(subject);
  setEmailContent(content);
};

<TemplateSelector
  open={selectorOpen}
  onClose={() => setSelectorOpen(false)}
  onSelect={handleTemplateSelect}
/>
```

## Best Practices
1. Keep templates focused and single-purpose
2. Use clear variable names
3. Provide helpful variable descriptions
4. Test templates with different variable values
5. Maintain consistent formatting 