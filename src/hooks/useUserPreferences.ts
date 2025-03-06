import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface AccessibilityPreferences {
  reduceMotion: boolean;
  highContrast: boolean;
  enableSound: boolean;
  largeText: boolean;
}

const defaultPreferences: AccessibilityPreferences = {
  reduceMotion: false,
  highContrast: false,
  enableSound: false,
  largeText: false
};

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useLocalStorage(
    'accessibility-preferences',
    defaultPreferences
  );

  // Apply preferences when they change
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', preferences.reduceMotion);
    document.documentElement.classList.toggle('high-contrast', preferences.highContrast);
    document.documentElement.classList.toggle('large-text', preferences.largeText);
  }, [preferences]);

  const updatePreference = <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return { preferences, updatePreference };
}; 