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
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Assessment as AnalyticsIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Storage as DatabaseIcon,
  CloudSync as BackupIcon,
  Speed as PerformanceIcon,
  BugReport as SystemIcon,
  AdminPanelSettings as AdminIcon,
  Notifications as NotificationIcon,
  Update as UpdateIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface AdminDashboardData {
  systemStats: {
    totalUsers: number;
    activeUsers: number;
    systemUptime: string;
    storageUsed: number;
    apiRequests: number;
  };
  userManagement: {
    totalEmployees: number;
    totalManagers: number;
    totalHRUsers: number;
    totalAdmins: number;
    pendingApprovals: number;
  };
  systemHealth: {
    serverStatus: string;
    databaseStatus: string;
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
  };
  recentActivities: any[];
  securityAlerts: any[];
  backupStatus: {
    lastBackup: string;
    nextScheduled: string;
    status: string;
  };
}

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminDashboardData();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchAdminDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdminDashboardData = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/dashboard/admin-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
    } catch (error: any) {
      console.error('Error fetching admin dashboard data:', error);
      setError(error.response?.data?.message || 'Failed to load dashboard data');
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
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          System Administration - {user?.profile?.firstName}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Complete system control and monitoring
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* System Overview Cards */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{dashboardData?.systemStats?.totalUsers || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{dashboardData?.systemStats?.activeUsers || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Users
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                  <PerformanceIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{dashboardData?.systemStats?.systemUptime || '0d'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    System Uptime
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                  <DatabaseIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{dashboardData?.systemStats?.storageUsed || 0}GB</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Storage Used
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                  <AnalyticsIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{dashboardData?.systemStats?.apiRequests || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    API Requests
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* User Management */}
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Management
              </Typography>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Employees</Typography>
                  <Chip 
                    label={dashboardData?.userManagement?.totalEmployees || 0}
                    color="primary"
                    size="small"
                  />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Managers</Typography>
                  <Chip 
                    label={dashboardData?.userManagement?.totalManagers || 0}
                    color="success"
                    size="small"
                  />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">HR Users</Typography>
                  <Chip 
                    label={dashboardData?.userManagement?.totalHRUsers || 0}
                    color="info"
                    size="small"
                  />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Administrators</Typography>
                  <Chip 
                    label={dashboardData?.userManagement?.totalAdmins || 0}
                    color="error"
                    size="small"
                  />
                </Stack>
              </Stack>
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mt: 2 }}
                onClick={() => navigate('/admin/users')}
              >
                Manage Users
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* System Health */}
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Health
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">CPU Usage</Typography>
                    <Typography variant="body2" color="primary">
                      {dashboardData?.systemHealth?.cpuUsage || 0}%
                    </Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={dashboardData?.systemHealth?.cpuUsage || 0} 
                    color="primary"
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Memory Usage</Typography>
                    <Typography variant="body2" color="warning.main">
                      {dashboardData?.systemHealth?.memoryUsage || 0}%
                    </Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={dashboardData?.systemHealth?.memoryUsage || 0} 
                    color="warning"
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Disk Usage</Typography>
                    <Typography variant="body2" color="error.main">
                      {dashboardData?.systemHealth?.diskUsage || 0}%
                    </Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={dashboardData?.systemHealth?.diskUsage || 0} 
                    color="error"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Backup Status */}
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Backup & Security
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Last Backup
                  </Typography>
                  <Typography variant="body1">
                    {dashboardData?.backupStatus?.lastBackup || 'Never'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Backup Status
                  </Typography>
                  <Chip 
                    label={dashboardData?.backupStatus?.status || 'Unknown'}
                    color={dashboardData?.backupStatus?.status === 'Success' ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Security Alerts
                  </Typography>
                  <Chip 
                    label={dashboardData?.securityAlerts?.length || 0}
                    color={dashboardData?.securityAlerts?.length ? 'error' : 'success'}
                    size="small"
                  />
                </Box>
              </Stack>
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mt: 2 }}
                onClick={() => navigate('/admin/security')}
              >
                Security Center
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* System Activities */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent System Activities
              </Typography>
              <List>
                {dashboardData?.recentActivities?.length ? (
                  dashboardData.recentActivities.slice(0, 8).map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ListItem>
                        <ListItemIcon>
                          {activity.type === 'user_created' && <PeopleIcon color="success" />}
                          {activity.type === 'system_update' && <UpdateIcon color="info" />}
                          {activity.type === 'security_alert' && <SecurityIcon color="error" />}
                          {activity.type === 'backup_completed' && <BackupIcon color="primary" />}
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.title}
                          secondary={`${activity.description} • ${new Date(activity.timestamp).toLocaleDateString()}`}
                        />
                        {activity.critical && (
                          <Chip label="Critical" size="small" color="error" variant="outlined" />
                        )}
                      </ListItem>
                      {index < dashboardData.recentActivities.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No recent activities"
                      secondary="System activities will appear here"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Admin Quick Actions */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Administration
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AdminIcon />}
                  onClick={() => navigate('/admin/users')}
                >
                  User Management
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<SecurityIcon />}
                  onClick={() => navigate('/admin/security')}
                >
                  Security Center
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<DatabaseIcon />}
                  onClick={() => navigate('/admin/database')}
                >
                  Database Management
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<BackupIcon />}
                  onClick={() => navigate('/admin/backup')}
                >
                  Backup & Recovery
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<SettingsIcon />}
                  onClick={() => navigate('/admin/settings')}
                >
                  System Settings
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<AnalyticsIcon />}
                  onClick={() => navigate('/admin/analytics')}
                >
                  System Analytics
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<NotificationIcon />}
                  onClick={() => navigate('/admin/notifications')}
                >
                  Notification Center
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<SystemIcon />}
                  onClick={() => navigate('/admin/logs')}
                >
                  System Logs
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
