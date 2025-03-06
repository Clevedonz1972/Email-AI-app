import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  useTheme,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  FormatSize as FormatSizeIcon,
  Contrast as ContrastIcon,
} from '@mui/icons-material';
import { useAccessibility } from '../../contexts/AccessibilityContext';

interface SimplifiedViewProps {
  emailContent: string;
  subject: string;
  sender: string;
  timestamp: string;
  stressLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  onToggleView: () => void;
  isSimplified: boolean;
}

export const SimplifiedView: React.FC<SimplifiedViewProps> = ({
  emailContent,
  subject,
  sender,
  timestamp,
  stressLevel,
  onToggleView,
  isSimplified,
}) => {
  const theme = useTheme();
  const { preferences, updatePreferences } = useAccessibility();
  const {
    highContrast,
    textScale,
    reducedMotion,
  } = preferences;

  const handleFocusModeToggle = () => {
    updatePreferences({
      ...preferences,
      simplified_view: {
        ...preferences.simplified_view,
        focus_mode: !preferences.simplified_view.focus_mode,
      },
    });
  };

  const getStressColor = () => {
    if (!stressLevel) return theme.palette.text.primary;
    const colors = {
      LOW: theme.palette.success.main,
      MEDIUM: theme.palette.warning.main,
      HIGH: theme.palette.error.main,
    };
    return highContrast ? theme.palette.text.primary : colors[stressLevel];
  };

  const containerStyles = {
    padding: theme.spacing(3),
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: highContrast ? theme.palette.background.default : theme.palette.background.paper,
    transition: reducedMotion ? 'none' : 'all 0.3s ease',
  };

  const textStyles = {
    fontSize: `${textScale}%`,
    color: highContrast ? theme.palette.text.primary : theme.palette.text.secondary,
    transition: reducedMotion ? 'none' : 'all 0.2s ease',
  };

  return (
    <Paper elevation={isSimplified ? 1 : 3} sx={containerStyles}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" sx={{ ...textStyles, fontWeight: 'bold' }}>
          {subject}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title={isSimplified ? 'Show full view' : 'Show simplified view'}>
            <IconButton onClick={onToggleView} size="large">
              {isSimplified ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Tooltip>
          <FormControlLabel
            control={
              <Switch
                checked={preferences.simplified_view.focus_mode}
                onChange={handleFocusModeToggle}
                color="primary"
              />
            }
            label="Focus Mode"
          />
        </Box>
      </Box>

      {!preferences.simplified_view.hide_metadata && (
        <Box mb={2} sx={{ opacity: preferences.simplified_view.focus_mode ? 0.7 : 1 }}>
          <Typography sx={textStyles}>
            From: {sender}
          </Typography>
          <Typography sx={textStyles}>
            Time: {new Date(timestamp).toLocaleString()}
          </Typography>
          {stressLevel && (
            <Typography sx={{ ...textStyles, color: getStressColor() }}>
              Stress Level: {stressLevel}
            </Typography>
          )}
        </Box>
      )}

      <Box
        sx={{
          backgroundColor: preferences.simplified_view.focus_mode
            ? theme.palette.background.default
            : 'transparent',
          padding: preferences.simplified_view.focus_mode ? 2 : 0,
          borderRadius: 1,
        }}
      >
        <Typography
          sx={{
            ...textStyles,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
          }}
        >
          {emailContent}
        </Typography>
      </Box>

      <Box mt={2} display="flex" gap={1} justifyContent="flex-end">
        <Tooltip title="Adjust text size">
          <IconButton
            onClick={() => updatePreferences({
              ...preferences,
              textScale: ((preferences.textScale || 100) + 10) % 150,
            })}
          >
            <FormatSizeIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Toggle high contrast">
          <IconButton
            onClick={() => updatePreferences({
              ...preferences,
              highContrast: !preferences.highContrast,
            })}
          >
            <ContrastIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
}; 