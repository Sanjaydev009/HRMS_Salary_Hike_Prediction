import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, CssBaseline, Box, Typography } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store/store';
import theme from './theme/theme';

// Simple working app component
const SimpleApp = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: 'white',
          textAlign: 'center',
          p: 4
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          🎉 HRMS Application
        </Typography>
        <Typography variant="h5" gutterBottom>
          ✅ React + Material-UI Working
        </Typography>
        <Typography variant="body1">
          Server running on port 5174
        </Typography>
        <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
          {new Date().toLocaleString()}
        </Typography>
      </Box>
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <SimpleApp />
    </Provider>
  </React.StrictMode>
);
