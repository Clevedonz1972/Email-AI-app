import React from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { useAccessibility } from '../../contexts/AccessibilityContext';

export const AccessibilitySettings: React.FC = () => {
  const { preferences, updatePreferences } = useAccessibility();

  const handleSwitchChange = (key: keyof typeof preferences) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    updatePreferences({ [key]: event.target.checked });
  };

  const handleSliderChange = (key: keyof typeof preferences) => (
    _event: Event,
    value: number | number[]
  ) => {
    updatePreferences({ [key]: value });
  };

  const handleColorSchemeChange = (event: SelectChangeEvent<string>) => {
    updatePreferences({
      colorScheme: event.target.value as 'light' | 'dark' | 'system'
    });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Accessibility Settings
      </Typography>

      <Box sx={{ my: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.highContrast}
              onChange={handleSwitchChange('highContrast')}
            />
          }
          label="High Contrast Mode"
        />
      </Box>

      <Box sx={{ my: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.reducedMotion}
              onChange={handleSwitchChange('reducedMotion')}
            />
          }
          label="Reduce Motion"
        />
      </Box>

      <Box sx={{ my: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.focusMode}
              onChange={handleSwitchChange('focusMode')}
            />
          }
          label="Focus Mode"
        />
      </Box>

      <Box sx={{ my: 3 }}>
        <Typography id="font-size-slider" gutterBottom>
          Font Size
        </Typography>
        <Slider
          value={preferences.fontSize}
          onChange={handleSliderChange('fontSize')}
          min={12}
          max={24}
          step={2}
          marks
          aria-labelledby="font-size-slider"
        />
      </Box>

      <Box sx={{ my: 3 }}>
        <Typography id="line-spacing-slider" gutterBottom>
          Line Spacing
        </Typography>
        <Slider
          value={preferences.lineSpacing}
          onChange={handleSliderChange('lineSpacing')}
          min={1}
          max={2}
          step={0.1}
          marks
          aria-labelledby="line-spacing-slider"
        />
      </Box>

      <FormControl fullWidth sx={{ my: 2 }}>
        <InputLabel id="color-scheme-label">Color Scheme</InputLabel>
        <Select
          labelId="color-scheme-label"
          value={preferences.colorScheme}
          onChange={handleColorSchemeChange}
          label="Color Scheme"
        >
          <MenuItem value="light">Light</MenuItem>
          <MenuItem value="dark">Dark</MenuItem>
          <MenuItem value="system">System</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ my: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.colorBlindMode}
              onChange={handleSwitchChange('colorBlindMode')}
            />
          }
          label="Color Blind Mode"
        />
      </Box>

      <Box sx={{ my: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.soundEffects}
              onChange={handleSwitchChange('soundEffects')}
            />
          }
          label="Sound Effects"
        />
      </Box>

      <Box sx={{ my: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.keyboardNavigation}
              onChange={handleSwitchChange('keyboardNavigation')}
            />
          }
          label="Keyboard Navigation"
        />
      </Box>
    </Paper>
  );
}; 