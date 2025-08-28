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
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd,
  Payment,
  TrendingUp,
  Assessment,
  MonetizationOn,
  Work,
  RequestPage,
  BarChart,
  Refresh,
  MoreVert,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface HRDashboardData {
  employeeStats: {
    totalEmployees: number;
    newHires: number;
    activeEmployees: number;
    onLeave: number;
    pendingOnboarding: number;
    resignations: number;
  };
  leaveManagement: {
    pendingRequests: number;
    approvedToday: number;
    rejectedToday: number;
    totalLeavesTaken: number;
    mostUsedLeaveType: string;
    averageLeavePerEmployee: number;
  };
  payrollStats: {
    totalPayroll: number;
    payrollProcessed: number;
    pendingPayroll: number;
    bonusesPaid: number;
    averageSalary: number;
    salaryIncrease: number;
  };
  recruitmentStats: {
    openPositions: number;
    applicationsReceived: number;
    interviewsScheduled: number;
    offersExtended: number;
    hiredThisMonth: number;
    rejectionRate: number;
  };
  performanceMetrics: {
    evaluationsDue: number;
    completedEvaluations: number;
    averageRating: number;
    topPerformers: number;
    improvementNeeded: number;
    trainingCompleted: number;
  };
  departmentData: Array<{
    name: string;
    employees: number;
    budget: number;
    utilization: number;
  }>;
  leaveTypes: Array<{
    type: string;
    requests: number;
    approved: number;
    pending: number;
  }>;
  recentActivities: Array<{
    id: string;
    type: 'leave' | 'hire' | 'payroll' | 'performance' | 'training';
    employee: string;
    action: string;
    timestamp: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
  }>;
}

