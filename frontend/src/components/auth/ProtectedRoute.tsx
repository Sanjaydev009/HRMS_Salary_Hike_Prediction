import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Box, Typography, Paper } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  allowedRoles 
}) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useSelector((state: RootState) => state.auth);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based access control
  if (requiredRole || allowedRoles) {
    const userRole = user?.role?.toLowerCase();
    
    // Check if user has required role
    if (requiredRole) {
      const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      const hasRequiredRole = requiredRoles.some(role => role.toLowerCase() === userRole);
      
      if (!hasRequiredRole) {
        // Check if admin should have access to all routes
        if (userRole === 'admin') {
          return <>{children}</>;
        }
        
        return (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minHeight="100vh"
            p={3}
          >
            <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
              <Typography variant="h5" color="error" gutterBottom>
                Access Denied
              </Typography>
              <Typography variant="body1" color="text.secondary">
                You don't have permission to access this page.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Required role: {Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your role: {user?.role}
              </Typography>
            </Paper>
          </Box>
        );
      }
    }

    // Check allowed roles
    if (allowedRoles && allowedRoles.length > 0) {
      const hasAllowedRole = allowedRoles.some(role => role.toLowerCase() === userRole);
      
      if (!hasAllowedRole) {
        return (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minHeight="100vh"
            p={3}
          >
            <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
              <Typography variant="h5" color="error" gutterBottom>
                Access Denied
              </Typography>
              <Typography variant="body1" color="text.secondary">
                You don't have permission to access this page.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Allowed roles: {allowedRoles.join(', ')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your role: {user?.role}
              </Typography>
            </Paper>
          </Box>
        );
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
