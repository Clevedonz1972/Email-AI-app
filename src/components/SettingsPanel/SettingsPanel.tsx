import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  Switch,
  Slider,
  FormControlLabel,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  settings: {
    darkMode: boolean;
    fontSize: number;
    lineSpacing: number;
    reduceAnimations: boolean;
  };
  onSettingsChange: (key: string, value: any) => void;
}

const SettingsSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  open,
  onClose,
  settings,
  onSettingsChange,
}) => {
  const [tempSettings, setTempSettings] = React.useState(settings);

  const handleChange = (key: string, value: any) => {
    setTempSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    Object.entries(tempSettings).forEach(([key, value]) => {
      onSettingsChange(key, value);
    });
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 320 },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Display Settings
        </Typography>

        <SettingsSection>
          <FormControlLabel
            control={
              <Switch
                checked={tempSettings.darkMode}
                onChange={(e) => handleChange('darkMode', e.target.checked)}
              />
            }
            label="Dark Mode"
          />
        </SettingsSection>

        <SettingsSection>
          <Typography gutterBottom>Text Size</Typography>
          <Slider
            value={tempSettings.fontSize}
            min={12}
            max={24}
            step={1}
            onChange={(_, value) => handleChange('fontSize', value)}
            valueLabelDisplay="auto"
            aria-label="Font size"
          />
        </SettingsSection>

        <SettingsSection>
          <Typography gutterBottom>Line Spacing</Typography>
          <Slider
            value={tempSettings.lineSpacing}
            min={1.2}
            max={2.0}
            step={0.1}
            onChange={(_, value) => handleChange('lineSpacing', value)}
            valueLabelDisplay="auto"
            aria-label="Line spacing"
          />
        </SettingsSection>

        <SettingsSection>
          <FormControlLabel
            control={
              <Switch
                checked={tempSettings.reduceAnimations}
                onChange={(e) => handleChange('reduceAnimations', e.target.checked)}
              />
            }
            label="Reduce Animations"
          />
        </SettingsSection>

        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleApply}
            fullWidth
          >
            Apply Changes
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            fullWidth
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}; 