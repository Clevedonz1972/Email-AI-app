import React, { useState } from 'react';
import {
  Box,
  Typography,
  Switch,
  Slider,
  FormControlLabel,
  Paper,
  IconButton,
  Collapse,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import ContrastIcon from '@mui/icons-material/Contrast';
import SpeedIcon from '@mui/icons-material/Speed';

const SettingsPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const SettingRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
}));

interface AccessibilitySettings {
  textScale: number;
  highContrast: boolean;
  reducedMotion: boolean;
  // ... other settings
}

interface Props {
  settings: AccessibilitySettings;
  onSettingChange: (setting: keyof AccessibilitySettings, value: number | boolean) => void;
}

export const AccessibilitySettings: React.FC<Props> = ({ settings, onSettingChange }) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSettingChange = (setting: string, value: boolean | number) => {
    onSettingChange(setting as keyof AccessibilitySettings, value);
  };

  const handleSliderChange = (_: Event, value: number | number[]) => {
    // Ensure we're passing a single number
    onSettingChange('textScale', typeof value === 'number' ? value : value[0]);
  };

  return (
    <SettingsPanel>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <AccessibilityNewIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Accessibility Settings</Typography>
        </Box>
        <IconButton
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label="Toggle accessibility settings"
        >
          <SettingsIcon />
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        <Box mt={2}>
          <SettingRow>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.highContrast}
                  onChange={(e) =>
                    handleSettingChange('highContrast', e.target.checked)
                  }
                  color="primary"
                />
              }
              label={
                <Box display="flex" alignItems="center">
                  <ContrastIcon sx={{ mr: 1 }} />
                  <Typography>High Contrast Mode</Typography>
                </Box>
              }
            />
          </SettingRow>

          <SettingRow>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.reducedMotion}
                  onChange={(e) =>
                    handleSettingChange('reducedMotion', e.target.checked)
                  }
                  color="primary"
                />
              }
              label={
                <Box display="flex" alignItems="center">
                  <SpeedIcon sx={{ mr: 1 }} />
                  <Typography>Reduced Motion</Typography>
                </Box>
              }
            />
          </SettingRow>

          <SettingRow>
            <Box flex={1} mr={2}>
              <Box display="flex" alignItems="center" mb={1}>
                <FormatSizeIcon sx={{ mr: 1 }} />
                <Typography>Text Size</Typography>
              </Box>
              <Slider
                value={settings.textScale}
                onChange={handleSliderChange}
                min={80}
                max={200}
                step={10}
                marks
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
                aria-label="Text size adjustment"
              />
            </Box>
          </SettingRow>
        </Box>
      </Collapse>
    </SettingsPanel>
  );
}; 