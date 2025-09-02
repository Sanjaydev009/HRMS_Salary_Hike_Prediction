import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Divider } from '@mui/material';
import { RootState } from '../../store/store';

const AppDebugInfo: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, isLoading, error, token } = useSelector(
    (state: RootState) => state.auth
  );

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        🔍 App Debug Information
      </Typography>
      
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Route Information
          </Typography>
          <Typography variant="body2">
            <strong>Current Path:</strong> {location.pathname}
          </Typography>
          <Typography variant="body2">
            <strong>Search:</strong> {location.search || 'None'}
          </Typography>
          <Typography variant="body2">
            <strong>Hash:</strong> {location.hash || 'None'}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Authentication State
          </Typography>
          <Typography variant="body2">
            <strong>Is Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}
          </Typography>
          <Typography variant="body2">
            <strong>Is Loading:</strong> {isLoading ? '⏳ Yes' : '✅ No'}
          </Typography>
          <Typography variant="body2">
            <strong>Has Token:</strong> {token ? '✅ Yes' : '❌ No'}
          </Typography>
          <Typography variant="body2">
            <strong>Token (first 20 chars):</strong> {token ? `${token.substring(0, 20)}...` : 'None'}
          </Typography>
          <Typography variant="body2">
            <strong>Error:</strong> {error ? `❌ ${error}` : '✅ None'}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            User Information
          </Typography>
          {user ? (
            <>
              <Typography variant="body2">
                <strong>User ID:</strong> {user.id || 'Not set'}
              </Typography>
              <Typography variant="body2">
                <strong>Employee ID:</strong> {user.employeeId || 'Not set'}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {user.email || 'Not set'}
              </Typography>
              <Typography variant="body2">
                <strong>Role:</strong> {user.role || 'Not set'}
              </Typography>
              <Typography variant="body2">
                <strong>First Name:</strong> {user.profile?.firstName || 'Not set'}
              </Typography>
              <Typography variant="body2">
                <strong>Last Name:</strong> {user.profile?.lastName || 'Not set'}
              </Typography>
              <Typography variant="body2">
                <strong>Department:</strong> {user.jobDetails?.department || 'Not set'}
              </Typography>
              <Typography variant="body2">
                <strong>Designation:</strong> {user.jobDetails?.designation || 'Not set'}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="error">
              ❌ No user data available
            </Typography>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Local Storage Information
          </Typography>
          <Typography variant="body2">
            <strong>Token in localStorage:</strong> {localStorage.getItem('token') ? '✅ Yes' : '❌ No'}
          </Typography>
          <Typography variant="body2">
            <strong>Other keys in localStorage:</strong> {Object.keys(localStorage).join(', ') || 'None'}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AppDebugInfo;
