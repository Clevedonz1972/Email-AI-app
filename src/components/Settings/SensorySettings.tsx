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
  Paper,
  SelectChangeEvent
} from '@mui/material';
import { useSensoryPreferences } from '../../hooks/useSensoryPreferences';
import type { SensoryPreferences } from '@/types/preferences';

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
              checked={preferences.motion === 'reduced'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                updatePreference('motion', e.target.checked ? 'reduced' : 'normal')
              }
            />
          }
          label="Reduce Motion"
        />
      </Box>

      <Box sx={{ my: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.contrast === 'high'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                updatePreference('contrast', e.target.checked ? 'high' : 'normal')
              }
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
          onChange={(_event: Event, value: number | number[], activeThumb: number) => {
            if (typeof value === 'number') {
              updatePreference('fontScale', value);
            }
          }}
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
        <Select<SensoryPreferences['textSpacing']>
          value={preferences.textSpacing}
          onChange={(e: SelectChangeEvent<'normal' | 'increased' | 'maximum'>) => 
            updatePreference('textSpacing', e.target.value as SensoryPreferences['textSpacing'])
          }
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
        <Select<SensoryPreferences['colorMode']>
          value={preferences.colorMode}
          onChange={(e: SelectChangeEvent<'default' | 'deuteranopia' | 'protanopia' | 'tritanopia'>) => 
            updatePreference('colorMode', e.target.value as SensoryPreferences['colorMode'])
          }
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