import React from 'react';
import { Box, Button, Tooltip, Typography, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import SendIcon from '@mui/icons-material/Send';
import { useSettings } from '@/contexts/SettingsContext';
import { useDashboardContext } from '@/contexts/DashboardContext';

export type ActionType = 'email' | 'calendar' | 'task' | 'wellbeing';

interface ActionButtonsProps {
  type: ActionType;
  onDoItNow?: (type: ActionType) => void;
  onDefer?: (type: ActionType) => void;
  onAskASTI?: (type: ActionType) => void;
  onAutoReply?: (type: ActionType) => void;
  showAutoReply?: boolean;
  size?: 'small' | 'medium' | 'large';
  minimal?: boolean;
  vertical?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  type,
  onDoItNow,
  onDefer,
  onAskASTI,
  onAutoReply,
  showAutoReply = false,
  size = 'medium',
  minimal = true, // Default to minimal view now
  vertical = false,
}) => {
  const { settings } = useSettings();
  const { openSpeakToMe } = useDashboardContext();
  const isDarkMode = settings.darkMode;
  
  // Size adjustment based on prop
  const sizeMultiplier = size === 'small' ? 0.8 : size === 'large' ? 1.2 : 1;
  
  // Common button styles for icon-only view
  const iconButtonStyle = {
    minWidth: 'unset',
    width: `${38 * sizeMultiplier}px`,
    height: `${38 * sizeMultiplier}px`,
    padding: '8px',
    marginLeft: '4px',
    borderRadius: '8px',
  };

  const buttonIconStyle = {
    fontSize: `${1.4 * sizeMultiplier}rem`,
  };
  
  // Primary button style (blue)
  const primaryIconButtonStyle = {
    ...iconButtonStyle,
    backgroundColor: isDarkMode ? '#3a8eff' : '#1976d2',
    color: 'white',
    '&:hover': {
      backgroundColor: isDarkMode ? '#2979ff' : '#1565c0',
    }
  };

  // Secondary button style (lighter)
  const secondaryIconButtonStyle = {
    ...iconButtonStyle,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)',
    '&:hover': {
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
    }
  };
  
  // Default handlers
  const handleDoItNow = () => {
    if (onDoItNow) onDoItNow(type);
  };
  
  const handleDefer = () => {
    if (onDefer) onDefer(type);
  };
  
  const handleAskASTI = () => {
    if (onAskASTI) onAskASTI(type);
    openSpeakToMe();
  };
  
  const handleAutoReply = () => {
    if (onAutoReply) onAutoReply(type);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      flexDirection: vertical ? 'column' : 'row',
      '& > *': vertical ? { mb: 1 } : { ml: 1 }
    }}>
      <Tooltip title="Do it now">
        <IconButton 
          sx={primaryIconButtonStyle}
          onClick={handleDoItNow}
          size={size === 'small' ? 'small' : 'medium'}
        >
          <PlayArrowIcon sx={buttonIconStyle} />
        </IconButton>
      </Tooltip>
      <Tooltip title={`Defer ${type}`}>
        <IconButton 
          sx={secondaryIconButtonStyle}
          onClick={handleDefer}
          size={size === 'small' ? 'small' : 'medium'}
        >
          <WatchLaterIcon sx={buttonIconStyle} />
        </IconButton>
      </Tooltip>
      <Tooltip title={`Ask ASTI about ${type}`}>
        <IconButton 
          sx={secondaryIconButtonStyle}
          onClick={handleAskASTI}
          size={size === 'small' ? 'small' : 'medium'}
        >
          <QuestionAnswerIcon sx={buttonIconStyle} />
        </IconButton>
      </Tooltip>
      {/* Always show auto-reply button for email type, and respect showAutoReply prop for other types */}
      {(type === 'email' || showAutoReply) && (
        <Tooltip title={`Auto-reply to ${type}`}>
          <IconButton 
            sx={secondaryIconButtonStyle}
            onClick={handleAutoReply}
            size={size === 'small' ? 'small' : 'medium'}
          >
            <SendIcon sx={buttonIconStyle} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default ActionButtons; 