import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, Fade } from '@mui/material';
import { KeyboardArrowUp, KeyboardArrowDown, Check } from '@mui/icons-material';
import { useAccessibility } from '../../contexts/AccessibilityContext';

interface FocusAssistantProps {
  contentRef: React.RefObject<HTMLDivElement>;
  onComplete: () => void;
}

export const FocusAssistant: React.FC<FocusAssistantProps> = ({
  contentRef,
  onComplete,
}) => {
  const { preferences } = useAccessibility();
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      // Get all focusable elements
      const elements = contentRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      setFocusableElements(Array.from(elements));
    }
  }, [contentRef]);

  useEffect(() => {
    if (focusableElements.length > 0) {
      focusableElements[currentIndex]?.focus();
    }
  }, [currentIndex, focusableElements]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        setCurrentIndex(prev => 
          prev > 0 ? prev - 1 : focusableElements.length - 1
        );
        break;
      case 'ArrowDown':
        event.preventDefault();
        setCurrentIndex(prev => 
          prev < focusableElements.length - 1 ? prev + 1 : 0
        );
        break;
      case 'Enter':
        event.preventDefault();
        focusableElements[currentIndex]?.click();
        break;
      case 'Escape':
        event.preventDefault();
        onComplete();
        break;
    }
  };

  return (
    <Fade in={preferences.focusMode}>
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          zIndex: 1000,
          ...(preferences.highContrast && {
            border: theme => `2px solid ${theme.palette.primary.main}`,
          }),
        }}
        onKeyDown={handleKeyDown}
        role="navigation"
        aria-label="Focus navigation"
      >
        <Typography
          variant="body2"
          sx={{
            fontSize: preferences.fontSize * 0.875,
            mb: 1,
          }}
        >
          Focus Navigation
        </Typography>
        
        <Box display="flex" gap={1}>
          <IconButton
            size="small"
            onClick={() => setCurrentIndex(prev => 
              prev > 0 ? prev - 1 : focusableElements.length - 1
            )}
            aria-label="Previous element"
          >
            <KeyboardArrowUp />
          </IconButton>
          
          <IconButton
            size="small"
            onClick={() => setCurrentIndex(prev => 
              prev < focusableElements.length - 1 ? prev + 1 : 0
            )}
            aria-label="Next element"
          >
            <KeyboardArrowDown />
          </IconButton>
          
          <IconButton
            size="small"
            onClick={onComplete}
            aria-label="Exit focus mode"
            color="primary"
          >
            <Check />
          </IconButton>
        </Box>

        <Typography
          variant="caption"
          sx={{
            fontSize: preferences.fontSize * 0.75,
            opacity: 0.7,
          }}
        >
          {`${currentIndex + 1} of ${focusableElements.length}`}
        </Typography>
      </Box>
    </Fade>
  );
}; 