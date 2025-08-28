import React from 'react';
import { Snackbar, Alert, AlertTitle, Slide, SlideProps } from '@mui/material';

interface NotificationProps {
  open: boolean;
  onClose: () => void;
  severity: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  autoHideDuration?: number;
}

const SlideTransition = (props: SlideProps) => {
  return <Slide {...props} direction="down" />;
};

const Notification: React.FC<NotificationProps> = ({
  open,
  onClose,
  severity,
  title,
  message,
  autoHideDuration = 6000,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ mt: 8 }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{
          minWidth: '300px',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
          borderRadius: 2,
        }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
