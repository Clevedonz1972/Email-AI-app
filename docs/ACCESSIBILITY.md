# Accessibility Features Guide

## Overview
Our email application is designed to be accessible and neurodivergent-friendly, providing various features to enhance the user experience for all users, regardless of their needs or preferences.

## Key Features

### 1. Focus Mode
Focus mode helps users concentrate on one task at a time by:
- Highlighting the current content being read
- Dimming surrounding content
- Providing keyboard controls for navigation
- Allowing customizable reading speed

To enable Focus Mode:
1. Go to Settings > Accessibility
2. Toggle "Focus Mode" on
3. Use the floating controls to start/pause/skip content

### 2. Visual Adjustments
Customize the visual appearance to reduce eye strain and improve readability:
- High contrast mode
- Custom color schemes
- Adjustable font size (14px - 24px)
- Line spacing options (1.2 - 2.0)
- Reduced motion effects

### 3. Keyboard Navigation
Full keyboard support for efficient navigation:
- Arrow keys for moving between elements
- Enter to select/activate
- Escape to exit/cancel
- Tab for sequential navigation
- Custom shortcuts for common actions

### 4. Content Processing
Features to help process email content:
- AI-powered email summarization
- Priority categorization
- Clear action items highlighting
- Simplified language options

## User Preferences

### Saving Preferences
Your accessibility preferences are automatically saved and will persist across sessions. To reset to default settings:
1. Go to Settings > Accessibility
2. Click "Reset to Defaults"

### Available Settings
- **Text Size**: Adjust the base font size
- **Line Spacing**: Control the space between lines
- **Color Scheme**: Choose between light, dark, or custom themes
- **Motion**: Enable/disable animations and transitions
- **Sound Effects**: Toggle audio feedback
- **Focus Mode**: Enable/disable reading assistance

## Technical Implementation

### For Developers
The accessibility features are implemented using:
- React Context for state management
- ARIA attributes for screen reader support
- Material-UI components with accessibility built-in
- Custom hooks for keyboard navigation
- Jest and Testing Library for accessibility testing

To add new accessible components:
1. Import the AccessibilityContext
2. Use the useAccessibility hook
3. Implement keyboard navigation
4. Add ARIA labels and roles
5. Write accessibility tests

Example:
```typescript
import { useAccessibility } from '../contexts/AccessibilityContext';

const MyComponent = () => {
  const { preferences } = useAccessibility();
  
  return (
    <div aria-label="Description" role="region">
      {/* Component content */}
    </div>
  );
};
```

### Testing
Run accessibility tests:
```bash
npm run test:a11y
```

## Best Practices

### Writing Accessible Content
- Use clear, concise language
- Provide alternative text for images
- Use semantic HTML elements
- Maintain proper heading hierarchy
- Ensure sufficient color contrast

### Keyboard Navigation
- All interactive elements must be focusable
- Visible focus indicators
- Logical tab order
- Keyboard shortcuts for common actions

## Support

### Getting Help
If you encounter any accessibility issues:
1. Check the settings panel for adjustments
2. Refer to this documentation
3. Contact support at support@email-ai-app.com

### Feedback
We welcome feedback on our accessibility features. Please submit suggestions or report issues through:
- GitHub Issues
- In-app feedback form
- Email to accessibility@email-ai-app.com

## Future Improvements
We are continuously working to improve accessibility:
- [ ] Voice control support
- [ ] Custom keyboard shortcuts
- [ ] Enhanced screen reader support
- [ ] More language processing options
- [ ] Additional color scheme templates

## Compliance
Our application aims to meet:
- WCAG 2.1 Level AA standards
- Section 508 requirements
- European EN 301 549 standards 