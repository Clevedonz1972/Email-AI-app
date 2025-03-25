import { createTheme } from '@mui/material/styles';
import { theme, colors, PRIORITY_COLORS, semanticColors } from './theme';
import type { AccessibilityPreferences } from '../types/preferences';

// Function to create a theme based on preferences
const createAppTheme = (preferences: AccessibilityPreferences | string) => {
  // If a string is passed, assume it's the color scheme
  const colorScheme = typeof preferences === 'string' 
    ? preferences 
    : preferences?.colorScheme || 'light';
  
  return createTheme({
    ...theme,
    palette: {
      ...theme.palette,
      mode: colorScheme === 'dark' ? 'dark' : 'light'
    }
  });
};

export { 
  theme,
  colors,
  PRIORITY_COLORS,
  semanticColors
};

export default createAppTheme; 