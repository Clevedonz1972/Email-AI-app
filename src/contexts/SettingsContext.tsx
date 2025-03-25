import React, { createContext, useContext, useState, useEffect } from 'react';

export type SortCriteria = 'priority' | 'sender' | 'date';
export type PriorityFilter = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type StressSensitivity = 'HIGH' | 'MEDIUM' | 'LOW';
export type BreakReminderFrequency = 'DISABLED' | 'AS_NEEDED' | 'HOURLY' | 'FREQUENT';

interface Settings {
  darkMode: boolean;
  sortBy: SortCriteria;
  priorityFilters: PriorityFilter[];
  fontSize: number;
  reduceAnimations: boolean;
  // Stress management settings for neurodiverse users
  stressSensitivity: StressSensitivity;
  cognitiveLoadReduction: boolean;
  breakReminderFrequency: BreakReminderFrequency;
  taskBreakdownAssistance: boolean;
  anxietyTriggers: string[];
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  darkMode: false,
  sortBy: 'date',
  priorityFilters: ['HIGH', 'MEDIUM', 'LOW'],
  fontSize: 16,
  reduceAnimations: false,
  // Default stress management settings
  stressSensitivity: 'MEDIUM',
  cognitiveLoadReduction: true,
  breakReminderFrequency: 'AS_NEEDED',
  taskBreakdownAssistance: true,
  anxietyTriggers: ['urgent', 'ASAP', 'immediately', 'deadline', 'overdue', 'critical'],
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const savedSettings = localStorage.getItem('emailAppSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('emailAppSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 