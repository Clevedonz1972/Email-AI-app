import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AccessibilityPreferences {
  highContrast: boolean;
  reducedMotion: boolean;
  textScale: number;
  fontSize: number;
  lineSpacing: number;
  focusMode: boolean;
  soundEffects: boolean;
  keyboardNavigation: boolean;
  colorScheme: 'light' | 'dark' | 'system';
  colorBlindMode: boolean;
  customColors?: {
    background: string;
    text: string;
    accent: string;
  };
  simplified_view: {
    focus_mode: boolean;
    hide_metadata: boolean;
  };
  stressManagement: {
    stressLevelAlerts: boolean;
    autoBreaks: boolean;
    breakInterval: number;
    stressThreshold: number;
  };
}

const defaultPreferences: AccessibilityPreferences = {
  highContrast: false,
  reducedMotion: false,
  textScale: 100,
  fontSize: 16,
  lineSpacing: 1.5,
  focusMode: false,
  soundEffects: true,
  keyboardNavigation: true,
  colorScheme: 'system',
  colorBlindMode: false,
  simplified_view: {
    focus_mode: false,
    hide_metadata: false
  },
  stressManagement: {
    stressLevelAlerts: true,
    autoBreaks: true,
    breakInterval: 30,
    stressThreshold: 70
  }
};

export interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  updatePreferences: (newPreferences: Partial<AccessibilityPreferences>) => void;
  highContrast: boolean;
  textScale: number;
  reducedMotion: boolean;
  soundEnabled: boolean;
  setHighContrast: (value: boolean) => void;
  setTextScale: (value: number) => void;
  setReducedMotion: (value: boolean) => void;
  setSoundEnabled: (value: boolean) => void;
}

export const AccessibilityContext = createContext<AccessibilityContextType>({
  preferences: defaultPreferences,
  updatePreferences: () => {},
  highContrast: false,
  textScale: 100,
  reducedMotion: false,
  soundEnabled: true,
  setHighContrast: () => {},
  setTextScale: () => {},
  setReducedMotion: () => {},
  setSoundEnabled: () => {}
});

export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(defaultPreferences);
  const [highContrast, setHighContrast] = useState(false);
  const [textScale, setTextScale] = useState(100);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const savedPreferences = localStorage.getItem('accessibilityPreferences');
    if (savedPreferences) {
      const parsed = JSON.parse(savedPreferences);
      setPreferences(parsed);
      setHighContrast(parsed.highContrast ?? false);
      setTextScale(parsed.textScale ?? 100);
      setReducedMotion(parsed.reducedMotion ?? false);
      setSoundEnabled(parsed.soundEnabled ?? true);
    }
  }, []);

  const updatePreferences = (newPreferences: Partial<AccessibilityPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPreferences };
      localStorage.setItem('accessibilityPreferences', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AccessibilityContext.Provider value={{
      preferences,
      updatePreferences,
      highContrast,
      textScale,
      reducedMotion,
      soundEnabled,
      setHighContrast,
      setTextScale,
      setReducedMotion,
      setSoundEnabled
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}; 