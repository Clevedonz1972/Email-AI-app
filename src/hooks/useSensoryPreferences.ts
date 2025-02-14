import { useState, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { logger } from '@/utils/logger';
import type { SensoryPreferences } from '@/types/preferences';

const defaultPreferences: SensoryPreferences = {
  fontScale: 1,
  contrast: 'normal',
  motion: 'normal',
  textSpacing: 'normal',
  colorMode: 'default',
  lineHeight: 1.5,
  fontFamily: 'system-ui',
  readingSpeed: 'normal'
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