import { Button as MuiButton, ButtonProps } from '@mui/material';

export const Button = ({ children, ...props }: ButtonProps) => {
  return (
    <MuiButton
      {...props}
      sx={{
        // Neurodivergent-friendly styles
        transition: 'all 0.3s ease',
        '&:focus': {
          outline: '3px solid currentColor',
          outlineOffset: '2px',
        },
        ...props.sx
      }}
    >
      {children}
    </MuiButton>
  );
}; 