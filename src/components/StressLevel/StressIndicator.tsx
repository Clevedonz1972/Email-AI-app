import React, { useEffect, useRef } from 'react';
import {
  Box,
  Chip,
  Tooltip,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Warning as WarningIcon,
  NotificationsOff as MuteIcon,
  VolumeUp as SoundIcon,
} from '@mui/icons-material';
import { useAccessibility } from '../../contexts/AccessibilityContext';

interface StressIndicatorProps {
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  showLabel?: boolean;
  enableSound?: boolean;
  size?: 'small' | 'medium';
  onMuteChange?: (muted: boolean) => void;
}

export const StressIndicator: React.FC<StressIndicatorProps> = ({
  level,
  showLabel = true,
  enableSound = false,
  size = 'medium',
  onMuteChange,
}) => {
  const theme = useTheme();
  const { preferences } = useAccessibility();
  const [muted, setMuted] = React.useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (enableSound && !muted && level === 'HIGH') {
      playAlertSound();
    }
  }, [level, enableSound, muted]);

  const getStressColor = () => {
    if (preferences.highContrast) {
      return {
        LOW: theme.palette.success.light,
        MEDIUM: theme.palette.warning.light,
        HIGH: theme.palette.error.light,
      }[level];
    }

    return {
      LOW: theme.palette.success.main,
      MEDIUM: theme.palette.warning.main,
      HIGH: theme.palette.error.main,
    }[level];
  };

  const getStressLabel = () => {
    return {
      LOW: 'Low Stress',
      MEDIUM: 'Medium Stress',
      HIGH: 'High Stress',
    }[level];
  };

  const playAlertSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/assets/alert.mp3');
    }
    audioRef.current.play().catch(console.error);
  };

  const handleMuteToggle = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    if (onMuteChange) {
      onMuteChange(newMuted);
    }
  };

  const iconSize = {
    small: 16,
    medium: 20,
  }[size];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Tooltip title={getStressLabel()}>
        <Chip
          icon={level === 'HIGH' ? <WarningIcon /> : undefined}
          label={showLabel ? getStressLabel() : undefined}
          size={size}
          sx={{
            bgcolor: getStressColor(),
            color: theme.palette.getContrastText(getStressColor()),
            fontSize: preferences.fontSize * {
              small: 0.75,
              medium: 0.875,
            }[size],
            '& .MuiChip-icon': {
              color: 'inherit',
            },
          }}
        />
      </Tooltip>

      {enableSound && level === 'HIGH' && (
        <Tooltip title={muted ? 'Unmute Alerts' : 'Mute Alerts'}>
          <IconButton
            size={size}
            onClick={handleMuteToggle}
            sx={{
              fontSize: iconSize,
            }}
          >
            {muted ? (
              <MuteIcon fontSize="inherit" />
            ) : (
              <SoundIcon fontSize="inherit" />
            )}
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}; 