import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Analytics: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Analytics Dashboard
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Analytics and reporting dashboard will be implemented here.
          This will include performance metrics, salary trends, and ML insights.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Analytics;
