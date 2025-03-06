import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import createAppTheme from './theme/index';
import App from './App';
import { AccessibilityProvider, useAccessibility } from './contexts/AccessibilityContext';

const ThemedApp = () => {
  const { preferences } = useAccessibility();
  return (
    <ThemeProvider theme={createAppTheme(preferences)}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AccessibilityProvider>
      <ThemedApp />
    </AccessibilityProvider>
  </React.StrictMode>
);