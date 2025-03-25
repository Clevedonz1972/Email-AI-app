import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import createAppTheme from './theme/index';
import App from './App';
import { AccessibilityProvider, useAccessibility } from './contexts/AccessibilityContext';
import './styles.css';

const ThemedApp = () => {
  const { preferences } = useAccessibility();
  
  // Log current theme settings for debugging
  useEffect(() => {
    console.log('Theme settings updated:', {
      colorScheme: preferences.colorScheme,
      isDarkMode: preferences.colorScheme === 'dark'
    });
    
    // Add class to body for CSS targeting
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(preferences.colorScheme === 'dark' ? 'dark-mode' : 'light-mode');
  }, [preferences.colorScheme]);
  
  // Create theme based on current preferences
  const theme = React.useMemo(() => {
    return createAppTheme(preferences);
  }, [preferences]);

  return (
    <ThemeProvider theme={theme}>
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