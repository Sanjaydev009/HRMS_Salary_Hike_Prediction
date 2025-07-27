import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const AdminPanel: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Panel
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Admin panel will be implemented here.
          This will include user management, system settings, and configuration.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AdminPanel;
