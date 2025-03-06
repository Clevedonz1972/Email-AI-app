import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    // Your palette configuration
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          // Neurodivergent-friendly button styles
          transition: 'all 0.3s ease',
          '&:focus': {
            outline: '3px solid',
          }
        }
      }
    }
  }
}); 