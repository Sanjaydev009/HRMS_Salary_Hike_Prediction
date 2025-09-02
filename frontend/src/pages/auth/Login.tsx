import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Avatar,
  CssBaseline,
  Grid,
  Link,
  Paper,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Fade,
  InputAdornment,
  IconButton,
  Divider,
  Zoom,
  Slide,
  useTheme,
  alpha,
  keyframes,
} from '@mui/material';
import { 
  LockOutlined, 
  EmailOutlined, 
  VisibilityOutlined, 
  VisibilityOffOutlined,
  PersonOutlined,
  BusinessOutlined,
  TrendingUpOutlined,
  SecurityOutlined,
  GroupOutlined,
  AnalyticsOutlined,
  LoginOutlined,
  StarOutlined,
  AutoAwesomeOutlined,
  SpeedOutlined,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../../store/store';
import { loginUser, clearError } from '../../store/slices/authSlice';

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  const { isLoading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string>('');

  // Animation keyframes
  const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  `;

  const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px ${alpha(theme.palette.primary.main, 0.3)}; }
    50% { box-shadow: 0 0 30px ${alpha(theme.palette.primary.main, 0.6)}; }
  `;

  const slideInFromLeft = keyframes`
    0% { 
      opacity: 0; 
      transform: translateX(-100px); 
    }
    100% { 
      opacity: 1; 
      transform: translateX(0); 
    }
  `;

  const scaleIn = keyframes`
    0% { 
      opacity: 0; 
      transform: scale(0.8); 
    }
    100% { 
      opacity: 1; 
      transform: scale(1); 
    }
  `;

  // Demo credentials with enhanced styling
  const demoCredentials = [
    {
      role: 'System Admin',
      email: 'sanju.admin@gmail.com',
      password: 'admin123',
      color: 'error',
      icon: <SecurityOutlined />,
      description: 'Full system access',
      gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
    },
    {
      role: 'HR Manager',
      email: 'hr.manager@gmail.com',
      password: 'hrmanager123',
      color: 'warning',
      icon: <GroupOutlined />,
      description: 'Employee management',
      gradient: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)',
    },
    {
      role: 'Employee',
      email: 'employee.dev@gmail.com',
      password: 'employee123',
      color: 'info',
      icon: <PersonOutlined />,
      description: 'Personal dashboard',
      gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
    },
  ];

  // Enhanced features with animations
  const features = [
    {
      icon: <PersonOutlined />,
      title: 'Employee Management',
      description: 'Complete lifecycle management with AI insights',
      color: '#4f46e5',
    },
    {
      icon: <BusinessOutlined />,
      title: 'Smart Leave System',
      description: 'Intelligent leave planning and approval',
      color: '#059669',
    },
    {
      icon: <TrendingUpOutlined />,
      title: 'AI-Powered Payroll',
      description: 'Automated calculations with ML predictions',
      color: '#dc2626',
    },
    {
      icon: <AnalyticsOutlined />,
      title: 'Advanced Analytics',
      description: 'Real-time insights and forecasting',
      color: '#7c2d12',
    },
  ];

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const validateForm = () => {
    const errors = { email: '', password: '' };
    let isValid = true;

    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleDemoLogin = (email: string, password: string) => {
    setFormData({ email, password });
    setSelectedDemo(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(loginUser(formData)).unwrap();
      console.log('✅ Login successful:', result);
    } catch (err) {
      console.error('❌ Login failed:', err);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', overflow: 'hidden' }}>
      <CssBaseline />
      
      {/* Left Side - Animated Branding */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: `
            linear-gradient(135deg, 
              ${alpha('#667eea', 0.9)} 0%, 
              ${alpha('#764ba2', 0.9)} 50%,
              ${alpha('#f093fb', 0.9)} 100%
            ),
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 0l30 30-30 30L0 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
          `,
          color: 'white',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 25% 25%, ${alpha('#ffffff', 0.1)} 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, ${alpha('#ffffff', 0.1)} 0%, transparent 50%)
            `,
            animation: `${float} 6s ease-in-out infinite`,
          },
        }}
      >
        <Box sx={{ zIndex: 1, textAlign: 'center', px: 4, maxWidth: 600 }}>
          {/* Animated Logo */}
          <Zoom in timeout={1000}>
            <Box
              sx={{
                display: 'inline-block',
                p: 3,
                borderRadius: '50%',
                background: alpha('#ffffff', 0.1),
                backdropFilter: 'blur(10px)',
                border: `2px solid ${alpha('#ffffff', 0.3)}`,
                mb: 4,
                animation: `${glow} 3s ease-in-out infinite`,
              }}
            >
              <AutoAwesomeOutlined sx={{ fontSize: 60, color: '#ffffff' }} />
            </Box>
          </Zoom>

          <Slide direction="up" in timeout={1200}>
            <Box>
              <Typography 
                variant="h1" 
                component="h1" 
                sx={{ 
                  fontWeight: 900, 
                  mb: 2, 
                  fontSize: { xs: '3rem', md: '4rem' },
                  background: 'linear-gradient(45deg, #fff 30%, #e0e7ff 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 30px rgba(255,255,255,0.5)',
                  animation: `${slideInFromLeft} 1s ease-out`,
                }}
              >
                HRMS
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  mb: 3, 
                  fontWeight: 300,
                  opacity: 0.95,
                  animation: `${slideInFromLeft} 1s ease-out 0.2s both`,
                }}
              >
                Next-Generation HR Platform
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 6, 
                  opacity: 0.85,
                  lineHeight: 1.7,
                  fontWeight: 400,
                  animation: `${slideInFromLeft} 1s ease-out 0.4s both`,
                }}
              >
                Revolutionize your workforce management with AI-powered insights, 
                seamless automation, and intelligent analytics.
              </Typography>
            </Box>
          </Slide>

          {/* Animated Features */}
          <Grid container spacing={3} sx={{ mt: 4 }}>
            {features.map((feature, index) => (
              <Grid item xs={6} key={index}>
                <Zoom in timeout={1500 + index * 200}>
                  <Card 
                    sx={{ 
                      bgcolor: alpha('#ffffff', 0.15), 
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${alpha('#ffffff', 0.2)}`,
                      color: 'white',
                      textAlign: 'center',
                      p: 2.5,
                      borderRadius: 3,
                      transition: 'all 0.3s ease-in-out',
                      cursor: 'pointer',
                      animation: `${scaleIn} 0.6s ease-out ${index * 0.1}s both`,
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        bgcolor: alpha('#ffffff', 0.25),
                        boxShadow: `0 20px 40px ${alpha(feature.color, 0.3)}`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: '16px !important' }}>
                      <Box 
                        sx={{ 
                          mb: 2, 
                          color: '#ffffff',
                          display: 'inline-flex',
                          p: 1.5,
                          borderRadius: '50%',
                          bgcolor: alpha(feature.color, 0.2),
                          border: `2px solid ${alpha('#ffffff', 0.3)}`,
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" sx={{ fontSize: '1rem', mb: 1, fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>

          {/* Floating Stats */}
          <Slide direction="up" in timeout={2000}>
            <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', gap: 4 }}>
              {[
                { label: 'Active Users', value: '10K+', icon: <GroupOutlined /> },
                { label: 'Success Rate', value: '99.9%', icon: <StarOutlined /> },
                { label: 'Processing Speed', value: '2x Faster', icon: <SpeedOutlined /> },
              ].map((stat, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    textAlign: 'center',
                    animation: `${float} 3s ease-in-out infinite ${index * 0.5}s`,
                  }}
                >
                  <Box sx={{ mb: 1, opacity: 0.8 }}>{stat.icon}</Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7, fontSize: '0.75rem' }}>
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Slide>
        </Box>
      </Box>

      {/* Right Side - Enhanced Login Form */}
      <Box
        sx={{
          flex: { xs: 1, lg: 0.8 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: '#fafbfc',
          background: `
            linear-gradient(135deg, #fafbfc 0%, #f1f5f9 100%),
            radial-gradient(circle at 80% 20%, ${alpha('#667eea', 0.1)} 0%, transparent 50%)
          `,
          p: 4,
          position: 'relative',
        }}
      >
        {/* Background Decorations */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${alpha('#667eea', 0.1)}, ${alpha('#764ba2', 0.1)})`,
            animation: `${float} 4s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '15%',
            left: '5%',
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${alpha('#f093fb', 0.1)}, ${alpha('#f5576c', 0.1)})`,
            animation: `${float} 5s ease-in-out infinite 1s`,
          }}
        />

        <Slide direction="left" in timeout={800}>
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: 500,
              p: 5,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha('#e2e8f0', 0.5)}`,
              boxShadow: `
                0 20px 40px ${alpha('#000000', 0.1)},
                0 0 0 1px ${alpha('#ffffff', 0.5)} inset
              `,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              },
            }}
          >
            {/* Header with Animation */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Zoom in timeout={1000}>
                <Avatar 
                  sx={{ 
                    m: '0 auto 24px', 
                    bgcolor: 'transparent',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    width: 80,
                    height: 80,
                    boxShadow: `0 8px 24px ${alpha('#667eea', 0.3)}`,
                  }}
                >
                  <LockOutlined sx={{ fontSize: 36 }} />
                </Avatar>
              </Zoom>
              
              <Fade in timeout={1200}>
                <Box>
                  <Typography 
                    component="h1" 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                    }}
                  >
                    Welcome Back
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ 
                      mb: 2,
                      fontWeight: 400,
                    }}
                  >
                    Sign in to access your intelligent HR dashboard
                  </Typography>
                </Box>
              </Fade>
            </Box>

            {error && (
              <Slide direction="down" in timeout={300}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 3,
                    bgcolor: alpha('#fee2e2', 0.8),
                    border: `1px solid ${alpha('#fecaca', 0.5)}`,
                  }}
                >
                  {error}
                </Alert>
              </Slide>
            )}

            {/* Enhanced Login Form */}
            <Fade in timeout={1400}>
              <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      bgcolor: alpha('#ffffff', 0.8),
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 20px ${alpha('#667eea', 0.1)}`,
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 20px ${alpha('#667eea', 0.2)}`,
                      },
                    },
                  }}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.1)',
                            },
                          }}
                        >
                          {showPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      bgcolor: alpha('#ffffff', 0.8),
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 20px ${alpha('#667eea', 0.1)}`,
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 20px ${alpha('#667eea', 0.2)}`,
                      },
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : <LoginOutlined />}
                  sx={{
                    py: 2,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: `0 8px 20px ${alpha('#667eea', 0.3)}`,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 12px 30px ${alpha('#667eea', 0.4)}`,
                      background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                    },
                    '&:active': {
                      transform: 'translateY(0px)',
                    },
                  }}
                >
                  {isLoading ? 'Signing In...' : 'Sign In Securely'}
                </Button>
              </Box>
            </Fade>

            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Link 
                component="button"
                type="button"
                variant="body2" 
                onClick={() => navigate('/forgot-password')}
                sx={{ 
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 500,
                  transition: 'all 0.2s ease-in-out',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                Forgot your password?
              </Link>
            </Box>

            <Divider sx={{ mb: 4 }}>
              <Chip 
                label="🚀 Quick Demo Access" 
                size="medium"
                sx={{
                  bgcolor: alpha('#667eea', 0.1),
                  color: 'primary.main',
                  fontWeight: 600,
                  px: 2,
                }}
              />
            </Divider>

            {/* Enhanced Demo Credentials */}
            <Fade in timeout={1800}>
              <Box>
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ mb: 3, textAlign: 'center', fontWeight: 500 }}
                >
                  Experience the platform with demo accounts:
                </Typography>
                <Grid container spacing={2}>
                  {demoCredentials.map((demo, index) => (
                    <Grid item xs={12} key={index}>
                      <Zoom in timeout={2000 + index * 200}>
                        <Button
                          fullWidth
                          variant={selectedDemo === demo.email ? 'contained' : 'outlined'}
                          size="large"
                          startIcon={demo.icon}
                          onClick={() => handleDemoLogin(demo.email, demo.password)}
                          sx={{
                            justifyContent: 'flex-start',
                            textTransform: 'none',
                            borderRadius: 3,
                            py: 2,
                            px: 3,
                            transition: 'all 0.3s ease-in-out',
                            background: selectedDemo === demo.email 
                              ? demo.gradient 
                              : 'transparent',
                            borderColor: alpha(demo.gradient.match(/#[0-9a-fA-F]{6}/)?.[0] || '#666', 0.3),
                            '&:hover': {
                              transform: 'translateY(-3px) scale(1.02)',
                              boxShadow: `0 10px 25px ${alpha(demo.gradient.match(/#[0-9a-fA-F]{6}/)?.[0] || '#666', 0.2)}`,
                              background: demo.gradient,
                              color: 'white',
                            },
                          }}
                        >
                          <Box sx={{ textAlign: 'left', flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                              {demo.role}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                              {demo.email}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              {demo.description}
                            </Typography>
                          </Box>
                        </Button>
                      </Zoom>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Fade>
          </Paper>
        </Slide>
      </Box>
    </Box>
  );
};

export default Login;
