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
  Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to login';
      setError(message);
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, borderRadius: 2 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Sign In
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
            disabled={loading}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/forgot-password')}
            >
              Forgot password?
            </Link>
          </Box>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/register')}
            >
              Don't have an account? Sign Up
            </Link>
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

export default Login; 