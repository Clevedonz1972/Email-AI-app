import React, { createContext, useContext, useState } from 'react';
import { AccessibilityPreferences } from '../types/preferences';

interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  updatePreferences: (newPrefs: Partial<AccessibilityPreferences>) => void;
}

const defaultPreferences: AccessibilityPreferences = {
  colorScheme: 'light',
  customColors: {
    background: '#ffffff',
    text: '#000000',
    accent: '#007bff',
  },
  fontSize: 16,
  lineSpacing: 1.5,
  reducedMotion: false,
  focusMode: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(defaultPreferences);

  const updatePreferences = (newPrefs: Partial<AccessibilityPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
  };

  return (
    <AccessibilityContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}; 