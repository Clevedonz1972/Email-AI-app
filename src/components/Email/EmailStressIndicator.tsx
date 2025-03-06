import React, { useState } from 'react';
import { Box, Tooltip, useTheme, Slider, IconButton, Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TimerIcon from '@mui/icons-material/Timer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import type { EmailMessage, StressLevel } from '@/types/email';

const StressIndicatorWrapper = styled(Box)<{ stress: StressLevel; highContrast: boolean }>(
  ({ theme, stress, highContrast }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    position: 'relative',
    transition: 'all 0.3s ease',
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
    backgroundColor: highContrast
      ? stress === 'HIGH' ? '#FF0000'
      : stress === 'MEDIUM' ? '#FF8C00'
      : stress === 'LOW' ? '#008000'
      : theme.palette.grey[900]
      : stress === 'HIGH' ? theme.palette.error.light
      : stress === 'MEDIUM' ? theme.palette.warning.light
      : stress === 'LOW' ? theme.palette.success.light
      : theme.palette.grey[100],
    color: highContrast ? '#FFFFFF' : theme.palette.text.primary,
    '&:focus-visible': {
      outline: `3px solid ${theme.palette.primary.main}`,
      outlineOffset: '2px',
    },
    '&:hover': {
      transform: 'scale(1.02)',
      '@media (prefers-reduced-motion: reduce)': {
        transform: 'none',
      },
    },
  })
);

const Pattern = styled('div')<{ stress: StressLevel }>(({ stress }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  opacity: 0.1,
  backgroundImage: stress === 'HIGH'
    ? 'repeating-linear-gradient(45deg, #000 0, #000 10px, transparent 10px, transparent 20px)'
    : stress === 'MEDIUM'
    ? 'repeating-linear-gradient(90deg, #000 0, #000 5px, transparent 5px, transparent 10px)'
    : 'none',
  pointerEvents: 'none',
}));

interface EmailStressIndicatorProps {
  email: EmailMessage;
  onVolumeChange?: (volume: number) => void;
  onSpeedChange?: (speed: number) => void;
}

export const EmailStressIndicator: React.FC<EmailStressIndicatorProps> = ({
  email,
  onVolumeChange,
  onSpeedChange,
}) => {
  const theme = useTheme();
  const { preferences } = useAccessibility();
  const { stress_level: stressLevel, priority } = email;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [volume, setVolume] = useState(70);
  const [speed, setSpeed] = useState(1);

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
    const value = newValue as number;
    setVolume(value);
    onVolumeChange?.(value);
  };

  const handleSpeedChange = (_event: Event, newValue: number | number[]) => {
    const value = newValue as number;
    setSpeed(value);
    onSpeedChange?.(value);
  };

  const getTooltipText = () => {
    switch (stressLevel) {
      case 'HIGH':
        return 'This email requires immediate attention - high stress level detected';
      case 'MEDIUM':
        return 'This email should be addressed soon - moderate stress level detected';
      case 'LOW':
        return 'This email can be handled at your convenience - low stress level';
      default:
        return 'Email stress level indicator';
    }
  };

  const getIcon = () => {
    switch (stressLevel) {
      case 'HIGH':
        return <ErrorOutlineIcon fontSize="large" />;
      case 'MEDIUM':
        return <TimerIcon fontSize="large" />;
      case 'LOW':
        return <CheckCircleIcon fontSize="large" />;
      default:
        return <CheckCircleIcon fontSize="large" />;
    }
  };

  return (
    <Tooltip 
      title={getTooltipText()}
      enterDelay={700}
      leaveDelay={200}
    >
      <StressIndicatorWrapper
        stress={stressLevel}
        highContrast={preferences.highContrast}
        role="status"
        data-testid="stress-indicator"
        aria-label={`${stressLevel.toLowerCase()} stress level`}
        aria-live="polite"
        tabIndex={0}
      >
        <Pattern stress={stressLevel} data-testid="pattern" />
        {getIcon()}
        <Box component="span" ml={1} sx={{ fontSize: '1.1rem' }}>
          {priority.toLowerCase()} priority
        </Box>

        <Box ml={2} display="flex" alignItems="center">
          <IconButton
            aria-label="Audio feedback settings"
            onClick={handleSettingsClick}
            size="small"
          >
            <VolumeUpIcon />
          </IconButton>
          <IconButton
            aria-label="Customize indicator"
            onClick={handleSettingsClick}
            size="small"
          >
            <SettingsIcon />
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <MenuItem>
            <Box width={200}>
              <Box mb={2}>
                <label htmlFor="volume-slider">Audio Volume</label>
                <Slider
                  id="volume-slider"
                  value={volume}
                  onChange={handleVolumeChange}
                  aria-label="Audio feedback volume"
                  valueLabelDisplay="auto"
                  min={0}
                  max={100}
                />
              </Box>
              <Box mb={2}>
                <label htmlFor="speed-slider">Playback Speed</label>
                <Slider
                  id="speed-slider"
                  value={speed}
                  onChange={handleSpeedChange}
                  aria-label="Audio feedback speed"
                  valueLabelDisplay="auto"
                  min={0.5}
                  max={2}
                  step={0.1}
                />
              </Box>
            </Box>
          </MenuItem>
        </Menu>
      </StressIndicatorWrapper>
    </Tooltip>
  );
}; 