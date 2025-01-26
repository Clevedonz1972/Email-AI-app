import React, { useState, useMemo } from 'react';
import { Container, Box, IconButton } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import { EmailList } from './components/EmailList/EmailList';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { createAppTheme } from './theme/theme';
import { mockEmails } from './test-utils/test-utils';
import { SearchBar } from './components/SearchBar/SearchBar';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { Dashboard } from './components/Dashboard/Dashboard';

const AppContent: React.FC = () => {
  const { settings } = useSettings();
  const [emails, setEmails] = useState(mockEmails);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleMarkRead = (id: string) => {
    setEmails(emails.map(email => 
      email.id === id ? { ...email, isRead: true } : email
    ));
  };

  const handleFlag = (id: string) => {
    setEmails(emails.map(email => 
      email.id === id ? { ...email, priority: 'HIGH' } : email
    ));
  };

  const filteredEmails = useMemo(() => {
    return emails
      .filter(email => {
        // Apply priority filters
        if (!settings.priorityFilters.includes(email.priority)) {
          return false;
        }
        
        // Apply search filter
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          return (
            email.sender.name.toLowerCase().includes(searchLower) ||
            email.sender.email.toLowerCase().includes(searchLower) ||
            email.subject.toLowerCase().includes(searchLower) ||
            email.preview.toLowerCase().includes(searchLower)
          );
        }
        return true;
      })
      .sort((a, b) => {
        switch (settings.sortBy) {
          case 'priority':
            return b.priority.localeCompare(a.priority);
          case 'sender':
            return a.sender.name.localeCompare(b.sender.name);
          case 'date':
          default:
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }
      });
  }, [emails, settings.priorityFilters, settings.sortBy, searchQuery]);

  return (
    <ThemeProvider theme={createAppTheme(settings.darkMode ? 'dark' : 'light')}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1 }}>
          <IconButton 
            onClick={() => navigate('/settings')}
            aria-label="Open settings"
          >
            <SettingsIcon />
          </IconButton>
        </Box>
        <Routes>
          <Route 
            path="/" 
            element={
              <Box sx={{ my: 4 }}>
                <SearchBar onSearch={setSearchQuery} />
                <EmailList 
                  emails={filteredEmails}
                  onMarkRead={handleMarkRead}
                  onFlag={handleFlag}
                  isLoading={false}
                />
              </Box>
            } 
          />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Container>
    </ThemeProvider>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider theme={createAppTheme('light')}>
          <CssBaseline />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App; 