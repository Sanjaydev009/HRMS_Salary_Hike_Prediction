import React from 'react';
import { Box, Typography } from '@mui/material';

const Profile: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Profile management coming soon...
      </Typography>
    </Box>
  );
};

export default Profile;