const HRDashboardNew: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<HRDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHRDashboardData();
    const interval = setInterval(fetchHRDashboardData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchHRDashboardData = async () => {
    try {
      setError(null);
      // Mock data for demonstration
      const mockData: HRDashboardData = {
        employeeStats: {
          totalEmployees: 1180,
          newHires: 25,
          activeEmployees: 1155,
          onLeave: 45,
          pendingOnboarding: 8,
          resignations: 12,
        },
        leaveManagement: {
          pendingRequests: 23,
          approvedToday: 15,
          rejectedToday: 2,
          totalLeavesTaken: 156,
          mostUsedLeaveType: 'Annual Leave',
          averageLeavePerEmployee: 12.5,
        },
        payrollStats: {
          totalPayroll: 15600000,
          payrollProcessed: 98.5,
          pendingPayroll: 18,
          bonusesPaid: 2400000,
          averageSalary: 85000,
          salaryIncrease: 12.5,
        },
        recruitmentStats: {
          openPositions: 35,
          applicationsReceived: 234,
          interviewsScheduled: 45,
          offersExtended: 18,
          hiredThisMonth: 12,
          rejectionRate: 65.2,
        },
        performanceMetrics: {
          evaluationsDue: 89,
          completedEvaluations: 78,
          averageRating: 4.2,
          topPerformers: 156,
          improvementNeeded: 23,
          trainingCompleted: 234,
        },
        departmentData: [
          { name: 'Engineering', employees: 450, budget: 5400000, utilization: 92 },
          { name: 'Sales', employees: 230, budget: 2760000, utilization: 88 },
          { name: 'Marketing', employees: 125, budget: 1500000, utilization: 95 },
          { name: 'HR', employees: 45, budget: 540000, utilization: 87 },
          { name: 'Finance', employees: 78, budget: 936000, utilization: 91 },
          { name: 'Operations', employees: 252, budget: 3024000, utilization: 89 },
        ],
        leaveTypes: [
          { type: 'Annual Leave', requests: 156, approved: 142, pending: 14 },
          { type: 'Sick Leave', requests: 89, approved: 85, pending: 4 },
          { type: 'Maternity Leave', requests: 12, approved: 11, pending: 1 },
          { type: 'Personal Leave', requests: 67, approved: 58, pending: 9 },
          { type: 'Emergency Leave', requests: 34, approved: 32, pending: 2 },
        ],
        recentActivities: [
          { id: '1', type: 'leave', employee: 'Sarah Johnson', action: 'Applied for Annual Leave', timestamp: '5 min ago', status: 'pending' },
          { id: '2', type: 'hire', employee: 'John Doe', action: 'Completed onboarding', timestamp: '15 min ago', status: 'completed' },
          { id: '3', type: 'payroll', employee: 'All Employees', action: 'Monthly payroll processed', timestamp: '1 hour ago', status: 'completed' },
          { id: '4', type: 'performance', employee: 'Mike Wilson', action: 'Performance review submitted', timestamp: '2 hours ago', status: 'pending' },
          { id: '5', type: 'training', employee: 'Lisa Chen', action: 'Leadership training completed', timestamp: '3 hours ago', status: 'completed' },
        ],
      };
      
      setDashboardData(mockData);
    } catch (error: any) {
      console.error('Error fetching HR dashboard data:', error);
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              HR Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {user?.profile?.firstName}! Manage your workforce effectively.
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchHRDashboardData}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => navigate('/hr/employees/add')}
            >
              Add Employee
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Employee Overview Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.employeeStats.totalEmployees}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Employees
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <TrendingUp fontSize="small" color="success" />
                    <Typography variant="caption" color="success.main">
                      +{dashboardData.employeeStats.newHires} new hires
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
                <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                  <RequestPage />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.leaveManagement.pendingRequests}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Leave Requests
                  </Typography>
                  <Button size="small" variant="text" onClick={() => navigate('/hr/leaves')}>
                    Review Now
                  </Button>
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
                  <MonetizationOn />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.payrollStats.payrollProcessed}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Payroll Processed
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ${(dashboardData.payrollStats.totalPayroll / 1000000).toFixed(1)}M total
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
                  <Work />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.recruitmentStats.openPositions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Open Positions
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dashboardData.recruitmentStats.applicationsReceived} applications
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Performance */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Department Performance
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={dashboardData.departmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="employees" fill="#8884d8" name="Employees" />
                    <Bar dataKey="utilization" fill="#82ca9d" name="Utilization %" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Leave Types Distribution */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Leave Types Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.leaveTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="requests"
                    >
                      {dashboardData.leaveTypes.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Performance Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h3" fontWeight="bold" color="primary.main">
                      {dashboardData.performanceMetrics.averageRating}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Rating
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h3" fontWeight="bold" color="success.main">
                      {dashboardData.performanceMetrics.topPerformers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Top Performers
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h3" fontWeight="bold" color="warning.main">
                      {dashboardData.performanceMetrics.evaluationsDue}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Evaluations Due
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h3" fontWeight="bold" color="info.main">
                      {dashboardData.performanceMetrics.trainingCompleted}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Training Completed
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recruitment Pipeline */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recruitment Pipeline
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Applications Received</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {dashboardData.recruitmentStats.applicationsReceived}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={100}
                    sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.200' }}
                  />
                </Box>
                
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Interviews Scheduled</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {dashboardData.recruitmentStats.interviewsScheduled}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={(dashboardData.recruitmentStats.interviewsScheduled / dashboardData.recruitmentStats.applicationsReceived) * 100}
                    sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.200' }}
                  />
                </Box>
                
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Offers Extended</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {dashboardData.recruitmentStats.offersExtended}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={(dashboardData.recruitmentStats.offersExtended / dashboardData.recruitmentStats.applicationsReceived) * 100}
                    sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.200' }}
                  />
                </Box>
                
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Hired This Month</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {dashboardData.recruitmentStats.hiredThisMonth}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={(dashboardData.recruitmentStats.hiredThisMonth / dashboardData.recruitmentStats.applicationsReceived) * 100}
                    sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.200' }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent HR Activities
                </Typography>
                <Button size="small" onClick={() => navigate('/hr/activities')}>
                  View All
                </Button>
              </Stack>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.recentActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>{activity.employee}</TableCell>
                        <TableCell>{activity.action}</TableCell>
                        <TableCell>
                          <Chip
                            label={activity.type}
                            size="small"
                            color={
                              activity.type === 'hire' ? 'success' :
                              activity.type === 'leave' ? 'info' :
                              activity.type === 'payroll' ? 'warning' :
                              activity.type === 'performance' ? 'secondary' :
                              'default'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={activity.status}
                            size="small"
                            color={
                              activity.status === 'completed' ? 'success' :
                              activity.status === 'pending' ? 'warning' :
                              activity.status === 'approved' ? 'info' :
                              'error'
                            }
                          />
                        </TableCell>
                        <TableCell>{activity.timestamp}</TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <MoreVert />
                          </IconButton>
                        </TableCell>
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
                    onClick={() => navigate('/hr/employees/add')}
                  >
                    Add Employee
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<RequestPage />}
                    onClick={() => navigate('/hr/leaves')}
                  >
                    Review Leaves
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Payment />}
                    onClick={() => navigate('/hr/payroll')}
                  >
                    Process Payroll
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Assessment />}
                    onClick={() => navigate('/hr/performance')}
                  >
                    Performance
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Work />}
                    onClick={() => navigate('/hr/jobs')}
                  >
                    Recruitment
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<BarChart />}
                    onClick={() => navigate('/hr/analytics')}
                  >
                    HR Analytics
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

export default HRDashboardNew;
