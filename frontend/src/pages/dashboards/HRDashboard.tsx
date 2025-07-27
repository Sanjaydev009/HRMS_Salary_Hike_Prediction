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
  EventNote as EventNoteIcon,
  Payment as PaymentIcon,
  Business as DepartmentIcon,
  TrendingUp as GrowthIcon,
  Assessment as ReportIcon,
  PersonAdd as RecruitmentIcon,
  AccountBalance as PayrollIcon,
  Schedule as ScheduleIcon,
  Assignment as PolicyIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  departmentDistribution: any[];
  recentActivities: any[];
  hrMetrics: {
    employeeSatisfaction: number;
    averageTenure: number;
    turnoverRate: number;
  };
}

const HRDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<HRDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHRDashboardData();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchHRDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHRDashboardData = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/dashboard/hr-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
    } catch (error: any) {
      console.error('Error fetching HR dashboard data:', error);
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
          HR Dashboard - {user?.profile?.firstName}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comprehensive HR management and analytics
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Organization Stats Cards */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{dashboardData?.organizationStats?.totalEmployees || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Employees
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
                  <DepartmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{dashboardData?.organizationStats?.totalDepartments || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Departments
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
                  <RecruitmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{dashboardData?.organizationStats?.newHiresThisMonth || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    New Hires
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
                  <EventNoteIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{dashboardData?.leaveStats?.totalPendingLeaves || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Leaves
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
                  <PayrollIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    ₹{(dashboardData?.payrollStats?.totalPayrollAmount || 0).toLocaleString('en-IN')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Payroll
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* HR Metrics */}
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                HR Metrics
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
                    color="success"
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Average Tenure</Typography>
                    <Typography variant="h6" color="primary">
                      {dashboardData?.hrMetrics?.averageTenure || 0} years
                    </Typography>
                  </Stack>
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
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Distribution */}
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Department Distribution
              </Typography>
              <List dense>
                {dashboardData?.departmentDistribution?.length ? (
                  dashboardData.departmentDistribution.slice(0, 6).map((dept, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemText
                        primary={dept.name}
                        secondary={`${dept.value} employees`}
                      />
                      <Chip 
                        label={`${Math.round((dept.value / (dashboardData?.organizationStats?.totalEmployees || 1)) * 100)}%`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No department data available" />
                  </ListItem>
                )}
              </List>
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mt: 2 }}
                onClick={() => navigate('/employees')}
              >
                View All Employees
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Leave Overview */}
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Leave Management
              </Typography>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Pending Approvals</Typography>
                  <Chip 
                    label={dashboardData?.leaveStats?.totalPendingLeaves || 0}
                    color="warning"
                    size="small"
                  />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Leaves This Month</Typography>
                  <Chip 
                    label={dashboardData?.leaveStats?.leavesThisMonth || 0}
                    color="info"
                    size="small"
                  />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Approval Rate</Typography>
                  <Chip 
                    label={`${dashboardData?.leaveStats?.leaveApprovalRate || 0}%`}
                    color="success"
                    size="small"
                  />
                </Stack>
              </Stack>
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mt: 2 }}
                onClick={() => navigate('/leaves')}
              >
                Manage Leaves
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent HR Activities */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent HR Activities
              </Typography>
              <List>
                {dashboardData?.recentActivities?.length ? (
                  dashboardData.recentActivities.slice(0, 8).map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ListItem>
                        <ListItemIcon>
                          {activity.type === 'employee_joined' && <PeopleIcon color="success" />}
                          {activity.type === 'leave_request' && <EventNoteIcon color="primary" />}
                          {activity.type === 'payroll_processed' && <PaymentIcon color="info" />}
                          {activity.type === 'policy_update' && <PolicyIcon color="warning" />}
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.title}
                          secondary={`${activity.description} • ${new Date(activity.timestamp).toLocaleDateString()}`}
                        />
                        {activity.priority === 'high' && (
                          <Chip label="High Priority" size="small" color="error" variant="outlined" />
                        )}
                      </ListItem>
                      {index < dashboardData.recentActivities.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No recent activities"
                      secondary="HR activities will appear here"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* HR Quick Actions */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              HR Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PeopleIcon />}
                  onClick={() => navigate('/employees')}
                >
                  Employee Management
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<EventNoteIcon />}
                  onClick={() => navigate('/leaves')}
                >
                  Leave Management
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PaymentIcon />}
                  onClick={() => navigate('/payroll')}
                >
                  Payroll Processing
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ReportIcon />}
                  onClick={() => navigate('/reports')}
                >
                  HR Reports
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<RecruitmentIcon />}
                  onClick={() => navigate('/recruitment')}
                >
                  Recruitment
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PolicyIcon />}
                  onClick={() => navigate('/policies')}
                >
                  Policies
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ScheduleIcon />}
                  onClick={() => navigate('/schedule')}
                >
                  Organization Schedule
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<GrowthIcon />}
                  onClick={() => navigate('/analytics')}
                >
                  HR Analytics
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HRDashboard;
