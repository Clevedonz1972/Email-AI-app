import React from 'react';
import {
  Box,
  Typography,
  Slider,
  Switch,
  FormControl,
  FormControlLabel,
  Select,
  MenuItem,
  Paper
} from '@mui/material';
import { useSensoryPreferences } from '../../hooks/useSensoryPreferences';

export const SensorySettings: React.FC = () => {
  const { preferences, updatePreference } = useSensoryPreferences();

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Display & Reading Settings
      </Typography>

      <Box sx={{ my: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.reducedMotion}
              onChange={(e) => updatePreference('reducedMotion', e.target.checked)}
            />
          }
          label="Reduce Motion"
        />
      </Box>

      <Box sx={{ my: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.highContrast}
              onChange={(e) => updatePreference('highContrast', e.target.checked)}
            />
          }
          label="High Contrast"
        />
      </Box>

      <Box sx={{ my: 3 }}>
        <Typography id="font-size-slider" gutterBottom>
          Font Size
        </Typography>
        <Slider
          value={preferences.fontScale}
          onChange={(_, value) => updatePreference('fontScale', value as number)}
          min={1}
          max={2}
          step={0.1}
          marks
          aria-labelledby="font-size-slider"
        />
      </Box>

      <FormControl fullWidth sx={{ my: 2 }}>
        <Typography id="text-spacing-label" gutterBottom>
          Text Spacing
        </Typography>
        <Select
          value={preferences.textSpacing}
          onChange={(e) => updatePreference('textSpacing', e.target.value as any)}
          aria-labelledby="text-spacing-label"
        >
          <MenuItem value="normal">Normal</MenuItem>
          <MenuItem value="increased">Increased</MenuItem>
          <MenuItem value="maximum">Maximum</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ my: 2 }}>
        <Typography id="color-mode-label" gutterBottom>
          Color Mode
        </Typography>
        <Select
          value={preferences.colorMode}
          onChange={(e) => updatePreference('colorMode', e.target.value as any)}
          aria-labelledby="color-mode-label"
        >
          <MenuItem value="default">Default</MenuItem>
          <MenuItem value="deuteranopia">Deuteranopia</MenuItem>
          <MenuItem value="protanopia">Protanopia</MenuItem>
          <MenuItem value="tritanopia">Tritanopia</MenuItem>
        </Select>
      </FormControl>
    </Paper>
  );
}; 