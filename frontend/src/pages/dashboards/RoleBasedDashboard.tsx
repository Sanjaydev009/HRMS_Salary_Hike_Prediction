import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import EmployeeDashboard from './EmployeeDashboard';
import HRDashboard from './HRDashboard';
import AdminDashboard from './AdminDashboard';
import { Box, Alert, CircularProgress } from '@mui/material';

const RoleBasedDashboard: React.FC = () => {
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !user.role) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Unable to determine user role. Please log in again.
      </Alert>
    );
  }

  // Route to appropriate dashboard based on user role
  const role = user.role.toLowerCase();
  
  switch (role) {
    case 'employee':
      return <EmployeeDashboard />;
    case 'hr':
      return <HRDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return (
        <Alert severity="warning" sx={{ m: 2 }}>
          Unknown user role: {user.role}. Please contact system administrator.
        </Alert>
      );
  }
};

export default RoleBasedDashboard;
