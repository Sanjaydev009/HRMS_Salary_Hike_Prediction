import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Grid,
  Link,
} from '@mui/material';
import { authAPI } from '../../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Try to authenticate with the backend API
      try {
        const response = await authAPI.login({ email, password });
        if (response.success) {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('token', response.token);
          localStorage.setItem('userRole', response.user.role);
          localStorage.setItem('userName', response.user.name);
          window.location.href = '/dashboard';
          return;
        }
      } catch (apiError) {
        console.log('API login failed, using demo mode:', apiError);
      }

      // Fallback to demo mode if API fails
      setTimeout(() => {
        setLoading(false);
        // For demo purposes
        if (email === 'hr@company.com' && password === 'password123') {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userRole', 'hr');
          localStorage.setItem('userName', 'HR Manager');
          window.location.href = '/dashboard';
        } else if (email === 'employee@company.com' && password === 'password123') {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userRole', 'employee');
          localStorage.setItem('userName', 'John Employee');
          window.location.href = '/dashboard';
        } else {
          setError('Invalid credentials. Try hr@company.com / password123 or employee@company.com / password123');
        }
      }, 1000);
    } catch (err) {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography component="h1" variant="h4" gutterBottom>
              HRMS Login
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Welcome to Human Resource Management System
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
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
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="#" variant="body2">
                    {"Don't have an account? Contact HR"}
                  </Link>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Typography variant="caption" color="text.secondary" align="center">
                Demo Credentials:
                <br />
                HR: hr@company.com / password123
                <br />
                Employee: employee@company.com / password123
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
