import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { EmailProvider } from './contexts/EmailContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import Dashboard from './pages/Dashboard';
import MainDashboard from './pages/MainDashboard';
import { ForgotPassword } from './components/Auth/ForgotPassword';
import { ResetPassword } from './components/Auth/ResetPassword';
import Settings from './pages/Settings';
import { Landing } from './pages/Landing';
import EmergencySupport from './components/Support/EmergencySupport';
import { EmailDashboard } from './components/Dashboard/EmailDashboard';
import OnboardingControls from './pages/Admin/OnboardingControls';
import AdminOnboarding from './pages/AdminOnboarding';
import CalendarDashboard from './pages/CalendarDashboard';
import { TestingDashboard } from './components/Dashboard/TestingDashboard';
import GraphVisualizer from './pages/GraphVisualizer';

// Placeholder component for upcoming dashboards
const ComingSoonDashboard: React.FC<{title: string}> = ({title}) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1>{title}</h1>
      <p>This dashboard is coming soon. We're working hard to bring you this feature!</p>
      <a href="/dashboard" style={{ marginTop: '2rem' }}>Return to Main Dashboard</a>
    </div>
  );
};

// Wrapper component that includes the EmergencySupport button
const AuthenticatedLayout: React.FC<{children: React.ReactNode}> = ({children}) => {
  return (
    <>
      {children}
      <EmergencySupport />
    </>
  );
};

export const AppRoutes: React.FC = () => {
  return (
    <AuthProvider>
      <EmailProvider>
        <SettingsProvider>
          <AppRoutesWithAuth />
        </SettingsProvider>
      </EmailProvider>
    </AuthProvider>
  );
};

// Inner component that has access to auth context
const AppRoutesWithAuth: React.FC = () => {
  const location = useLocation();
  
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Dashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/email-dashboard" 
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <EmailDashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/calendar" 
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <CalendarDashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/graph-visualizer" 
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <GraphVisualizer />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/chat-dashboard" 
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <ComingSoonDashboard title="Chat Dashboard" />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/calls-dashboard" 
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <ComingSoonDashboard title="Calls Dashboard" />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/finance-dashboard" 
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <ComingSoonDashboard title="Finance Dashboard" />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/health-dashboard" 
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <ComingSoonDashboard title="Health & Wellbeing Dashboard" />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Settings />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } 
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/admin/onboarding" element={
        <ProtectedRoute>
          <AuthenticatedLayout>
            <AdminOnboarding />
          </AuthenticatedLayout>
        </ProtectedRoute>
      } />
      <Route 
        path="/test-dashboard" 
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <TestingDashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}; 