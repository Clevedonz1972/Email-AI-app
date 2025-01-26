import React, { createContext, useContext, useState, useEffect } from 'react';

export type SortCriteria = 'priority' | 'sender' | 'date';
export type PriorityFilter = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface Settings {
  darkMode: boolean;
  sortBy: SortCriteria;
  priorityFilters: PriorityFilter[];
  fontSize: number;
  reduceAnimations: boolean;
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