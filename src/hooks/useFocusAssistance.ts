import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { logger } from '../utils/logger';

interface FocusSettings {
  readingGuide: boolean;
  highlightCurrentLine: boolean;
  dimSurroundingText: boolean;
  readingSpeed: 'slow' | 'medium' | 'fast';
  autoBreaks: boolean;
  focusTimeLimit: number; // minutes
}

export const useFocusAssistance = () => {
  const [settings, setSettings] = useLocalStorage<FocusSettings>('focus-settings', {
    readingGuide: false,
    highlightCurrentLine: true,
    dimSurroundingText: false,
    readingSpeed: 'medium',
    autoBreaks: true,
    focusTimeLimit: 25
  });

  const [activeTimer, setActiveTimer] = useState<NodeJS.Timeout | null>(null);
  const [needsBreak, setNeedsBreak] = useState(false);

  useEffect(() => {
    if (settings.autoBreaks && !activeTimer) {
      const timer = setTimeout(() => {
        setNeedsBreak(true);
        logger.log('info', 'Focus Break Triggered', { duration: settings.focusTimeLimit });
      }, settings.focusTimeLimit * 60 * 1000);

      setActiveTimer(timer);
    }

    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer);
      }
    };
  }, [settings.autoBreaks, settings.focusTimeLimit]);

  return {
    settings,
    setSettings,
    needsBreak,
    resetBreak: () => setNeedsBreak(false)
  };
}; 