import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const TestLogin: React.FC = () => {
  console.log('🔐 TestLogin component rendering');
  
  return (
    <Box sx={{ 
      p: 4, 
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      bgcolor: '#f5f5f5'
    }}>
      <Typography variant="h3" gutterBottom color="primary">
        🔐 Test Login Page
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        This is a minimal test login page to verify routing works.
      </Typography>
      <Button 
        variant="contained" 
        size="large"
        onClick={() => {
          alert('Login button clicked! Routing is working.');
          console.log('Login button clicked');
        }}
      >
        Test Login Button
      </Button>
      <Typography variant="caption" sx={{ mt: 2 }}>
        Current URL: {window.location.href}
      </Typography>
    </Box>
  );
};

export default TestLogin;
