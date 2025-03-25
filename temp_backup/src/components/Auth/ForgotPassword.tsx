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
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Call the resetPassword function from AuthContext
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError('');
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, borderRadius: 2 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Reset Password
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
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Send Reset Link'}
          </Button>
          
          {success && (
            <Typography color="success.main" align="center" sx={{ mt: 2 }}>
              Password reset instructions sent to your email
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

export default ForgotPassword; 