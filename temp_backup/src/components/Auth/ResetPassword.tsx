import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Paper, 
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the reset token from URL query parameters
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Please enter a new password');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Call an API to reset password with token
      const response = await fetch('/api/auth/set-new-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      
      if (!response.ok) {
        throw new Error('Failed to reset password. The link may have expired.');
      }
      
      setSuccess(true);
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError('');
  };
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, borderRadius: 2 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Set New Password
        </Typography>
        
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 2 }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="password"
            label="New Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="confirmPassword"
            label="Confirm Password"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Reset Password'}
          </Button>
          
          {success && (
            <Typography color="success.main" align="center" sx={{ mt: 2 }}>
              Password reset successfully! Redirecting to login...
            </Typography>
          )}
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              onClick={() => navigate('/login')}
              color="primary"
              sx={{ textTransform: 'none' }}
            >
              Back to Login
            </Button>
          </Box>
        </Box>
      </Paper>
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ResetPassword; 