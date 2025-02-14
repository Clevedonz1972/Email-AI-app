import { createTheme } from '@mui/material/styles';

// Define semantic colors that work well for both light and dark modes
export const semanticColors = {
  urgent: '#FF6B6B',
  mediumPriority: '#FFB067',
  success: '#4CAF50',
  info: '#2196F3',
};

// Define stress levels
export type StressLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'all';

// Colors for different stress levels
export const colors: Record<StressLevel, string> = {
  HIGH: '#FF6B6B',
  MEDIUM: '#FFA94D',
  LOW: '#51CF66',
  all: '#868E96'
};

// Priority colors
export const PRIORITY_COLORS: Record<'HIGH' | 'MEDIUM' | 'LOW', string> = {
  HIGH: '#FF6B6B',
  MEDIUM: '#FFA94D',
  LOW: '#51CF66'
};

// Define a function to create themes dynamically
export const createAppTheme = (mode: 'light' | 'dark' = 'light') => 
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#1976d2' : '#90caf9',
        light: mode === 'light' ? '#42a5f5' : '#bbdefb',
        dark: mode === 'light' ? '#1565c0' : '#42a5f5',
      },
      secondary: {
        main: mode === 'light' ? '#9c27b0' : '#ce93d8',
        light: mode === 'light' ? '#ba68c8' : '#f3e5f5',
        dark: mode === 'light' ? '#7b1fa2' : '#ab47bc',
      },
      background: {
        default: mode === 'light' ? '#F5F7FA' : '#121212',
        paper: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
      },
      text: {
        primary: mode === 'light' ? '#2C3E50' : '#FFFFFF',
        secondary: mode === 'light' ? '#5D7285' : '#B0BEC5',
      },
      error: {
        main: '#d32f2f',
      },
      warning: {
        main: '#ed6c02',
      },
      info: {
        main: '#0288d1',
      },
      success: {
        main: '#2e7d32',
      },
    },
    typography: {
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
      h1: {
        fontSize: '2rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '1.1rem',
        lineHeight: 1.8,
      },
    },
    components: {
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
    },
  });

// Export the default theme
export const theme = createAppTheme('light');

// Add custom type declarations for theme
declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: string;
    };
  }
  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }
}