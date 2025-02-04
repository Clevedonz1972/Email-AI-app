export const accessibilityDefaults = {
  // Visual preferences
  theme: {
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    lineSpacing: 1.5,
    letterSpacing: 0.5
  },

  // Interaction preferences
  interaction: {
    focusIndicatorSize: 3,
    focusIndicatorColor: '#2563EB',
    clickableAreaPadding: 8,
    hoverDelay: 0,
    doubleClickDelay: 500
  },

  // Content preferences
  content: {
    simplifiedLanguage: false,
    structuredLayout: true,
    inlineHelp: true,
    errorGuidance: true
  },

  // Time preferences
  timing: {
    extendedTimeouts: true,
    autosaveInterval: 30000,
    messageDisplayDuration: 5000
  }
};

export const accessibilityFeatures = {
  // Visual adaptations
  visual: {
    enableHighContrast: () => {
      document.documentElement.setAttribute('data-high-contrast', 'true');
    },
    enableReducedMotion: () => {
      document.documentElement.setAttribute('data-reduced-motion', 'true');
    },
    enableLargeText: () => {
      document.documentElement.setAttribute('data-large-text', 'true');
    }
  },

  // Focus management
  focus: {
    trapFocus: (element: HTMLElement) => {
      // Implementation for focus trapping
    },
    setInitialFocus: (element: HTMLElement) => {
      element.focus({ preventScroll: true });
    }
  },

  // Error handling
  errors: {
    formatErrorMessage: (error: string): string => {
      return `What happened: ${error}\nWhat you can do: `;
    },
    provideRecoverySteps: (errorType: string): string[] => {
      // Return step-by-step recovery instructions
      return [];
    }
  }
}; 