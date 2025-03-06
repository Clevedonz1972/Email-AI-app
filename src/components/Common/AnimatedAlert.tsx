import React from 'react';
import { Alert, AlertProps, Collapse, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

interface AnimatedAlertProps extends AlertProps {
  show: boolean;
  message: string;
  recoveryTips?: string[];
}

const StyledAlert = styled(Alert)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  '& .MuiAlert-message': {
    width: '100%'
  }
}));

const RecoveryTip = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  fontSize: '0.875rem',
  color: theme.palette.text.secondary
}));

export const AnimatedAlert: React.FC<AnimatedAlertProps> = ({
  show,
  message,
  recoveryTips,
  ...props
}) => {
  return (
    <Collapse in={show}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <StyledAlert {...props}>
          {message}
          {recoveryTips && recoveryTips.length > 0 && (
            <RecoveryTip>
              <strong>Suggestions:</strong>
              <ul>
                {recoveryTips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </RecoveryTip>
          )}
        </StyledAlert>
      </motion.div>
    </Collapse>
  );
}; 