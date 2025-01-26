import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { logger } from '../utils/logger';

interface SensoryPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  fontScale: number;
  soundEnabled: boolean;
  colorMode: 'default' | 'deuteranopia' | 'protanopia' | 'tritanopia';
  textSpacing: 'normal' | 'increased' | 'maximum';
  lineHeight: 'normal' | 'increased' | 'maximum';
}

const defaultPreferences: SensoryPreferences = {
  reducedMotion: false,
  highContrast: false,
  fontScale: 1,
  soundEnabled: true,
  colorMode: 'default',
  textSpacing: 'normal',
  lineHeight: 'normal'
};

export const useSensoryPreferences = () => {
  const [preferences, setPreferences] = useLocalStorage<SensoryPreferences>(
    'sensory-preferences',
    defaultPreferences
  );

  useEffect(() => {
    // Apply preferences to document root
    document.documentElement.style.setProperty('--font-scale', `${preferences.fontScale}`);
    document.documentElement.style.setProperty('--line-height', getLineHeightValue(preferences.lineHeight));
    document.documentElement.style.setProperty('--text-spacing', getSpacingValue(preferences.textSpacing));
    
    // Log preference changes for analysis
    logger.log('info', 'Sensory Preferences Updated', { preferences });
  }, [preferences]);

  const updatePreference = <K extends keyof SensoryPreferences>(
    key: K,
    value: SensoryPreferences[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return {
    preferences,
    updatePreference
  };
};

// Helper functions for CSS values
const getLineHeightValue = (setting: SensoryPreferences['lineHeight']) => {
  switch (setting) {
    case 'increased': return '1.8';
    case 'maximum': return '2.2';
    default: return '1.5';
  }
};

const getSpacingValue = (setting: SensoryPreferences['textSpacing']) => {
  switch (setting) {
    case 'increased': return '0.1em';
    case 'maximum': return '0.15em';
    default: return 'normal';
  }
}; 