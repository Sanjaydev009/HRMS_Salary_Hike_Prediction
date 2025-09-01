import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Stack,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const NavigationTest: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const hrRoutes = [
    { path: '/dashboard', label: 'HR Dashboard' },
    { path: '/employees', label: 'All Employees' },
    { path: '/employees/new', label: 'Add New Employee' },
    { path: '/leaves', label: 'Leave Requests' },
    { path: '/leaves/calendar', label: 'Leave Calendar' },
    { path: '/payroll', label: 'Payroll Processing' },
    { path: '/payroll/payslips', label: 'Payslip Viewer' },
    { path: '/payroll/calculator', label: 'Salary Calculator' },
    { path: '/analytics', label: 'HR Analytics' },
    { path: '/profile', label: 'Profile' },
    { path: '/settings', label: 'Settings' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          🧪 Navigation Test Page
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Testing HR Dashboard navigation routes. Current user role: 
          <Chip 
            label={user?.role?.toUpperCase() || 'Unknown'} 
            color="primary" 
            size="small" 
            sx={{ ml: 1 }}
          />
        </Alert>

        <Stack spacing={2}>
          <Box>
            <Typography variant="h6">Current Location:</Typography>
            <Typography variant="body1" color="primary">
              {location.pathname}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" gutterBottom>
              Available HR Routes:
            </Typography>
            <Stack spacing={1}>
              {hrRoutes.map((route) => (
                <Button
                  key={route.path}
                  variant={location.pathname === route.path ? "contained" : "outlined"}
                  onClick={() => navigate(route.path)}
                  sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
                >
                  {route.label} → {route.path}
                </Button>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          User Information:
        </Typography>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '16px', 
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '12px'
        }}>
          {JSON.stringify(user, null, 2)}
        </pre>
      </Paper>
    </Box>
  );
};

export default NavigationTest;
