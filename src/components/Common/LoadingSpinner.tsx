import { CircularProgress, Box, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  text?: string;
}

export const LoadingSpinner = ({ text = 'Loading' }: LoadingSpinnerProps) => {
  return (
    <Box
      role="status"
      aria-label={text}
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={2}
    >
      <CircularProgress />
      {text && <Typography>{text}</Typography>}
    </Box>
  );
}; 