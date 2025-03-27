import { AccessibilityPreferences } from '../../contexts/AccessibilityContext';

export interface TestUser {
  id: string;
  email: string;
  preferences: AccessibilityPreferences;
  needs: string[];
}

export const testUsers: TestUser[] = [
  {
    id: 'user1',
    email: 'test1@example.com',
    preferences: {
      highContrast: true,
      reducedMotion: true,
      textScale: 100,
      fontSize: 18,
      lineSpacing: 1.8,
      focusMode: true,
      soundEffects: false,
      keyboardNavigation: true,
      colorScheme: 'light',
      colorBlindMode: false,
      simplified_view: {
        focus_mode: true,
        hide_metadata: false
      },
      stressManagement: {
        stressLevelAlerts: true,
        autoBreaks: true,
        breakInterval: 30,
        stressThreshold: 70
      }
    },
    needs: ['ADHD', 'Visual processing'],
  },
  {
    id: 'user2',
    email: 'test2@example.com',
    preferences: {
      highContrast: false,
      reducedMotion: false,
      textScale: 100,
      fontSize: 16,
      lineSpacing: 1.5,
      focusMode: true,
      soundEffects: true,
      keyboardNavigation: true,
      colorScheme: 'dark',
      colorBlindMode: false,
      simplified_view: {
        focus_mode: true,
        hide_metadata: true
      },
      stressManagement: {
        stressLevelAlerts: true,
        autoBreaks: true,
        breakInterval: 45,
        stressThreshold: 60
      }
    },
    needs: ['Dyslexia'],
  },
  {
    id: 'user3',
    email: 'test3@example.com',
    preferences: {
      highContrast: false,
      reducedMotion: true,
      textScale: 120,
      fontSize: 20,
      lineSpacing: 2.0,
      focusMode: false,
      soundEffects: false,
      keyboardNavigation: true,
      colorScheme: 'system',
      colorBlindMode: false,
      customColors: {
        background: '#f5f5f5',
        text: '#333333',
        accent: '#2196f3',
      },
      simplified_view: {
        focus_mode: false,
        hide_metadata: true
      },
      stressManagement: {
        stressLevelAlerts: true,
        autoBreaks: true,
        breakInterval: 20,
        stressThreshold: 50
      }
    },
    needs: ['Light sensitivity', 'Anxiety'],
  },
];

export const testScenarios = [
  {
    id: 'scenario1',
    name: 'Email Composition',
    tasks: [
      'Open email composer',
      'Write a short email using focus mode',
      'Use AI assistance to simplify content',
      'Review stress indicators',
      'Send email',
    ],
    successCriteria: [
      'User can navigate using keyboard',
      'Focus mode helps concentration',
      'AI suggestions are helpful',
      'Stress indicators are clear',
    ],
  },
  {
    id: 'scenario2',
    name: 'Email Processing',
    tasks: [
      'Open inbox',
      'Use focus mode to read emails',
      'Process email actions',
      'Manage email categorization',
    ],
    successCriteria: [
      'Content is readable',
      'Navigation is intuitive',
      'Actions are clear',
      'Categories are helpful',
    ],
  },
  {
    id: 'scenario3',
    name: 'Settings Management',
    tasks: [
      'Find accessibility settings',
      'Adjust visual preferences',
      'Test different color schemes',
      'Save preferences',
    ],
    successCriteria: [
      'Settings are easy to find',
      'Changes are immediately visible',
      'Preferences are saved',
      'Interface remains usable',
    ],
  },
];

export const testMetrics = {
  taskCompletion: {
    type: 'percentage',
    target: 90,
    description: 'Percentage of tasks completed successfully',
  },
  timeOnTask: {
    type: 'duration',
    target: 300, // seconds
    description: 'Time taken to complete each task',
  },
  errorRate: {
    type: 'count',
    target: 2,
    description: 'Number of errors per task',
  },
  satisfactionScore: {
    type: 'scale',
    range: [1, 5],
    target: 4,
    description: 'User satisfaction rating',
  },
};

export const testEnvironment = {
  setupInstructions: [
    'Ensure quiet testing environment',
    'Check all accessibility features are available',
    'Prepare screen recording software',
    'Have feedback forms ready',
  ],
  requiredTools: [
    'Screen reader',
    'Keyboard for navigation testing',
    'Different screen sizes',
    'Recording software',
  ],
  dataCollection: [
    'User interactions',
    'Task completion times',
    'Error counts',
    'User feedback',
    'Accessibility issues',
  ],
}; 