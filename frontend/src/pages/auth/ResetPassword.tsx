import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Security
} from '@mui/icons-material';
import axios from 'axios';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return 'Password must contain at least one special character (@$!%*?&)';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/reset-password', {
        token,
        newPassword: formData.newPassword
      });

      if (response.data.success) {
        setSuccess('Password reset successfully! Redirecting to login...');
        
        // Store token if provided for automatic login
        if (response.data.data?.token) {
          localStorage.setItem('token', response.data.data.token);
        }

        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Password reset successfully. You can now login with your new password.',
              type: 'success'
            }
          });
        }, 2000);
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(
        error.response?.data?.message || 
        'Failed to reset password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[@$!%*?&])/.test(password)) strength++;

    return strength;
  };

  const getPasswordStrengthLabel = (strength: number) => {
    switch (strength) {
      case 0:
      case 1:
        return { label: 'Very Weak', color: '#f44336' };
      case 2:
        return { label: 'Weak', color: '#ff9800' };
      case 3:
        return { label: 'Fair', color: '#ffeb3b' };
      case 4:
        return { label: 'Good', color: '#4caf50' };
      case 5:
        return { label: 'Strong', color: '#2196f3' };
      default:
        return { label: '', color: '#ddd' };
    }
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);
  const strengthInfo = getPasswordStrengthLabel(passwordStrength);

  if (!token) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Security sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Invalid Reset Link
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              This password reset link is invalid or has expired.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/forgot-password')}
            >
              Request New Reset Link
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Lock sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Reset Password
            </Typography>
            <Typography color="text.secondary">
              Create a new secure password for your account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              name="newPassword"
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            {formData.newPassword && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      flexGrow: 1,
                      height: 4,
                      backgroundColor: '#ddd',
                      borderRadius: 2,
                      overflow: 'hidden',
                      mr: 2
                    }}
                  >
                    <Box
                      sx={{
                        width: `${(passwordStrength / 5) * 100}%`,
                        height: '100%',
                        backgroundColor: strengthInfo.color,
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ color: strengthInfo.color, fontWeight: 'bold' }}
                  >
                    {strengthInfo.label}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Password must contain at least 6 characters with uppercase, lowercase, number, and special character
                </Typography>
              </Box>
            )}

            <TextField
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              error={
                formData.confirmPassword.length > 0 &&
                formData.newPassword !== formData.confirmPassword
              }
              helperText={
                formData.confirmPassword.length > 0 &&
                formData.newPassword !== formData.confirmPassword
                  ? 'Passwords do not match'
                  : ''
              }
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={
                loading ||
                !formData.newPassword ||
                !formData.confirmPassword ||
                formData.newPassword !== formData.confirmPassword ||
                passwordStrength < 3
              }
              sx={{ mb: 2 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Reset Password'
              )}
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/login')}
              disabled={loading}
            >
              Back to Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ResetPassword;
