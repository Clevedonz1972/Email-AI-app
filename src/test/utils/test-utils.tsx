import React from 'react';
import { render as rtlRender, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider } from '@/contexts/AuthContext';
import { EmailProvider } from '@/contexts/EmailContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { theme } from '@/theme';

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <EmailProvider>
              {children}
            </EmailProvider>
          </AuthProvider>
        </ThemeProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}

// Export the custom render method and other testing utilities
export function render(ui: React.ReactElement, options = {}) {
  return rtlRender(ui, { wrapper: TestWrapper, ...options });
}

export { screen, fireEvent, waitFor }; 