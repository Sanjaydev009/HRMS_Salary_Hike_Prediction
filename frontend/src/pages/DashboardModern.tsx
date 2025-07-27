import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Paper,
  Stack,
  Divider,
  Button,
  useTheme,
  useMediaQuery,
  Fade,
  Grow,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  EventNote as EventNoteIcon,
  Payment as PaymentIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactElement;
  color: string;
  delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, icon, color, delay = 0 }) => {
  const theme = useTheme();
  
  return (
    <Grow in timeout={600} style={{ transitionDelay: `${delay}ms` }}>
      <Card sx={{ 
        height: '100%',
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          transform: 'translateY(-4px)',
          transition: 'transform 0.3s ease-in-out',
          boxShadow: theme.shadows[8],
        }
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Avatar sx={{ 
              bgcolor: color, 
              width: 56, 
              height: 56,
              background: `linear-gradient(135deg, ${color}CC 0%, ${color} 100%)`,
            }}>
              {icon}
            </Avatar>
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <MoreVertIcon />
            </IconButton>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ 
            color: change.startsWith('+') ? 'success.main' : change.startsWith('-') ? 'error.main' : 'text.secondary',
            fontWeight: 500 
          }}>
            {change}
          </Typography>
        </CardContent>
      </Card>
    </Grow>
  );
};

