import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Paper,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  AccessTime,
  EventAvailable,
  Payment,
  TrendingUp,
  Notifications,
  Schedule,
  CheckCircle,
  Warning,
  Info,
  ChevronRight,
  Today,
  CalendarMonth,
  AttachMoney,
  Assessment,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store/store';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactElement;
  path: string;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'leave' | 'attendance' | 'payroll' | 'performance';
  title: string;
  description: string;
  date: string;
  status?: 'success' | 'warning' | 'info' | 'error';
}

interface DashboardStats {
  attendanceToday: boolean;
  totalLeaveDays: number;
  usedLeaveDays: number;
  currentSalary: number;
  performanceScore: number;
}

const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [stats, setStats] = useState<DashboardStats>({
    attendanceToday: true,
    totalLeaveDays: 30,
    usedLeaveDays: 8,
    currentSalary: 75000,
    performanceScore: 85,
  });

  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'leave',
      title: 'Leave Request Approved',
      description: 'Your vacation leave for Jan 15-17 has been approved',
      date: '2 hours ago',
      status: 'success',
    },
    {
      id: '2',
      type: 'attendance',
      title: 'Attendance Recorded',
      description: 'Check-in at 9:00 AM',
      date: 'Today',
      status: 'info',
    },
    {
      id: '3',
      type: 'payroll',
      title: 'Payslip Generated',
      description: 'December 2024 payslip is ready for download',
      date: '1 day ago',
      status: 'info',
    },
    {
      id: '4',
      type: 'performance',
      title: 'Performance Review',
      description: 'Q4 2024 performance review completed',
      date: '3 days ago',
      status: 'success',
    },
  ]);

  const quickActions: QuickAction[] = [
    {
      title: 'Apply for Leave',
      description: 'Submit a new leave request',
      icon: <EventAvailable />,
      path: '/employee/leave/apply',
      color: '#2196f3',
    },
    {
      title: 'Mark Attendance',
      description: 'Check-in or check-out',
      icon: <AccessTime />,
      path: '/employee/attendance',
      color: '#4caf50',
    },
    {
      title: 'View Payslip',
      description: 'Download latest payslip',
      icon: <Payment />,
      path: '/employee/payslips',
      color: '#ff9800',
    },
    {
      title: 'Performance',
      description: 'View performance metrics',
      icon: <TrendingUp />,
      path: '/employee/performance',
      color: '#9c27b0',
    },
  ];

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'error':
        return <Warning color="error" />;
      default:
        return <Info color="info" />;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Section */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Grid container alignItems="center" spacing={3}>
          <Grid item>
            <Avatar
              sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)' }}
              src={user?.profile?.profilePicture}
            >
              {user?.profile?.firstName?.[0]}{user?.profile?.lastName?.[0]}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" gutterBottom>
              {getGreeting()}, {user?.profile?.firstName}!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {user?.jobDetails?.designation || 'Employee'} • {user?.jobDetails?.department || 'Department'}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip 
                label={`Employee ID: ${user?.employeeId}`} 
                size="small" 
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <Chip 
                label={stats.attendanceToday ? 'Present Today' : 'Not Checked In'} 
                size="small" 
                sx={{ 
                  bgcolor: stats.attendanceToday ? 'rgba(76,175,80,0.8)' : 'rgba(244,67,54,0.8)', 
                  color: 'white' 
                }}
              />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AccessTime sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
                  <Typography variant="h6">
                    {stats.attendanceToday ? 'Present' : 'Absent'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today's Status
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <EventAvailable sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                  <Typography variant="h6">
                    {stats.totalLeaveDays - stats.usedLeaveDays}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Leave Balance
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Payment sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
                  <Typography variant="h6">
                    ${stats.currentSalary.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Salary
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUp sx={{ fontSize: 40, color: '#9c27b0', mb: 1 }} />
                  <Typography variant="h6">
                    {stats.performanceScore}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Performance
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid item xs={6} md={3} key={index}>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{
                        p: 2,
                        height: '100%',
                        flexDirection: 'column',
                        borderColor: action.color,
                        color: action.color,
                        '&:hover': {
                          bgcolor: `${action.color}10`,
                          borderColor: action.color,
                        },
                      }}
                      onClick={() => navigate(action.path)}
                    >
                      <Box sx={{ color: action.color, mb: 1 }}>
                        {action.icon}
                      </Box>
                      <Typography variant="subtitle2" textAlign="center">
                        {action.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" textAlign="center">
                        {action.description}
                      </Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Leave Balance Progress */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Leave Balance Overview
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">
                    Used: {stats.usedLeaveDays} / {stats.totalLeaveDays} days
                  </Typography>
                  <Typography variant="body2" color="primary">
                    {((stats.totalLeaveDays - stats.usedLeaveDays) / stats.totalLeaveDays * 100).toFixed(0)}% remaining
                  </Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={(stats.usedLeaveDays / stats.totalLeaveDays) * 100}
                  sx={{ mt: 1, height: 8, borderRadius: 4 }}
                />
              </Box>
              <Button 
                variant="text" 
                endIcon={<ChevronRight />}
                onClick={() => navigate('/employee/leave/balance')}
              >
                View Detailed Balance
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              <List>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        {getStatusIcon(activity.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {activity.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {activity.date}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Events
              </Typography>
              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CalendarMonth color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Team Meeting"
                    secondary="Tomorrow, 10:00 AM"
                  />
                </ListItem>
                <Divider />
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Assessment color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Performance Review"
                    secondary="Jan 15, 2025"
                  />
                </ListItem>
                <Divider />
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <AttachMoney color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Salary Review"
                    secondary="Mar 1, 2025"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDashboard;
