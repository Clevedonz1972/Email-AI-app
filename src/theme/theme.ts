import { createTheme } from '@mui/material/styles';

// Define custom typography including dyslexia-friendly fonts
const typography = {
  fontFamily: '"OpenDyslexic", "Verdana", sans-serif',
  h1: {
    fontSize: '2rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1.1rem',
    lineHeight: 1.8,
  },
};

// Define semantic colors that work well for both light and dark modes
const semanticColors = {
  urgent: '#FF6B6B',
  mediumPriority: '#FFB067',
  success: '#4CAF50',
  info: '#2196F3',
};

// Create theme with light and dark mode variants
export const createAppTheme = (mode: 'light' | 'dark') => {
  return createTheme({
    palette: {
      mode,
      ...(mode === 'light' 
        ? {
            background: {
              default: '#F5F7FA',
              paper: '#FFFFFF',
            },
            text: {
              primary: '#2C3E50',
              secondary: '#5D7285',
            },
          }
        : {
            background: {
              default: '#1A1A1A',
              paper: '#2D2D2D',
            },
            text: {
              primary: '#E0E0E0',
              secondary: '#B0B0B0',
            },
          }),
    },
    typography,
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
            borderRadius: '12px',
            boxShadow: mode === 'light' 
              ? '0 2px 4px rgba(0,0,0,0.05)' 
              : '0 2px 4px rgba(0,0,0,0.2)',
          },
        },
      },
    },
  });
};

export const PRIORITY_COLORS = {
  HIGH: semanticColors.urgent,
  MEDIUM: semanticColors.mediumPriority,
  LOW: '#6C757D',
}; 