import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Container,
  FormHelperText,
  LinearProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { validatePassword } from '@/services/passwordService';

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { token } = useParams<{ token: string }>();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = event.target.value;
    setPassword(newPassword);

    const validation = validatePassword(newPassword);
    setValidationErrors(validation.errors);
    setPasswordStrength(validation.strength);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const validation = validatePassword(password);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token!, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength >= 6) return 'success';
    if (passwordStrength >= 4) return 'warning';
    return 'error';
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength >= 6) return 'Strong';
    if (passwordStrength >= 4) return 'Medium';
    return 'Weak';
  };

  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Paper elevation={3}>
          <Box p={4}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Reset Password
            </Typography>

            {success ? (
              <Alert severity="success">
                Password reset successful! Redirecting to login...
              </Alert>
            ) : (
              <form onSubmit={handleSubmit}>
                <Box mb={3}>
                  <TextField
                    fullWidth
                    type="password"
                    label="New Password"
                    value={password}
                    onChange={handlePasswordChange}
                    error={validationErrors.length > 0}
                    disabled={loading}
                    aria-label="New password input"
                  />
                  {password && (
                    <>
                      <LinearProgress
                        variant="determinate"
                        value={(passwordStrength / 7) * 100}
                        color={getPasswordStrengthColor()}
                        sx={{ mt: 1 }}
                      />
                      <FormHelperText>
                        Password Strength: {getPasswordStrengthLabel()}
                      </FormHelperText>
                      {validationErrors.map((error, index) => (
                        <FormHelperText key={index} error>
                          {error}
                        </FormHelperText>
                      ))}
                    </>
                  )}
                </Box>

                <Box mb={3}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={password !== confirmPassword && confirmPassword !== ''}
                    helperText={
                      password !== confirmPassword && confirmPassword !== ''
                        ? 'Passwords do not match'
                        : ''
                    }
                    disabled={loading}
                    aria-label="Confirm password input"
                  />
                </Box>

                {error && (
                  <Box mb={3}>
                    <Alert severity="error">{error}</Alert>
                  </Box>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading || password !== confirmPassword}
                >
                  {loading ? <CircularProgress size={24} /> : 'Reset Password'}
                </Button>
              </form>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}; 