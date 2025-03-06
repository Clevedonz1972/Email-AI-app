import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { useAccessibility } from './contexts/AccessibilityContext';
import Routes from './routes';

const ThemedApp: React.FC = () => {
  const { preferences } = useAccessibility();
  
  const theme = React.useMemo(() => createTheme({
    palette: {
      mode: preferences.colorScheme === 'dark' ? 'dark' : 'light',
      ...(preferences.customColors && {
        background: {
          default: preferences.customColors.background,
          paper: preferences.customColors.background,
        },
        text: {
          primary: preferences.customColors.text,
        },
        primary: {
          main: preferences.customColors.accent,
        },
      }),
    },
    typography: {
      fontSize: preferences.fontSize,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            lineHeight: preferences.lineSpacing,
            transition: preferences.reducedMotion ? 'none' : undefined,
          },
        },
      },
    },
  }), [preferences]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes />
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AccessibilityProvider>
        <ThemedApp />
      </AccessibilityProvider>
    </BrowserRouter>
  );
};

export default App; 