# Neurodivergent Accessibility Features

## Overview
This application is designed with neurodivergent users in mind, offering various customization options to create a comfortable and efficient email management experience.

### Sensory Settings

#### Visual Adjustments
- **Reduced Motion**: Minimizes animations and transitions
- **High Contrast**: Enhances text and UI element visibility
- **Font Scaling**: Adjustable text size from 100% to 200%
- **Color Modes**: Support for various color vision differences
- **Text Spacing**: Adjustable letter and line spacing

#### Focus Assistance
- **Reading Guide**: Optional highlight bar following text
- **Current Line Highlight**: Emphasizes active content
- **Auto Breaks**: Configurable focus time reminders
- **Dim Surroundings**: Reduces visual noise around active content

### Keyboard Navigation
- Full keyboard accessibility
- Custom shortcuts for common actions
- Visual indicators for keyboard focus

### Content Processing
- AI-powered email summarization
- Priority categorization
- Clear action items identification
- Structured information presentation

## Usage Guidelines

### Setting Up Preferences
1. Access Settings via the gear icon
2. Navigate to "Accessibility Preferences"
3. Adjust settings according to personal needs
4. Settings are automatically saved

### Keyboard Shortcuts
- `Ctrl + B`: Toggle reading guide
- `Ctrl + H`: Toggle high contrast
- `Ctrl + +/-`: Adjust font size
- `Ctrl + Space`: Pause animations

### Focus Management
- Set preferred focus duration
- Enable break reminders
- Customize break intervals
- Set break duration

## Technical Implementation

### React Components
- `SensorySettings`: User preference management
- `FocusAssistance`: Reading and focus tools
- `KeyboardNavigation`: Shortcut handling
- `ContentProcessing`: AI-powered assistance

### Hooks
- `useSensoryPreferences`: Manage display preferences
- `useFocusAssistance`: Handle focus features
- `useKeyboardNavigation`: Manage shortcuts
- `usePreferenceLearning`: Adapt to user patterns

### Services
- `PreferenceLearningService`: Analyze user behavior
- `AccessibilityMonitoring`: Track feature usage
- `UserFeedback`: Collect and process user input 