import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  InputAdornment
} from '@mui/material';
import {
  Email,
  ArrowBack,
  Send
} from '@mui/icons-material';
import axios from 'axios';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/forgot-password', {
        email: email.toLowerCase().trim()
      });

      if (response.data.success) {
        setSuccess(
          'Password reset link has been sent to your email address. Please check your inbox and follow the instructions.'
        );
        setEmail('');
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      setError(
        error.response?.data?.message || 
        'Failed to send reset email. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Email sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Forgot Password?
            </Typography>
            <Typography color="text.secondary">
              Enter your email address and we'll send you a link to reset your password
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success ? (
            <Box sx={{ textAlign: 'center' }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Didn't receive the email? Check your spam folder or try again.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSuccess('');
                    setEmail('');
                  }}
                >
                  Try Again
                </Button>
                <Button
                  variant="contained"
                  component={Link}
                  to="/login"
                  startIcon={<ArrowBack />}
                >
                  Back to Login
                </Button>
              </Box>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                name="email"
                label="Email Address"
                type="email"
                value={email}
                onChange={handleChange}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  )
                }}
                placeholder="Enter your registered email address"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !email || !validateEmail(email)}
                sx={{ mb: 2 }}
                startIcon={loading ? <CircularProgress size={20} /> : <Send />}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <Button
                fullWidth
                variant="text"
                component={Link}
                to="/login"
                disabled={loading}
                startIcon={<ArrowBack />}
              >
                Back to Login
              </Button>
            </Box>
          )}

          <Box sx={{ mt: 4, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Security Notice:</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              • Reset links expire in 15 minutes for security<br />
              • Check your spam/junk folder if you don't see the email<br />
              • Contact HR support if you continue having issues
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ForgotPassword;
