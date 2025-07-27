import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
} from '@mui/material';
import {
  People,
  EventAvailable,
  Payment,
  TrendingUp,
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
  // Placeholder stats - will be connected to real data later
  const stats = [
    {
      title: 'Total Employees',
      value: '0',
      icon: <People fontSize="large" />,
      color: '#1976d2',
    },
    {
      title: 'Pending Leaves',
      value: '0',
      icon: <EventAvailable fontSize="large" />,
      color: '#ed6c02',
    },
    {
      title: 'Monthly Payroll',
      value: '$0',
      icon: <Payment fontSize="large" />,
      color: '#2e7d32',
    },
    {
      title: 'Performance Score',
      value: '0%',
      icon: <TrendingUp fontSize="large" />,
      color: '#9c27b0',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome to your HRMS dashboard. Here's an overview of your HR metrics.
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h5" component="div">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Placeholder for charts and recent activities */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <Typography color="text.secondary">
              No recent activities to display.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Typography color="text.secondary">
              Quick action shortcuts will be available here.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
