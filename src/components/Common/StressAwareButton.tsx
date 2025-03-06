import { Button, ButtonProps, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface StressAwareButtonProps extends ButtonProps {
  stressLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  tooltipText?: string;
}

export const StressAwareButton = ({ 
  stressLevel = 'LOW',
  tooltipText,
  children,
  ...props 
}: StressAwareButtonProps) => {
  return (
    <Tooltip 
      title={tooltipText || ''}
      placement="top"
      arrow
    >
      <Button
        {...props}
        data-stress-level={stressLevel}
        aria-label={`${props['aria-label'] || children} (Stress Level: ${stressLevel})`}
        sx={{
          transition: 'all 0.3s ease',
          '&:focus': {
            outline: '3px solid',
            outlineColor: theme => 
              stressLevel === 'HIGH' 
                ? alpha(theme.palette.error.main, 0.5)
                : alpha(theme.palette.primary.main, 0.5)
          },
          ...props.sx
        }}
      >
        {children}
      </Button>
    </Tooltip>
  );
}; 