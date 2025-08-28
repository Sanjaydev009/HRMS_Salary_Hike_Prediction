import React from 'react';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';

interface LoadingOverlayProps {
  loading: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  loading, 
  message = 'Loading...' 
}) => {
  if (!loading) return null;

  return (
    <Fade in={loading}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        <CircularProgress 
          size={60} 
          thickness={4}
          sx={{ 
            mb: 2,
            color: 'primary.main',
          }}
        />
        <Typography 
          variant="h6" 
          color="primary.main"
          sx={{ fontWeight: 500 }}
        >
          {message}
        </Typography>
      </Box>
    </Fade>
  );
};

export default LoadingOverlay;
