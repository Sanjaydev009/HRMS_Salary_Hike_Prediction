import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Typography, Button } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store/store';
import theme from './theme/theme';

// Simple Login placeholder
const SimpleLogin = () => {
  console.log('🔐 Simple Login rendering');
  return (
    <Box sx={{ 
      p: 4, 
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Typography variant="h3" gutterBottom>
        🔐 Login Page
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        This is a simplified login page for testing.
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => window.location.href = '/dashboard'}
      >
        Go to Dashboard (Test)
      </Button>
    </Box>
  );
};

// Simple Dashboard placeholder
const SimpleDashboard = () => {
  console.log('📊 Simple Dashboard rendering');
  return (
    <Box sx={{ 
      p: 4, 
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Typography variant="h3" gutterBottom>
        📊 Dashboard
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        This is a simplified dashboard for testing.
      </Typography>
      <Button 
        variant="outlined" 
        onClick={() => window.location.href = '/login'}
      >
        Back to Login
      </Button>
    </Box>
  );
};

function SimpleApp() {
  console.log('🚀 SimpleApp component is rendering');
  
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={(() => {
              console.log('🔐 Rendering Login route');
              return <SimpleLogin />;
            })()} />
            
            {/* Dashboard Route */}
            <Route path="/dashboard" element={(() => {
              console.log('📊 Rendering Dashboard route');
              return <SimpleDashboard />;
            })()} />
            
            {/* Root redirect */}
            <Route path="/" element={(() => {
              console.log('🏠 Rendering root route, redirecting to login');
              return <Navigate to="/login" replace />;
            })()} />
            
            {/* Fallback Route */}
            <Route path="*" element={(() => {
              console.log('❓ Rendering fallback route');
              return (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h4">Page Not Found</Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => window.location.href = '/login'}
                    sx={{ mt: 2 }}
                  >
                    Go to Login
                  </Button>
                </Box>
              );
            })()} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default SimpleApp;
