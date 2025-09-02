import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const TestDashboard: React.FC = () => {
  console.log('📊 TestDashboard component rendering');
  
  return (
    <Box sx={{ 
      p: 4, 
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      bgcolor: '#f0f8ff'
    }}>
      <Typography variant="h3" gutterBottom color="primary">
        📊 Test Dashboard
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        This is a minimal test dashboard to verify navigation works.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          onClick={() => window.location.href = '/login'}
        >
          Go to Login
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => window.location.href = '/debug'}
        >
          Go to Debug
        </Button>
      </Box>
      <Typography variant="caption" sx={{ mt: 2 }}>
        Current URL: {window.location.href}
      </Typography>
    </Box>
  );
};

export default TestDashboard;
