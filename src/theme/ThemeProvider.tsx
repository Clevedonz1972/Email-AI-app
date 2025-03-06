import React from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useAccessibility } from '../contexts/AccessibilityContext';

// Define color palettes for different modes
const lightPalette = {
  primary: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d2',
  },
  secondary: {
    main: '#f50057',
    light: '#ff4081',
    dark: '#c51162',
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
  },
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
  },
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
  },
};

const darkPalette = {
  primary: {
    main: '#90caf9',
    light: '#e3f2fd',
    dark: '#42a5f5',
  },
  secondary: {
    main: '#f48fb1',
    light: '#fce4ec',
    dark: '#f06292',
  },
  error: {
    main: '#ef5350',
    light: '#e57373',
    dark: '#d32f2f',
  },
  warning: {
    main: '#ffa726',
    light: '#ffb74d',
    dark: '#f57c00',
  },
  success: {
    main: '#66bb6a',
    light: '#81c784',
    dark: '#388e3c',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
};

// Color blind friendly palette
const colorBlindPalette = {
  primary: {
    main: '#0077bb', // Blue - distinguishable for most color vision deficiencies
    light: '#40a1d8',
    dark: '#005588',
  },
  secondary: {
    main: '#ee7733', // Orange - distinguishable for most color vision deficiencies
    light: '#ff9966',
    dark: '#cc5500',
  },
  error: {
    main: '#ee3377', // Magenta - distinguishable for most color vision deficiencies
    light: '#ff6699',
    dark: '#cc0055',
  },
  warning: {
    main: '#eec73d', // Yellow - distinguishable for most color vision deficiencies
    light: '#ffd966',
    dark: '#cc9900',
  },
  success: {
    main: '#009988', // Teal - distinguishable for most color vision deficiencies
    light: '#33bbaa',
    dark: '#006655',
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
  },
};

// High contrast palette
const highContrastPalette = {
  primary: {
    main: '#000000',
    light: '#333333',
    dark: '#000000',
  },
  secondary: {
    main: '#ffffff',
    light: '#ffffff',
    dark: '#cccccc',
  },
  error: {
    main: '#ff0000',
    light: '#ff3333',
    dark: '#cc0000',
  },
  warning: {
    main: '#ff8800',
    light: '#ffaa33',
    dark: '#cc6600',
  },
  success: {
    main: '#008000',
    light: '#33aa33',
    dark: '#006600',
  },
  background: {
    default: '#ffffff',
    paper: '#ffffff',
  },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { preferences } = useAccessibility();

  const theme = React.useMemo(() => {
    // Select the appropriate color palette based on preferences
    let palette = preferences.highContrast
      ? highContrastPalette
      : preferences.colorBlindMode
      ? colorBlindPalette
      : lightPalette;

    return createTheme({
      palette: {
        mode: 'light',
        ...palette,
        text: {
          primary: preferences.highContrast ? '#000000' : '#212121',
          secondary: preferences.highContrast ? '#000000' : '#757575',
        },
      },
      typography: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: preferences.fontSize,
        h1: { fontSize: preferences.fontSize * 2.5 },
        h2: { fontSize: preferences.fontSize * 2 },
        h3: { fontSize: preferences.fontSize * 1.75 },
        h4: { fontSize: preferences.fontSize * 1.5 },
        h5: { fontSize: preferences.fontSize * 1.25 },
        h6: { fontSize: preferences.fontSize * 1.1 },
        body1: { fontSize: preferences.fontSize },
        body2: { fontSize: preferences.fontSize * 0.875 },
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              fontSize: preferences.fontSize,
              transition: preferences.reducedMotion ? 'none' : undefined,
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              transition: preferences.reducedMotion ? 'none' : undefined,
            },
          },
        },
        MuiLink: {
          styleOverrides: {
            root: {
              textDecoration: 'underline',
              ...(preferences.highContrast && {
                color: '#000000',
                '&:hover': {
                  color: '#000000',
                  textDecoration: 'none',
                },
              }),
            },
          },
        },
        MuiTooltip: {
          styleOverrides: {
            tooltip: {
              fontSize: preferences.fontSize * 0.75,
              backgroundColor: preferences.highContrast ? '#000000' : undefined,
            },
          },
        },
      },
    });
  }, [preferences]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}; 