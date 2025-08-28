import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Card, CardContent, Typography, Box } from '@mui/material';

const UserDebug: React.FC = () => {
  const { user, isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  return (
    <Card sx={{ position: 'fixed', top: 10, right: 10, zIndex: 9999, minWidth: 300 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Debug Info
        </Typography>
        <Box>
          <Typography variant="body2">
            <strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
          </Typography>
          <Typography variant="body2">
            <strong>Has Token:</strong> {token ? 'Yes' : 'No'}
          </Typography>
          <Typography variant="body2">
            <strong>User Object:</strong> {user ? 'Present' : 'Null'}
          </Typography>
          {user && (
            <>
              <Typography variant="body2">
                <strong>User Role:</strong> {user.role || 'undefined'}
              </Typography>
              <Typography variant="body2">
                <strong>User Email:</strong> {user.email || 'undefined'}
              </Typography>
              <Typography variant="body2">
                <strong>User Name:</strong> {user.profile?.firstName} {user.profile?.lastName}
              </Typography>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserDebug;
