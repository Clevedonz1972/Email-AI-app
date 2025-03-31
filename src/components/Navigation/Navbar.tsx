import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton,
  Box,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import EmailIcon from '@mui/icons-material/Email';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ChatIcon from '@mui/icons-material/Chat';
import CallIcon from '@mui/icons-material/Call';
import GroupsIcon from '@mui/icons-material/Groups';
import StoreIcon from '@mui/icons-material/Store';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { AstiEasterEgg } from '../Branding/AstiEasterEgg';

export const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { settings, updateSettings } = useSettings();
  const { preferences, updatePreferences } = useAccessibility();
  const navigate = useNavigate();
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [astiEasterEggOpen, setAstiEasterEggOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    // Toggle between light and dark
    const newColorScheme = preferences.colorScheme === 'dark' ? 'light' : 'dark';
    
    // Log for debugging
    console.log(`Toggling theme from ${preferences.colorScheme} to ${newColorScheme}`);
    
    // Update both contexts
    updatePreferences({ colorScheme: newColorScheme });
    updateSettings({ ...settings, darkMode: newColorScheme === 'dark' });
    
    // Show a brief visual confirmation
    const body = document.body;
    body.style.transition = 'background-color 0.3s ease';
    body.style.backgroundColor = newColorScheme === 'dark' ? '#121212' : '#ffffff';
    
    // Animate the icon
    const icon = document.querySelector('.theme-toggle-icon');
    if (icon) {
      icon.classList.add('rotate-icon');
      setTimeout(() => {
        icon.classList.remove('rotate-icon');
      }, 500);
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };
  
  const handleAstiLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setAstiEasterEggOpen(true);
    
    // Still allow navigation if needed
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };
  
  const handleAstiEasterEggClose = () => {
    setAstiEasterEggOpen(false);
  };

  const menuItems = [
    { 
      text: 'Main Dashboard', 
      icon: <HomeIcon />, 
      path: '/dashboard',
      divider: false
    },
    { 
      text: 'Email Dashboard', 
      icon: <EmailIcon />, 
      path: '/email-dashboard',
      divider: false
    },
    { 
      text: 'Chat', 
      icon: <ChatIcon />, 
      path: '/chat-dashboard',
      divider: false,
      disabled: true
    },
    { 
      text: 'Calls', 
      icon: <CallIcon />, 
      path: '/calls-dashboard',
      divider: true,
      disabled: true
    },
    { 
      text: 'Health & Wellbeing', 
      icon: <HealthAndSafetyIcon />, 
      path: '/health-dashboard',
      divider: false,
      disabled: true
    },
    { 
      text: 'Finance', 
      icon: <AccountBalanceIcon />, 
      path: '/finance-dashboard',
      divider: true,
      disabled: true
    },
    { 
      text: 'Learn About Yourself', 
      icon: <PsychologyIcon />, 
      path: '/personal-insights',
      divider: true,
      disabled: true
    },
    { 
      text: 'Knowledge Graph', 
      icon: <BubbleChartIcon />, 
      path: '/graph-visualizer',
      divider: false
    },
    { 
      text: 'Community', 
      icon: <GroupsIcon />, 
      path: '/community',
      divider: false,
      disabled: true
    },
    { 
      text: 'Marketplace', 
      icon: <StoreIcon />, 
      path: '/marketplace',
      divider: true,
      disabled: true
    },
    { 
      text: 'AI Email Testing', 
      icon: <PsychologyIcon />, 
      path: '/test-dashboard',
      divider: false
    },
    { 
      text: 'Settings', 
      icon: <SettingsIcon />, 
      path: '/settings',
      divider: false
    }
  ];

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={toggleDrawer}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography 
          variant="h6" 
          component="div" 
          onClick={handleAstiLogoClick}
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            fontWeight: 'bold',
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'none',
              opacity: 0.9
            }
          }}
        >
          ASTI
        </Typography>

        <IconButton 
          color="inherit" 
          onClick={toggleTheme}
          aria-label={preferences.colorScheme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
        >
          {preferences.colorScheme === 'dark' ? (
            <LightModeIcon className="theme-toggle-icon" />
          ) : (
            <DarkModeIcon className="theme-toggle-icon" />
          )}
        </IconButton>

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1">
              {user?.email}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button color="inherit" onClick={() => navigate('/register')}>
              Register
            </Button>
          </Box>
        )}
      </Toolbar>

      {/* Drawer navigation */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
      >
        <Box
          sx={{ width: 280 }}
          role="presentation"
        >
          <Box sx={{ p: 2, backgroundColor: theme.palette.primary.main, color: 'white' }}>
            <Typography variant="h6" component="div">
              ASTI Navigation
            </Typography>
          </Box>
          <List>
            {menuItems.map((item, index) => (
              <React.Fragment key={item.text}>
                <ListItem 
                  button 
                  onClick={() => handleNavigation(item.path)}
                  disabled={item.disabled}
                  sx={{ 
                    opacity: item.disabled ? 0.5 : 1, 
                    '&.Mui-disabled': {
                      opacity: 0.5,
                    }
                  }}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    secondary={item.disabled ? 'Coming Soon' : ''} 
                  />
                </ListItem>
                {item.divider && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>
      
      {/* Asti Easter Egg */}
      <AstiEasterEgg open={astiEasterEggOpen} onClose={handleAstiEasterEggClose} />
    </AppBar>
  );
}; 