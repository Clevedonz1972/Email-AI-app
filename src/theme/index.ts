import { createTheme, Theme } from '@mui/material/styles';
import { AccessibilityPreferences } from '../contexts/AccessibilityContext';

export enum StressLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export const colors = {
  stress: {
    [StressLevel.LOW]: '#4CAF50',
    [StressLevel.MEDIUM]: '#FFC107',
    [StressLevel.HIGH]: '#F44336'
  },
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0'
  },
  secondary: {
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2'
  }
};

export const PRIORITY_COLORS = {
  LOW: '#4CAF50',
  MEDIUM: '#FFC107',
  HIGH: '#F44336'
};

export const semanticColors = {
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3'
};

export const lightTheme = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0'
  },
  secondary: {
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2'
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff'
  },
  text: {
    primary: '#000000',
    secondary: '#666666'
  }
};

export const darkTheme = {
  primary: {
    main: '#90caf9',
    light: '#e3f2fd',
    dark: '#42a5f5'
  },
  secondary: {
    main: '#ce93d8',
    light: '#f3e5f5',
    dark: '#ab47bc'
  },
  background: {
    default: '#303030',
    paper: '#424242'
  },
  text: {
    primary: '#ffffff',
    secondary: '#bbbbbb'
  }
};

export const createAppTheme = (preferences: AccessibilityPreferences): Theme => {
  const mode = preferences.colorScheme === 'system' 
    ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    : preferences.colorScheme;

  const themeBase = mode === 'dark' ? darkTheme : lightTheme;

  return createTheme({
    palette: {
      mode,
      primary: themeBase.primary,
      secondary: themeBase.secondary,
      background: themeBase.background,
      text: themeBase.text,
      error: {
        main: semanticColors.error
      },
      warning: {
        main: semanticColors.warning
      },
      info: {
        main: semanticColors.info
      },
      success: {
        main: semanticColors.success
      }
    },
    typography: {
      htmlFontSize: preferences.fontSize,
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"OpenDyslexic"',
      ].join(','),
      body1: {
        lineHeight: preferences.lineSpacing,
      }
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: preferences.reducedMotion ? 'none' : undefined,
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          },
        },
      },
    }
  });
};

export default createAppTheme;