import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

const TestHome = () => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <Typography variant="h4" gutterBottom>
      HRMS Test Page - Working!
    </Typography>
    <Typography variant="body1" color="text.secondary">
      If you can see this, the React app is rendering properly.
    </Typography>
    <Button 
      variant="contained" 
      href="/login" 
      sx={{ mt: 2 }}
    >
      Go to Login
    </Button>
  </Box>
);

const TestApp: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TestHome />} />
        <Route path="*" element={<TestHome />} />
      </Routes>
    </Router>
  );
};

export default TestApp;
