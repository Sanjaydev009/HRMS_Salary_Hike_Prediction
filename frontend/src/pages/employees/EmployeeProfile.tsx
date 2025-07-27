import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const EmployeeProfile: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Employee Profile
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Employee profile details will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default EmployeeProfile;