interface RecentActivityItem {
  id: string;
  type: 'employee' | 'leave' | 'payroll';
  title: string;
  description: string;
  time: string;
  status: 'completed' | 'pending' | 'warning';
}

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalEmployees: 0,
    activeLeaves: 0,
    monthlyPayroll: 0,
    performanceScore: 0,
    currency: 'INR',
    formattedPayrollAmount: '₹0',
  });
  
  const [permissions, setPermissions] = useState({
    canViewAllEmployees: false,
    canManageLeaves: false,
    canProcessPayroll: false,
    canManageUsers: false,
    isRestricted: true,
    viewScope: 'personal'
  });
  
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(30000);

  // Fetch dashboard data from API
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard statistics
      const statsResponse = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const activitiesResponse = await fetch('/api/dashboard/activities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('📊 Dashboard stats:', statsData);
        
        setDashboardData({
          totalEmployees: statsData.totalEmployees || 0,
          activeLeaves: statsData.pendingLeaves || 0,
          monthlyPayroll: statsData.totalPayrollAmount || 0,
          performanceScore: 85, // Mock data for now
          currency: statsData.currency || 'INR',
          formattedPayrollAmount: statsData.formattedPayrollAmount || '₹0',
        });
        
        // Set role-based permissions
        if (statsData.permissions) {
          setPermissions(statsData.permissions);
        }
        
        // Update refresh settings
        if (statsData.refreshInterval) {
          setRefreshInterval(statsData.refreshInterval);
        }
      }

      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setRecentActivities(activitiesData.activities || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Set up real-time auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchDashboardData();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchDashboardData]);

  const stats = [
    {
      title: 'Total Employees',
      value: dashboardData.totalEmployees,
      change: '+12 this month',
      icon: <PeopleIcon />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Active Leaves',
      value: dashboardData.activeLeaves,
      change: '+3 today',
      icon: <EventNoteIcon />,
      color: theme.palette.warning.main,
    },
    {
      title: 'Payroll Processed',
      value: dashboardData.formattedPayrollAmount || `₹${(dashboardData.monthlyPayroll / 100000).toFixed(1)}L`,
      change: '+8.2% vs last month',
      icon: <PaymentIcon />,
      color: theme.palette.success.main,
    },
    {
      title: 'Performance Score',
      value: `${dashboardData.performanceScore}%`,
      change: '+2.1% improvement',
      icon: <TrendingUpIcon />,
      color: theme.palette.info.main,
    },
  ];

  const quickActions = [
    {
      title: 'Add Employee',
      description: 'Register a new team member',
      icon: <AddIcon />,
      path: '/employees/new',
      color: theme.palette.primary.main,
    },
    {
      title: 'View Reports',
      description: 'Access analytics and insights',
      icon: <AssessmentIcon />,
      path: '/analytics',
      color: theme.palette.info.main,
    },
    {
      title: 'Manage Leaves',
      description: 'Review pending requests',
      icon: <ScheduleIcon />,
      path: '/leaves',
      color: theme.palette.warning.main,
    },
    {
      title: 'Process Payroll',
      description: 'Generate monthly payroll',
      icon: <PaymentIcon />,
      path: '/payroll',
      color: theme.palette.success.main,
    },
  ];

  const getActivityIcon = (type: string, status: string) => {
    if (status === 'completed') return <CheckCircleIcon sx={{ color: 'success.main' }} />;
    if (status === 'pending') return <PendingIcon sx={{ color: 'warning.main' }} />;
    if (status === 'warning') return <WarningIcon sx={{ color: 'error.main' }} />;
    return <VisibilityIcon sx={{ color: 'text.secondary' }} />;
  };

  return (
    <Fade in timeout={800}>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            Welcome back, John! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your team today.
          </Typography>
        </Box>

        {/* Role-based Welcome Message */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: theme.palette.primary.main,
                    fontSize: '1.5rem',
                  }}
                >
                  {user?.profile?.firstName?.charAt(0)}{user?.profile?.lastName?.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Welcome back, {user?.profile?.firstName}!
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={user?.role?.toUpperCase()}
                      size="small"
                      color={
                        user?.role === 'admin' ? 'error' :
                        user?.role === 'hr' ? 'warning' :
                        user?.role === 'manager' ? 'info' : 'default'
                      }
                      variant="outlined"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {user?.jobDetails?.designation} • {user?.jobDetails?.department}
                    </Typography>
                  </Stack>
                  {permissions.isRestricted && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      You have limited access. Contact HR for additional permissions.
                    </Alert>
                  )}
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {loading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Skeleton variant="circular" width={56} height={56} />
                      <Skeleton variant="circular" width={24} height={24} />
                    </Box>
                    <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="50%" height={20} />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            stats.map((stat, index) => (
              <Grid item xs={12} sm={6} lg={3} key={stat.title}>
                <StatsCard {...stat} delay={index * 100} />
              </Grid>
            ))
          )}
        </Grid>

        <Grid container spacing={3}>
          {/* Quick Actions */}
          <Grid item xs={12} lg={8}>
            <Fade in timeout={1000} style={{ transitionDelay: '200ms' }}>
              <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Quick Actions
                  </Typography>
                  <Grid container spacing={2}>
                    {quickActions.map((action, index) => (
                      <Grid item xs={12} sm={6} key={action.title}>
                        <Grow in timeout={600} style={{ transitionDelay: `${400 + index * 100}ms` }}>
                          <Paper
                            sx={{
                              p: 2,
                              cursor: 'pointer',
                              border: '1px solid',
                              borderColor: 'divider',
                              '&:hover': {
                                borderColor: action.color,
                                transform: 'translateY(-2px)',
                                transition: 'all 0.3s ease',
                                boxShadow: 2,
                              },
                            }}
                            onClick={() => navigate(action.path)}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ bgcolor: action.color, width: 40, height: 40 }}>
                                {action.icon}
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                  {action.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" noWrap>
                                  {action.description}
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        </Grow>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Fade>

            {/* Performance Overview */}
            <Fade in timeout={1000} style={{ transitionDelay: '400ms' }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Department Performance
                    </Typography>
                    <Button variant="outlined" size="small">
                      View All
                    </Button>
                  </Box>
                  <Stack spacing={3}>
                    {[
                      { name: 'Engineering', percentage: 94, employees: 45 },
                      { name: 'Marketing', percentage: 88, employees: 23 },
                      { name: 'Sales', percentage: 91, employees: 34 },
                      { name: 'HR', percentage: 96, employees: 12 },
                    ].map((dept, index) => (
                      <Grow in timeout={600} style={{ transitionDelay: `${600 + index * 100}ms` }} key={dept.name}>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {dept.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                {dept.employees} employees
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {dept.percentage}%
                              </Typography>
                            </Box>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={dept.percentage}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                              },
                            }}
                          />
                        </Box>
                      </Grow>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          {/* Recent Activities */}
          <Grid item xs={12} lg={4}>
            <Fade in timeout={1000} style={{ transitionDelay: '300ms' }}>
              <Card sx={{ height: 'fit-content' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Recent Activity
                    </Typography>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  <Stack spacing={2.5}>
                    {recentActivities.map((activity, index) => (
                      <Grow in timeout={600} style={{ transitionDelay: `${700 + index * 100}ms` }} key={activity.id}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Box sx={{ mt: 0.5 }}>
                            {getActivityIcon(activity.type, activity.status)}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {activity.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {activity.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {activity.time}
                            </Typography>
                          </Box>
                        </Box>
                      </Grow>
                    ))}
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  <Button fullWidth variant="text" size="small">
                    View All Activities
                  </Button>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default Dashboard;
