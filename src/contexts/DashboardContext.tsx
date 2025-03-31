import React, { createContext, useContext, useState, ReactNode } from 'react';
import { EmailMessage } from '@/types/email';

// Define interface for context value
interface DashboardContextValue {
  openSpeakToMe: (email?: EmailMessage) => void;
  closeSpeakToMe: () => void;
  isSpeakToMeOpen: boolean;
  contextEmail: EmailMessage | null;
}

// Create context with default values
const DashboardContext = createContext<DashboardContextValue>({
  openSpeakToMe: () => {},
  closeSpeakToMe: () => {},
  isSpeakToMeOpen: false,
  contextEmail: null,
});

// Define props for provider component
interface DashboardProviderProps {
  children: ReactNode;
}

// Provider component
export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [isSpeakToMeOpen, setIsSpeakToMeOpen] = useState(false);
  const [contextEmail, setContextEmail] = useState<EmailMessage | null>(null);

  const openSpeakToMe = (email?: EmailMessage) => {
    setContextEmail(email || null);
    setIsSpeakToMeOpen(true);
  };

  const closeSpeakToMe = () => {
    setIsSpeakToMeOpen(false);
  };

  return (
    <DashboardContext.Provider
      value={{
        openSpeakToMe,
        closeSpeakToMe,
        isSpeakToMeOpen,
        contextEmail,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

// Hook for using the context
export const useDashboardContext = () => useContext(DashboardContext); 