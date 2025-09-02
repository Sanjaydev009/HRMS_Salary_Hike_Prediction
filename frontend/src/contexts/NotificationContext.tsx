import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Alert, Snackbar, Box } from '@mui/material';
import { CheckCircle, Error as ErrorIcon, Warning, Info } from '@mui/icons-material';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

  const showNotification = (notification: Omit<Notification, 'id'>) => {
    const id = generateId();
    const newNotification = { ...notification, id, duration: notification.duration || 5000 };
    
    setNotifications(prev => [...prev, newNotification]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, newNotification.duration);
  };

  const showSuccess = (title: string, message?: string) => {
    showNotification({ type: 'success', title, message });
  };

  const showError = (title: string, message?: string) => {
    showNotification({ type: 'error', title, message });
  };

  const showWarning = (title: string, message?: string) => {
    showNotification({ type: 'warning', title, message });
  };

  const showInfo = (title: string, message?: string) => {
    showNotification({ type: 'info', title, message });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle fontSize="small" />;
      case 'error': return <ErrorIcon fontSize="small" />;
      case 'warning': return <Warning fontSize="small" />;
      case 'info': return <Info fontSize="small" />;
      default: return <Info fontSize="small" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'success': return '#d4edda';
      case 'error': return '#f8d7da';
      case 'warning': return '#fff3cd';
      case 'info': return '#d1ecf1';
      default: return '#d1ecf1';
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'success': return '#c3e6cb';
      case 'error': return '#f5c6cb';
      case 'warning': return '#ffeaa7';
      case 'info': return '#bee5eb';
      default: return '#bee5eb';
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'success': return '#155724';
      case 'error': return '#721c24';
      case 'warning': return '#856404';
      case 'info': return '#0c5460';
      default: return '#0c5460';
    }
  };

  return (
    <NotificationContext.Provider 
      value={{ showNotification, showSuccess, showError, showWarning, showInfo }}
    >
      {children}
      
      {/* Bootstrap-style notifications container */}
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          maxWidth: 400,
        }}
      >
        {notifications.map((notification) => (
          <Box
            key={notification.id}
            sx={{
              backgroundColor: getColor(notification.type),
              border: `1px solid ${getBorderColor(notification.type)}`,
              borderRadius: '0.375rem',
              padding: '0.75rem 1rem',
              color: getTextColor(notification.type),
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
              animation: 'slideInRight 0.3s ease-out',
              '@keyframes slideInRight': {
                from: {
                  transform: 'translateX(100%)',
                  opacity: 0,
                },
                to: {
                  transform: 'translateX(0)',
                  opacity: 1,
                },
              },
            }}
          >
            <Box sx={{ color: getTextColor(notification.type), mt: 0.1 }}>
              {getIcon(notification.type)}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ fontWeight: 600, marginBottom: notification.message ? 0.5 : 0 }}>
                {notification.title}
              </Box>
              {notification.message && (
                <Box sx={{ fontSize: '0.8rem', opacity: 0.9 }}>
                  {notification.message}
                </Box>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </NotificationContext.Provider>
  );
};
