import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../components/Auth/Login';
import { Dashboard } from '../components/Dashboard/Dashboard';
import { useAuth } from '../contexts/AuthContext';
import LandingPage from '../components/LandingPage';
import Settings from '../components/Settings/Settings';
import { EmailDashboard } from '../components/Dashboard/EmailDashboard';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} />
      <Route path="/email-dashboard" element={isAuthenticated ? <EmailDashboard /> : <Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes; 