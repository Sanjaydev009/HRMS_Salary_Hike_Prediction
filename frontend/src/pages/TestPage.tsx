import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const TestPage: React.FC = () => {
  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        bgcolor: 'primary.main',
        color: 'white'
      }}
    >
      <Typography variant="h2" gutterBottom>
        🚀 HRMS Test Page
      </Typography>
      <Typography variant="h5" gutterBottom>
        The application is running successfully!
      </Typography>
      <Button 
        variant="contained" 
        size="large"
        sx={{ mt: 3, bgcolor: 'white', color: 'primary.main' }}
        onClick={() => window.location.href = '/login'}
      >
        Go to Login Page
      </Button>
    </Box>
  );
};

export default TestPage;
