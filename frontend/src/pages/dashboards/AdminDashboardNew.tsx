import React, { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assessment as AnalyticsIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  CloudSync as BackupIcon,
  Speed as PerformanceIcon,
  Notifications as NotificationIcon,
  TrendingUp,
  Warning,
  CheckCircle,
  Error,
  Info,
  Refresh,
  PersonAdd,
  GroupAdd,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface AdminDashboardData {
  systemStats: {
    totalUsers: number;
    activeUsers: number;
    systemUptime: string;
    storageUsed: number;
    apiRequests: number;
    responseTime: number;
  };
  userManagement: {
    totalEmployees: number;
    totalManagers: number;
    totalHRUsers: number;
    totalAdmins: number;
    pendingApprovals: number;
    newUsersToday: number;
  };
  systemHealth: {
    serverStatus: string;
    databaseStatus: string;
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
    networkLatency: number;
  };
  recentActivities: Array<{
    id: string;
    user: string;
    action: string;
    timestamp: string;
    type: 'create' | 'update' | 'delete' | 'login' | 'system';
  }>;
  securityAlerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: string;
    resolved: boolean;
  }>;
  systemMetrics: Array<{
    time: string;
    users: number;
    requests: number;
    memory: number;
    cpu: number;
  }>;
}

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchAdminDashboardData();
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(fetchAdminDashboardData, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchAdminDashboardData = async () => {
    try {
      setError(null);
      // Mock data for demonstration
      const mockData: AdminDashboardData = {
        systemStats: {
          totalUsers: 1250,
          activeUsers: 987,
          systemUptime: '45 days, 12 hours',
          storageUsed: 67.5,
          apiRequests: 125430,
          responseTime: 145,
        },
        userManagement: {
          totalEmployees: 1180,
          totalManagers: 45,
          totalHRUsers: 15,
          totalAdmins: 10,
          pendingApprovals: 23,
          newUsersToday: 8,
        },
        systemHealth: {
          serverStatus: 'healthy',
          databaseStatus: 'healthy',
          memoryUsage: 68.2,
          cpuUsage: 45.7,
          diskUsage: 72.1,
          networkLatency: 12,
        },
        recentActivities: [
          { id: '1', user: 'John Doe', action: 'Created new employee record', timestamp: '2 minutes ago', type: 'create' },
          { id: '2', user: 'Jane Smith', action: 'Updated payroll settings', timestamp: '5 minutes ago', type: 'update' },
          { id: '3', user: 'System', action: 'Automated backup completed', timestamp: '10 minutes ago', type: 'system' },
          { id: '4', user: 'Mike Johnson', action: 'Logged in from new device', timestamp: '15 minutes ago', type: 'login' },
          { id: '5', user: 'Sarah Wilson', action: 'Deleted old leave records', timestamp: '20 minutes ago', type: 'delete' },
        ],
        securityAlerts: [
          { id: '1', type: 'warning', message: 'Multiple failed login attempts detected', timestamp: '1 hour ago', resolved: false },
          { id: '2', type: 'info', message: 'Security patch installed successfully', timestamp: '2 hours ago', resolved: true },
          { id: '3', type: 'error', message: 'Unauthorized access attempt blocked', timestamp: '3 hours ago', resolved: false },
        ],
        systemMetrics: [
          { time: '00:00', users: 45, requests: 1200, memory: 60, cpu: 35 },
          { time: '04:00', users: 12, requests: 300, memory: 55, cpu: 25 },
          { time: '08:00', users: 156, requests: 2400, memory: 70, cpu: 55 },
          { time: '12:00', users: 234, requests: 3200, memory: 75, cpu: 65 },
          { time: '16:00', users: 198, requests: 2800, memory: 68, cpu: 45 },
          { time: '20:00', users: 87, requests: 1800, memory: 62, cpu: 40 },
        ],
      };
      
      setDashboardData(mockData);
    } catch (error: any) {
      console.error('Error fetching admin dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  if (!dashboardData) {
    return <Alert severity="warning" sx={{ m: 2 }}>No data available</Alert>;
  }

  const getUsageColor = (usage: number) => {
    if (usage >= 80) return theme.palette.error.main;
    if (usage >= 60) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const userDistributionData = [
    { name: 'Employees', value: dashboardData.userManagement.totalEmployees },
    { name: 'Managers', value: dashboardData.userManagement.totalManagers },
    { name: 'HR Users', value: dashboardData.userManagement.totalHRUsers },
    { name: 'Admins', value: dashboardData.userManagement.totalAdmins },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Admin Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {user?.profile?.firstName}! Here's what's happening with your system.
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
              }
              label="Auto Refresh"
            />
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchAdminDashboardData}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* System Overview Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.systemStats.totalUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <TrendingUp fontSize="small" color="success" />
                    <Typography variant="caption" color="success.main">
                      +{dashboardData.userManagement.newUsersToday} today
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.systemStats.activeUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Users
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {((dashboardData.systemStats.activeUsers / dashboardData.systemStats.totalUsers) * 100).toFixed(1)}% online
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                  <PerformanceIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.systemStats.responseTime}ms
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Response Time
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    Excellent performance
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                  <NotificationIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.userManagement.pendingApprovals}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Approvals
                  </Typography>
                  <Button size="small" variant="text">
                    Review Now
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* System Health */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                System Performance
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.systemMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="memory" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="cpu" stroke="#ffc658" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* User Distribution */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                User Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userDistributionData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Health Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                System Health
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Memory Usage</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {dashboardData.systemHealth.memoryUsage}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={dashboardData.systemHealth.memoryUsage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getUsageColor(dashboardData.systemHealth.memoryUsage),
                      },
                    }}
                  />
                </Box>
                
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">CPU Usage</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {dashboardData.systemHealth.cpuUsage}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={dashboardData.systemHealth.cpuUsage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getUsageColor(dashboardData.systemHealth.cpuUsage),
                      },
                    }}
                  />
                </Box>
                
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Disk Usage</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {dashboardData.systemHealth.diskUsage}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={dashboardData.systemHealth.diskUsage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getUsageColor(dashboardData.systemHealth.diskUsage),
                      },
                    }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Alerts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Security Alerts
                </Typography>
                <Button size="small" onClick={() => navigate('/admin/security')}>
                  View All
                </Button>
              </Stack>
              <List>
                {dashboardData.securityAlerts.map((alert) => (
                  <ListItem key={alert.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      {alert.type === 'error' && <Error color="error" />}
                      {alert.type === 'warning' && <Warning color="warning" />}
                      {alert.type === 'info' && <Info color="info" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={alert.message}
                      secondary={alert.timestamp}
                    />
                    <Chip
                      label={alert.resolved ? 'Resolved' : 'Pending'}
                      color={alert.resolved ? 'success' : 'warning'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Activities
                </Typography>
                <Button size="small" onClick={() => navigate('/admin/activities')}>
                  View All
                </Button>
              </Stack>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.recentActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>{activity.user}</TableCell>
                        <TableCell>{activity.action}</TableCell>
                        <TableCell>
                          <Chip
                            label={activity.type}
                            size="small"
                            color={
                              activity.type === 'create' ? 'success' :
                              activity.type === 'update' ? 'info' :
                              activity.type === 'delete' ? 'error' :
                              'default'
                            }
                          />
                        </TableCell>
                        <TableCell>{activity.timestamp}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PersonAdd />}
                    onClick={() => navigate('/admin/users/add')}
                  >
                    Add User
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GroupAdd />}
                    onClick={() => navigate('/admin/departments')}
                  >
                    Manage Depts
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<BackupIcon />}
                    onClick={() => navigate('/admin/backup')}
                  >
                    Backup Now
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AnalyticsIcon />}
                    onClick={() => navigate('/admin/analytics')}
                  >
                    Analytics
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<SettingsIcon />}
                    onClick={() => navigate('/admin/settings')}
                  >
                    Settings
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<SecurityIcon />}
                    onClick={() => navigate('/admin/security')}
                  >
                    Security
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
