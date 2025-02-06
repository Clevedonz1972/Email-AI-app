import { useState, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { logger } from '@/utils/logger';

export interface SensoryPreferences {
  fontSize: number;
  lineHeight: number;
  contrast: 'normal' | 'high';
  motionReduced: boolean;
  soundEnabled: boolean;
  textToSpeech: boolean;
  readingSpeed: 'slow' | 'normal' | 'fast';
  colorMode: 'light' | 'dark' | 'system';
  fontFamily: string;
}

const defaultPreferences: SensoryPreferences = {
  fontSize: 16,
  lineHeight: 1.5,
  contrast: 'normal',
  motionReduced: false,
  soundEnabled: true,
  textToSpeech: false,
  readingSpeed: 'normal',
  colorMode: 'system',
  fontFamily: 'system-ui'
};

export const useSensoryPreferences = () => {
  const [preferences, setPreferences] = useLocalStorage<SensoryPreferences>(
    'sensory-preferences',
    defaultPreferences
  );

  const updatePreference = useCallback(<K extends keyof SensoryPreferences>(
    key: K,
    value: SensoryPreferences[K]
  ) => {
    setPreferences(prev => {
      const newPreferences = { ...prev, [key]: value };
      logger.info('Sensory preferences updated:', { [key]: value });
      return newPreferences;
    });
  }, [setPreferences]);

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
    logger.info('Sensory preferences reset to defaults');
  }, [setPreferences]);

  return {
    preferences,
    updatePreference,
    resetPreferences
  };
}; 