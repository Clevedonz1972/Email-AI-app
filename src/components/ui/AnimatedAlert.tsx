import React from 'react';
import { Alert, AlertProps, Collapse, Box } from '@mui/material';

export interface AnimatedAlertProps extends Omit<AlertProps, 'children'> {
  show: boolean;
  message?: React.ReactNode;
  children?: React.ReactNode;
}

export const AnimatedAlert: React.FC<AnimatedAlertProps> = ({
  show,
  message,
  children,
  sx,
  ...alertProps
}) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Collapse in={show}>
        <Alert sx={sx} {...alertProps}>
          {message || children}
        </Alert>
      </Collapse>
    </Box>
  );
}; 