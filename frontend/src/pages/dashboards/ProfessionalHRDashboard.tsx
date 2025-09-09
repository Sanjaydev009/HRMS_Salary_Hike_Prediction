import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Paper,
  Stack,
  Button,
  useTheme,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Badge,
  IconButton,
  Fade,
  Zoom,
  alpha,
  ButtonGroup,
  Switch,
  FormControlLabel,
  Skeleton,
} from '@mui/material';
import {
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  Payment as PaymentIcon,
  Business as DepartmentIcon,
  Assessment as ReportIcon,
  PersonAdd as RecruitmentIcon,
  AccountBalance as PayrollIcon,
  Refresh as RefreshIcon,
  NotificationsActive as NotificationsIcon,
  BarChart as BarChartIcon,
  AccessTime as AccessTimeIcon,
  School as TrainingIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, PieChart, Pie, Cell, Legend } from 'recharts';

interface HRDashboardData {
  organizationStats: {
    totalEmployees: number;
    totalDepartments: number;
    newHiresThisMonth: number;
    exitingThisMonth: number;
    pendingOnboardings: number;
  };
  leaveStats: {
    totalPendingLeaves: number;
    leavesThisMonth: number;
    leaveApprovalRate: number;
  };
  payrollStats: {
    totalPayrollAmount: number;
    pendingPayrolls: number;
    completedPayrolls: number;
  };
  departmentDistribution: Array<{name: string; value: number}>;
  employeeGrowthData?: Array<{month: string; employees: number; newHires: number; exits: number}>;
  employeeGrowth?: Array<{month: string; employees: number; newHires: number; exits: number}>;
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    priority?: string;
  }>;
  hrMetrics: {
    employeeSatisfaction: number;
    averageTenure: number;
    turnoverRate: number;
  };
  lastUpdated: string;
}

const ProfessionalHRDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // State management
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<HRDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [notifications, setNotifications] = useState(5);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [isRealTime, setIsRealTime] = useState(true);

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Fetch HR dashboard data with error handling
  const fetchHRDashboardData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setRefreshing(true);
      setError(null);
      
      const response = await api.get('/dashboard/hr-stats');
      setDashboardData(response.data);
      
      // Simulate some notifications for demo
      const pendingActions = (response.data.leaveStats?.totalPendingLeaves || 0) + 
                           (response.data.payrollStats?.pendingPayrolls || 0);
      setNotifications(pendingActions);
      
    } catch (error: any) {
      console.error('Error fetching HR dashboard data:', error);
      setError(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    fetchHRDashboardData(true);
    
    if (autoRefresh && isRealTime) {
      const interval = setInterval(() => {
        fetchHRDashboardData(false);
      }, 30000); // 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [fetchHRDashboardData, autoRefresh, isRealTime]);

  // Manual refresh handler
  const handleRefresh = () => {
    fetchHRDashboardData(true);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width={300} height={60} />
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }
        sx={{ m: 2 }}
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Enhanced Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              🎯 Professional HR Dashboard
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Welcome back, {user?.profile?.firstName}! {dashboardData?.organizationStats?.totalEmployees} employees under your management
            </Typography>
            <Chip 
              icon={<AccessTimeIcon />}
              label={`Last updated: ${dashboardData?.lastUpdated ? new Date(dashboardData.lastUpdated).toLocaleTimeString() : 'Never'}`}
              sx={{ 
                mt: 1, 
                backgroundColor: alpha('#ffffff', 0.2),
                color: 'white',
              }}
            />
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={isRealTime}
                  onChange={(e) => setIsRealTime(e.target.checked)}
                  color="default"
                />
              }
              label="Real-time"
              sx={{ color: 'white' }}
            />
            <Badge badgeContent={notifications} color="error">
              <IconButton 
                sx={{ 
                  color: 'white',
                  backgroundColor: alpha('#ffffff', 0.1),
                  '&:hover': { backgroundColor: alpha('#ffffff', 0.2) }
                }}
              >
                <NotificationsIcon />
              </IconButton>
            </Badge>
            <IconButton 
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{ 
                color: 'white',
                backgroundColor: alpha('#ffffff', 0.1),
                '&:hover': { backgroundColor: alpha('#ffffff', 0.2) }
              }}
            >
              {refreshing ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
            </IconButton>
          </Stack>
        </Stack>
      </Paper>

      {/* Real-time Status Indicator */}
      {isRealTime && (
        <Fade in>
          <Alert 
            severity="info" 
            icon={<SpeedIcon />}
            sx={{ mb: 3, backgroundColor: alpha('#2196f3', 0.1) }}
          >
            Real-time monitoring active • Data refreshes every 30 seconds
          </Alert>
        </Fade>
      )}

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in timeout={300}>
            <Card 
              elevation={0}
              sx={{ 
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 100,
                  height: 100,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  transform: 'translate(30px, -30px)',
                }
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <PeopleIcon fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {dashboardData?.organizationStats?.totalEmployees || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Employees
                    </Typography>
                    <Chip 
                      size="small"
                      label={`+${dashboardData?.organizationStats?.newHiresThisMonth || 0} this month`}
                      sx={{ 
                        mt: 0.5,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontSize: '0.7rem'
                      }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in timeout={500}>
            <Card 
              elevation={0}
              sx={{ 
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <EventNoteIcon fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {dashboardData?.leaveStats?.totalPendingLeaves || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Pending Leaves
                    </Typography>
                    <Chip 
                      size="small"
                      label={`${dashboardData?.leaveStats?.leaveApprovalRate || 0}% approval rate`}
                      sx={{ 
                        mt: 0.5,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontSize: '0.7rem'
                      }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in timeout={700}>
            <Card 
              elevation={0}
              sx={{ 
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <PayrollIcon fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      ₹{((dashboardData?.payrollStats?.totalPayrollAmount || 0) / 100000).toFixed(1)}L
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Monthly Payroll
                    </Typography>
                    <Chip 
                      size="small"
                      label={`${dashboardData?.payrollStats?.completedPayrolls || 0} processed`}
                      sx={{ 
                        mt: 0.5,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontSize: '0.7rem'
                      }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in timeout={900}>
            <Card 
              elevation={0}
              sx={{ 
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                color: '#333',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.1)', width: 56, height: 56 }}>
                    <DepartmentIcon fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {dashboardData?.organizationStats?.totalDepartments || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Active Departments
                    </Typography>
                    <Chip 
                      size="small"
                      label="View breakdown"
                      clickable
                      sx={{ 
                        mt: 0.5,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        fontSize: '0.7rem'
                      }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
      </Grid>

      {/* Advanced Analytics Section */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>
            📊 Advanced HR Analytics
          </Typography>
          <ButtonGroup variant="outlined" size="small">
            <Button startIcon={<BarChartIcon />}>Chart View</Button>
            <Button startIcon={<DownloadIcon />}>Export</Button>
            <Button startIcon={<FilterIcon />}>Filter</Button>
          </ButtonGroup>
        </Stack>

        <Grid container spacing={3}>
          {/* Employee Growth Chart */}
          <Grid item xs={12} md={8}>
            <Card elevation={0} sx={{ border: '1px solid #e0e7ff' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Employee Growth Trends
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dashboardData?.employeeGrowthData || dashboardData?.employeeGrowth || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area 
                      type="monotone" 
                      dataKey="employees" 
                      stroke="#8884d8" 
                      fill="url(#colorGradient)" 
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Department Distribution */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border: '1px solid #e0e7ff' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Department Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData?.departmentDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dashboardData?.departmentDistribution?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* HR Metrics Dashboard */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid #e0e7ff', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎯 Performance Metrics
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Employee Satisfaction</Typography>
                    <Typography variant="h6" color="success.main">
                      {dashboardData?.hrMetrics?.employeeSatisfaction || 0}%
                    </Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={dashboardData?.hrMetrics?.employeeSatisfaction || 0} 
                    sx={{ 
                      mt: 1,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: theme.palette.success.main,
                        borderRadius: 4,
                      }
                    }}
                  />
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Average Tenure</Typography>
                    <Typography variant="h6" color="primary.main">
                      {dashboardData?.hrMetrics?.averageTenure || 0} years
                    </Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={(dashboardData?.hrMetrics?.averageTenure || 0) * 20} // Scale to 100
                    sx={{ 
                      mt: 1,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: theme.palette.primary.main,
                        borderRadius: 4,
                      }
                    }}
                  />
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Turnover Rate</Typography>
                    <Typography variant="h6" color="warning.main">
                      {dashboardData?.hrMetrics?.turnoverRate || 0}%
                    </Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={dashboardData?.hrMetrics?.turnoverRate || 0} 
                    color="warning"
                    sx={{ 
                      mt: 1,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(theme.palette.warning.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: theme.palette.warning.main,
                        borderRadius: 4,
                      }
                    }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ border: '1px solid #e0e7ff', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔔 Recent HR Activities
              </Typography>
              <List dense>
                {dashboardData?.recentActivities?.length ? (
                  dashboardData.recentActivities.slice(0, 5).map((activity, index) => (
                    <Fade key={activity.id} in timeout={300 + index * 100}>
                      <ListItem 
                        sx={{ 
                          borderRadius: 2,
                          mb: 1,
                          backgroundColor: alpha(theme.palette.primary.main, 0.02),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          }
                        }}
                      >
                        <ListItemIcon>
                          {activity.type === 'employee_joined' && <PeopleIcon color="success" />}
                          {activity.type === 'leave_request' && <EventNoteIcon color="primary" />}
                          {activity.type === 'payroll_processed' && <PaymentIcon color="info" />}
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.title}
                          secondary={
                            <span>
                              <Typography variant="body2" color="text.secondary" component="span" display="block">
                                {activity.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" component="span" display="block">
                                {new Date(activity.timestamp).toLocaleString()}
                              </Typography>
                            </span>
                          }
                        />
                        {activity.priority === 'high' && (
                          <Chip 
                            label="High Priority" 
                            size="small" 
                            color="error" 
                            variant="outlined" 
                          />
                        )}
                      </ListItem>
                    </Fade>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No recent activities"
                      secondary="HR activities will appear here in real-time"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Professional Quick Actions */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          ⚡ HR Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {[
            { icon: PeopleIcon, label: 'Employee Management', path: '/hr/employees', color: '#4f46e5' },
            { icon: EventNoteIcon, label: 'Leave Management', path: '/leaves', color: '#059669' },
            { icon: PaymentIcon, label: 'Payroll Processing', path: '/payroll', color: '#dc2626' },
            { icon: ReportIcon, label: 'HR Analytics', path: '/analytics', color: '#7c2d12' },
            { icon: RecruitmentIcon, label: 'Recruitment', path: '/recruitment', color: '#1565c0' },
            { icon: TrainingIcon, label: 'Training & Development', path: '/training', color: '#6a1b9a' },
            { icon: NotificationsIcon, label: 'Policies & Compliance', path: '/policies', color: '#ef6c00' },
            { icon: SecurityIcon, label: 'Security & Access', path: '/security', color: '#d32f2f' },
          ].map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Zoom in timeout={200 + index * 100}>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  startIcon={<action.icon />}
                  onClick={() => navigate(action.path)}
                  sx={{
                    py: 2,
                    borderRadius: 3,
                    textTransform: 'none',
                    borderColor: alpha(action.color, 0.3),
                    color: action.color,
                    backgroundColor: alpha(action.color, 0.05),
                    '&:hover': {
                      borderColor: action.color,
                      backgroundColor: alpha(action.color, 0.1),
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {action.label}
                </Button>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default ProfessionalHRDashboard;
