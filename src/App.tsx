import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRoutes } from './routes';
import { DashboardProvider } from './contexts/DashboardContext';

const App: React.FC = () => {
  return (
    <>
      <CssBaseline />
      <BrowserRouter>
        <DashboardProvider>
          <AppRoutes />
        </DashboardProvider>
      </BrowserRouter>
    </>
  );
};

export default App; 