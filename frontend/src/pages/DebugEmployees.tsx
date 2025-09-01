import React from 'react';
import { Box, Typography } from '@mui/material';

const DebugEmployees: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Debug Employees
      </Typography>
      <Typography variant="body1">
        This is a debug page for employee management.
      </Typography>
    </Box>
  );
};

export default DebugEmployees;