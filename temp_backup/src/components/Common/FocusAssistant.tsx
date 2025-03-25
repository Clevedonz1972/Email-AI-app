import React, { useEffect, useRef } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

interface FocusAssistantProps {
  contentRef: React.RefObject<HTMLDivElement>;
  onComplete?: () => void;
}

const FocusOverlay = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: theme.zIndex.modal - 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

export const FocusAssistant: React.FC<FocusAssistantProps> = ({
  contentRef,
  onComplete
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.focus();
    }
  }, [contentRef]);

  const handleClick = () => {
    onComplete?.();
  };

  return (
    <FocusOverlay ref={overlayRef} onClick={handleClick}>
      <Box p={3} textAlign="center">
        <Typography variant="h6" color="white" gutterBottom>
          Focus Mode Active
        </Typography>
        <Typography color="white">
          Click anywhere to exit focus mode
        </Typography>
      </Box>
    </FocusOverlay>
  );
}; 