import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRoutes } from './routes';

const App: React.FC = () => {
  return (
    <>
      <CssBaseline />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </>
  );
};

export default App; 