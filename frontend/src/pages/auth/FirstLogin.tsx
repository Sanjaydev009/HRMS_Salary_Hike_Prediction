import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Security,
  CheckCircle
} from '@mui/icons-material';
import axios from 'axios';

interface FirstLoginProps {
  onPasswordChanged: () => void;
}

const FirstLogin: React.FC<FirstLoginProps> = ({ onPasswordChanged }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);

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
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/auth/first-login', {
        newPassword: formData.newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSuccessDialog(true);
      }
    } catch (error: any) {
      console.error('First login password change error:', error);
      setError(
        error.response?.data?.message || 
        'Failed to update password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessDialog(false);
    onPasswordChanged();
    navigate('/dashboard');
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

  return (
    <>
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Security sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom>
                Welcome to HRMS!
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                For security reasons, you must change your temporary password
              </Typography>
              <Alert severity="warning" sx={{ mt: 2 }}>
                This is your first login. Please create a secure password to continue.
              </Alert>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
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
                  'Set New Password'
                )}
              </Button>
            </Box>

            <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Password Requirements:</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • At least 6 characters long<br />
                • Contains uppercase and lowercase letters<br />
                • Contains at least one number<br />
                • Contains at least one special character (@$!%*?&)
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Success Dialog */}
      <Dialog open={successDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
          <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h5">
            Password Updated Successfully!
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Typography color="text.secondary">
            Your password has been updated successfully. You can now access all HRMS features.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            onClick={handleSuccessClose}
            size="large"
          >
            Continue to Dashboard
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FirstLogin;
