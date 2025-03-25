import React, { useState, useEffect } from 'react';
import { Alert, AlertProps, Collapse, Box } from '@mui/material';

export interface AnimatedAlertProps extends Omit<AlertProps, 'children'> {
  show: boolean;
  message: string;
  autoHideDuration?: number;
  onClose?: () => void;
}

export const AnimatedAlert: React.FC<AnimatedAlertProps> = ({
  show,
  message,
  severity = 'info',
  autoHideDuration = 6000,
  onClose,
  ...alertProps
}) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
    
    let timer: NodeJS.Timeout;
    if (show && autoHideDuration && onClose) {
      timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, autoHideDuration);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [show, autoHideDuration, onClose]);

  return (
    <Box sx={{ width: '100%' }}>
      <Collapse in={visible}>
        <Alert 
          severity={severity} 
          onClose={onClose ? () => {
            setVisible(false);
            setTimeout(onClose, 300); // Wait for animation to complete
          } : undefined}
          {...alertProps}
        >
          {message}
        </Alert>
      </Collapse>
    </Box>
  );
}; 