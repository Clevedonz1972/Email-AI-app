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

// Base theme configuration
export const theme = createTheme({
  palette: {
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
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828'
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100'
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b'
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20'
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C3E50',
      secondary: '#5D7285',
    }
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
      '"OpenDyslexic"'
    ].join(','),
    h1: {
      fontSize: '2rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1.1rem',
      lineHeight: 1.8,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          padding: '8px 16px',
          borderRadius: '8px',
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }
      }
    }
  }
});

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