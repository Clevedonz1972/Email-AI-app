import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Button } from '@mui/material';
import { createAppTheme } from './theme';
import App from './App';

const Root = () => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeProvider theme={createAppTheme(themeMode)}>
      <CssBaseline />
      <Button onClick={toggleTheme} sx={{ position: 'absolute', top: 10, right: 10 }}>
        {themeMode === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </Button>
      <App />
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);