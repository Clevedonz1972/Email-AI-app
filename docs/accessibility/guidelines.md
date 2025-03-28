# ASTI App Accessibility Guidelines for Developers

## 1. Introduction

This document provides guidelines for maintaining and enhancing accessibility features in the ASTI application. Our app is designed to support neurodivergent users (particularly those with ADHD, autism, and anxiety), and accessibility is a core part of our mission, not an afterthought.

## 2. ARIA Implementation

### 2.1. Roles
- Use semantic HTML elements when possible (e.g., `<button>`, `<nav>`, `<main>`, `<article>`)
- Add appropriate ARIA roles when HTML semantics aren't sufficient:
  - `role="status"` for stress level indicators and status updates
  - `role="alert"` for important notifications requiring immediate attention
  - `role="complementary"` for supporting content
  - `role="feed"` for dynamic content updates like email lists
  - `role="article"` for individual email items

Example:
```tsx
<Box component="section" role="region" aria-label="Email Analysis">
  {isLoading ? (
    <CircularProgress aria-label="Analysis in progress" />
  ) : (
    <StressIndicator level={stressLevel} />
  )}
</Box>
```

### 2.2. Labels and Descriptions

- Every interactive element must have an accessible name:
  - Use `aria-label` for elements without visible text
  - Use `aria-labelledby` to reference existing text elements
  - Use `aria-describedby` to provide additional context

Example:
```tsx
<Button 
  onClick={handleSend}
  aria-label="Send email"
  aria-describedby="email-status"
>
  <SendIcon />
</Button>
<span id="email-status" hidden>
  Sends email immediately to all recipients
</span>
```

## 3. Keyboard Navigation

### 3.1. Focus Management
- Ensure all interactive elements can be accessed using the keyboard
- Maintain a logical tab order that follows the visual layout
- Implement custom keyboard shortcuts for power users using `useKeyboardNavigation` hook
- Use `FocusAssistant` component for enhanced focus mode

### 3.2. Focus Indicators
- Never remove focus outlines without providing an alternative
- Ensure focus indicators have sufficient contrast (3:1 minimum)
- Use the theme's `focusRingWidth` value for consistency

Example:
```tsx
const StyledButton = styled(Button)(({ theme }) => ({
  '&:focus': {
    outline: `${theme.accessibility.focusRingWidth} solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
  }
}));
```

## 4. Neurodivergent-Specific Features

### 4.1. Stress Management
- Use stress indicators consistently across the application
- Provide clear visual and textual cues for stress levels
- Allow users to customize stress thresholds in settings

### 4.2. Cognitive Load Reduction
- Implement simplified views for complex content
- Provide task breakdown assistance for multi-step processes
- Allow users to toggle features on/off based on their needs

### 4.3. Focus Support
- Implement distraction-free reading modes
- Provide focus timers with customizable durations
- Use subtle animations to guide attention (respecting reduced motion preferences)

## 5. Visual Design

### 5.1. Color and Contrast
- Ensure text has a minimum contrast ratio of 4.5:1 (WCAG AA)
- Don't rely on color alone to convey information
- Support color blind mode and high contrast mode

### 5.2. Typography
- Use a minimum text size of 16px for body text
- Allow users to resize text up to 200% without breaking layouts
- Maintain adequate line spacing (1.5 minimum)

### 5.3. Motion and Animation
- Respect user preferences for reduced motion
- Avoid rapid flashing or strobing effects
- Keep animations subtle and purposeful

Example:
```tsx
const AnimatedComponent = styled(Box)(({ theme }) => ({
  transition: theme.preferences.reducedMotion ? 'none' : 'transform 0.3s ease',
}));
```

## 6. Accessibility Testing

### 6.1. Automated Testing
- Run jest-axe tests for all new components
- Use our custom neurodivergent test helpers for specific checks
- Address all violations before merging code

Example:
```tsx
it('should pass accessibility tests', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 6.2. Manual Testing
- Test with keyboard only (no mouse)
- Test with screen readers (VoiceOver, NVDA)
- Verify high contrast and reduced motion modes
- Check for cognitive load issues with complex interfaces

## 7. Using the AccessibilityContext

The `AccessibilityContext` provides access to user preferences:

```tsx
import { useAccessibility } from '../../contexts/AccessibilityContext';

const MyComponent = () => {
  const { preferences, updatePreferences } = useAccessibility();
  
  // Access preferences
  const { reducedMotion, highContrast, fontSize } = preferences;
  
  // Update preferences
  const handleToggleHighContrast = () => {
    updatePreferences({ highContrast: !highContrast });
  };
  
  return (
    // Component implementation using preferences
  );
};
```

## 8. Real-time Accessibility Settings

When implementing settings that affect accessibility:

1. Apply changes immediately (no page refresh required)
2. Provide visual feedback that the change was applied
3. Store preferences in localStorage for persistence
4. Consider providing preview functionality for visual changes

## 9. Documentation

- Document all accessibility features in component JSDoc comments
- Explain the purpose of ARIA attributes and roles
- Include accessibility information in user-facing documentation

Example:
```tsx
/**
 * StressIndicator - Displays the current stress level
 * 
 * Accessibility features:
 * - Uses role="status" to announce changes to screen readers
 * - Color-coded with text labels (not relying on color alone)
 * - High contrast mode supported
 */
export const StressIndicator = ({ level }: StressIndicatorProps) => {
  // Implementation
};
```

## 10. Further Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [MDN ARIA Documentation](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [Neurodiversity Design Principles](https://www.neurodiversitydesign.org/)
- [Axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md) 