import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Stack,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  EventNote as EventNoteIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  CalendarMonth,
  RequestPage,
  Receipt,
  MonetizationOn,
  Analytics,
  Support,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactElement;
  path: string;
  color: string;
  category: 'primary' | 'secondary' | 'management';
}

const EmployeeQuickActions: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const primaryActions: QuickAction[] = [
    {
      title: 'Today\'s Attendance',
      description: 'Check in/out, view today\'s attendance status',
      icon: <ScheduleIcon />,
      path: '/employee/today-attendance',
      color: '#2196f3',
      category: 'primary',
    },
    {
      title: 'Certifications & Skills',
      description: 'Manage your professional certifications',
      icon: <SchoolIcon />,
      path: '/employee/my-certifications',
      color: '#9c27b0',
      category: 'primary',
    },
    {
      title: 'Leave Balance',
      description: 'View and manage your leave balances',
      icon: <EventNoteIcon />,
      path: '/employee/my-leave-balance',
      color: '#4caf50',
      category: 'primary',
    },
    {
      title: 'Apply for Leave',
      description: 'Submit new leave applications',
      icon: <RequestPage />,
      path: '/employee/leave/apply',
      color: '#ff9800',
      category: 'primary',
    },
  ];

  const secondaryActions: QuickAction[] = [
    {
      title: 'My Profile',
      description: 'Update your personal information',
      icon: <PersonIcon />,
      path: '/employee/profile',
      color: '#00bcd4',
      category: 'secondary',
    },
    {
      title: 'Payroll & Salary',
      description: 'View payslips and salary information',
      icon: <PaymentIcon />,
      path: '/employee/payroll',
      color: '#795548',
      category: 'secondary',
    },
    {
      title: 'Salary Prediction',
      description: 'AI-powered salary growth predictions',
      icon: <TrendingUpIcon />,
      path: '/salary-prediction',
      color: '#e91e63',
      category: 'secondary',
    },
    
  ];

  const managementActions: QuickAction[] = [
    {
      title: 'Leave Calendar',
      description: 'View team leave calendar',
      icon: <CalendarMonth />,
      path: '/employee/leave-calendar',
      color: '#3f51b5',
      category: 'management',
    },
    {
      title: 'Company Holidays',
      description: 'View upcoming company holidays',
      icon: <EventNoteIcon />,
      path: '/employee/holidays',
      color: '#ff5722',
      category: 'management',
    },
    {
      title: 'Support & Help',
      description: 'Get help and submit support tickets',
      icon: <Support />,
      path: '/employee/support',
      color: '#009688',
      category: 'management',
    },
    
  ];

  const renderActionCard = (action: QuickAction) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={action.title}>
      <Card 
        elevation={2}
        sx={{ 
          height: '100%',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            elevation: 6,
            transform: 'translateY(-4px)',
            borderColor: action.color,
          },
        }}
        onClick={() => navigate(action.path)}
      >
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          <Avatar
            sx={{
              bgcolor: `${action.color}20`,
              color: action.color,
              width: 60,
              height: 60,
              mx: 'auto',
              mb: 2,
            }}
          >
            {action.icon}
          </Avatar>
          <Typography variant="h6" gutterBottom>
            {action.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {action.description}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h4" gutterBottom>
          Employee Quick Actions
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Welcome {user?.profile?.firstName}! Access all your essential tools and features here.
        </Typography>
      </Paper>

      {/* Navigation to Dashboard */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/dashboard')}
          startIcon={<TrendingUpIcon />}
        >
          ← Back to Dashboard
        </Button>
      </Box>

      {/* Primary Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon color="primary" />
          Daily Essentials
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Your most frequently used tools and actions
        </Typography>
        <Grid container spacing={3}>
          {primaryActions.map(renderActionCard)}
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Secondary Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon color="secondary" />
          Personal Management
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Manage your profile, salary, and career development
        </Typography>
        <Grid container spacing={3}>
          {secondaryActions.map(renderActionCard)}
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Management Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Analytics color="info" />
          Resources & Support
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Additional resources and company information
        </Typography>
        <Grid container spacing={3}>
          {managementActions.map(renderActionCard)}
        </Grid>
      </Box>

      {/* Quick Stats */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Stats Overview
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary">
                4
              </Typography>
              <Typography variant="caption">
                Actions Today
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="success.main">
                98%
              </Typography>
              <Typography variant="caption">
                Attendance Rate
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="warning.main">
                15
              </Typography>
              <Typography variant="caption">
                Leave Days Left
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="info.main">
                3
              </Typography>
              <Typography variant="caption">
                Certifications
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default EmployeeQuickActions;
