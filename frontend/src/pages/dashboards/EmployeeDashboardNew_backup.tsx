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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  IconButton,
  Divider,
  Paper,
} from '@mui/material';
import {
  Person as PersonIcon,
  EventNote,
  Payment as PaymentIcon,
  Assessment,
  Schedule,
  CheckCircle,
  Warning,
  Info,
  Receipt,
  School,
  Star,
  Timer,
  MonetizationOn,
  Refresh,
  Edit,
  RequestPage,
  Login as CheckIn,
  Pending as PendingIcon,
  TrendingUp as TrendingUpIcon,
  PhotoCamera,
  Upload,
  Cancel,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { 
  dashboardAPI, 
  profileAPI, 
  certificationsAPI, 
  attendanceAPI 
} from '../../services/api';

interface EmployeeDashboardData {
  profile: {
    firstName: string;
    lastName: string;
    employeeId: string;
    designation: string;
    department: string;
    joiningDate: string;
    profilePicture?: string;
  };
  attendance: {
    todayStatus: 'present' | 'absent' | 'late' | 'wfh';
    checkInTime?: string;
    checkOutTime?: string;
    workingHours: number;
    weeklyAttendance: number;
    monthlyAttendance: number;
    overtimeHours: number;
  };
  leaveInfo: {
    availableLeaves: {
      annual: number;
      sick: number;
      personal: number;
      emergency: number;
    };
    usedLeaves: {
      annual: number;
      sick: number;
      personal: number;
      emergency: number;
    };
    pendingRequests: number;
  };
  payroll: {
    currentSalary: number;
    lastPayslip: {
      amount: number;
      date: string;
      bonus: number;
      deductions: number;
    };
    ytdEarnings: number;
    taxSavings: number;
    nextPayday: string;
  };
  performance: {
    currentRating: number;
    goals: {
      completed: number;
      pending: number;
      overdue: number;
    };
    lastReviewDate: string;
    nextReviewDate: string;
    achievements: number;
    skillsProgress: Array<{
      skill: string;
      progress: number;
    }>;
  };
  recentActivities: Array<{
    id: string;
    type: 'attendance' | 'leave' | 'payroll' | 'training' | 'performance';
    description: string;
    timestamp: string;
    status: string;
  }>;
  notifications: Array<{
    id: string;
    type: 'info' | 'warning' | 'success' | 'error';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
  }>;
  workMetrics: Array<{
    date: string;
    hoursWorked: number;
    productivity: number;
    tasksCompleted: number;
  }>;
}

const EmployeeDashboardNew: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<EmployeeDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployeeDashboardData();
    const interval = setInterval(fetchEmployeeDashboardData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchEmployeeDashboardData = async () => {
    try {
      setError(null);
      // Fetch real data from APIs
      const [dashboardResponse, leaveBalanceResponse, attendanceResponse] = await Promise.allSettled([
        dashboardAPI.getEmployeeDashboard(),
        fetch('/api/leaves/balance/me', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        attendanceAPI.getMonthlyAttendance()
      ]);

      let dashboardData: EmployeeDashboardData = {
        profile: {
          firstName: user?.profile?.firstName || 'Employee',
          lastName: user?.profile?.lastName || '',
          employeeId: user?.employeeId || 'EMP001',
          designation: user?.jobDetails?.designation || 'Employee',
          department: user?.jobDetails?.department || 'General',
          joiningDate: user?.jobDetails?.joiningDate || '2023-01-01',
        },
        attendance: {
          todayStatus: 'present',
          workingHours: 0,
          weeklyAttendance: 0,
          monthlyAttendance: 0,
          overtimeHours: 0,
        },
        leaveInfo: {
          availableLeaves: { annual: 0, sick: 0, personal: 0, emergency: 0 },
          usedLeaves: { annual: 0, sick: 0, personal: 0, emergency: 0 },
          pendingRequests: 0,
        },
        payroll: {
          currentSalary: user?.salaryDetails?.basicSalary || 0,
          lastPayslip: { amount: 0, date: '', bonus: 0, deductions: 0 },
          ytdEarnings: 0,
          taxSavings: 0,
          nextPayday: '',
        },
        performance: {
          currentRating: 0,
          goals: { completed: 0, pending: 0, overdue: 0 },
          lastReviewDate: '',
          nextReviewDate: '',
          achievements: 0,
          skillsProgress: [],
        },
        recentActivities: [],
        notifications: [],
        workMetrics: [],
      };

      // Process dashboard response
      if (dashboardResponse.status === 'fulfilled') {
        const data = dashboardResponse.value;
        dashboardData = { ...dashboardData, ...data };
      }

      // Process leave balance response
      if (leaveBalanceResponse.status === 'fulfilled') {
        const response = leaveBalanceResponse.value;
        if (response.ok) {
          const leaveData = await response.json();
          if (leaveData.success) {
            dashboardData.leaveInfo = {
              availableLeaves: leaveData.balance || dashboardData.leaveInfo.availableLeaves,
              usedLeaves: leaveData.used || dashboardData.leaveInfo.usedLeaves,
              pendingRequests: leaveData.pending || 0,
            };
          }
        }
      }

      // Process attendance response
      if (attendanceResponse.status === 'fulfilled') {
        const attendanceData = attendanceResponse.value;
        dashboardData.attendance = {
          ...dashboardData.attendance,
          monthlyAttendance: attendanceData.percentage || 0,
          workingHours: attendanceData.todayHours || 0,
        };
      }

      setDashboardData(dashboardData);
    } catch (error: any) {
      console.error('Error fetching employee dashboard data:', error);
      setError('Failed to load dashboard data');
      
      // Fallback to user data if available
      if (user) {
        setDashboardData({
          profile: {
            firstName: user.profile?.firstName || 'Employee',
            lastName: user.profile?.lastName || '',
            employeeId: user.employeeId || 'EMP001',
            designation: user.jobDetails?.designation || 'Employee',
            department: user.jobDetails?.department || 'General',
            joiningDate: user.jobDetails?.joiningDate || '2023-01-01',
          },
          attendance: {
            todayStatus: 'present',
            workingHours: 0,
            weeklyAttendance: 0,
            monthlyAttendance: 0,
            overtimeHours: 0,
          },
          leaveInfo: {
            availableLeaves: { annual: 0, sick: 0, personal: 0, emergency: 0 },
            usedLeaves: { annual: 0, sick: 0, personal: 0, emergency: 0 },
            pendingRequests: 0,
          },
          payroll: {
            currentSalary: user.salaryDetails?.basicSalary || 0,
            lastPayslip: { amount: 0, date: '', bonus: 0, deductions: 0 },
            ytdEarnings: 0,
            taxSavings: 0,
            nextPayday: '',
          },
          performance: {
            currentRating: 0,
            goals: { completed: 0, pending: 0, overdue: 0 },
            lastReviewDate: '',
            nextReviewDate: '',
            achievements: 0,
            skillsProgress: [],
          },
          recentActivities: [],
          notifications: [],
          workMetrics: [],
        });
      }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return theme.palette.success.main;
      case 'late': return theme.palette.warning.main;
      case 'absent': return theme.palette.error.main;
      case 'wfh': return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const leaveData = [
    { name: 'Annual', available: dashboardData.leaveInfo.availableLeaves.annual, used: dashboardData.leaveInfo.usedLeaves.annual },
    { name: 'Sick', available: dashboardData.leaveInfo.availableLeaves.sick, used: dashboardData.leaveInfo.usedLeaves.sick },
    { name: 'Personal', available: dashboardData.leaveInfo.availableLeaves.personal, used: dashboardData.leaveInfo.usedLeaves.personal },
    { name: 'Emergency', available: dashboardData.leaveInfo.availableLeaves.emergency, used: dashboardData.leaveInfo.usedLeaves.emergency },
  ];

  return (
    <Box>
      {/* Welcome Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Welcome back, {dashboardData.profile.firstName}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {dashboardData.profile.designation} • {dashboardData.profile.department} • ID: {dashboardData.profile.employeeId}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchEmployeeDashboardData}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<RequestPage />}
              onClick={() => navigate('/employee/leave/apply')}
            >
              Request Leave
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Today's Status */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: getStatusColor(dashboardData.attendance.todayStatus) }}>
                  <CheckIn />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold" textTransform="capitalize">
                    {dashboardData.attendance.todayStatus === 'wfh' ? 'Work From Home' : dashboardData.attendance.todayStatus}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today's Status
                  </Typography>
                  {dashboardData.attendance.checkInTime && (
                    <Typography variant="caption" color="text.secondary">
                      In: {dashboardData.attendance.checkInTime}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Working Hours */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <Timer />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.attendance.workingHours}h
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hours Today
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    +{dashboardData.attendance.overtimeHours}h overtime this month
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Leaves */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                  <EventNote />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.leaveInfo.pendingRequests}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Requests
                  </Typography>
                  <Button size="small" variant="text" onClick={() => navigate('/employee/leaves')}>
                    View All
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Next Payslip */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                  <MonetizationOn />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    ${(dashboardData.payroll.currentSalary / 12).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Salary
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Next: {dashboardData.payroll.nextPayday}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Work Performance Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Weekly Performance
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData.workMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="hoursWorked" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="productivity" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Leave Balance */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Leave Balance
              </Typography>
              <Stack spacing={2}>
                {leaveData.map((leave, index) => (
                  <Box key={leave.name}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">{leave.name}</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {leave.available - leave.used}/{leave.available}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={((leave.available - leave.used) / leave.available) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: COLORS[index % COLORS.length],
                        },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Overview */}
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
                      {dashboardData.performance.currentRating}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Current Rating
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h3" fontWeight="bold" color="success.main">
                      {dashboardData.performance.goals.completed}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Goals Completed
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h3" fontWeight="bold" color="warning.main">
                      {dashboardData.performance.goals.pending}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Goals Pending
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h3" fontWeight="bold" color="info.main">
                      {dashboardData.performance.achievements}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Achievements
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Skills Progress */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Skill Development
              </Typography>
              <Stack spacing={2}>
                {dashboardData.performance.skillsProgress.map((skill) => (
                  <Box key={skill.skill}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">{skill.skill}</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {skill.progress}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={skill.progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: skill.progress >= 80 ? theme.palette.success.main :
                                  skill.progress >= 60 ? theme.palette.warning.main :
                                  theme.palette.error.main,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Activities
                </Typography>
                <Button size="small" onClick={() => navigate('/employee/activities')}>
                  View All
                </Button>
              </Stack>
              <List>
                {dashboardData.recentActivities.map((activity) => (
                  <ListItem key={activity.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      {activity.type === 'attendance' && <Schedule color="primary" />}
                      {activity.type === 'leave' && <EventNote color="warning" />}
                      {activity.type === 'training' && <School color="info" />}
                      {activity.type === 'performance' && <Star color="success" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.description}
                      secondary={activity.timestamp}
                    />
                    <Chip
                      label={activity.status}
                      size="small"
                      color={activity.status === 'completed' || activity.status === 'approved' ? 'success' : 'default'}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Notifications
                </Typography>
                <Button size="small" onClick={() => navigate('/employee/notifications')}>
                  View All
                </Button>
              </Stack>
              <List>
                {dashboardData.notifications.map((notification) => (
                  <ListItem key={notification.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      {notification.type === 'info' && <Info color="info" />}
                      {notification.type === 'warning' && <Warning color="warning" />}
                      {notification.type === 'success' && <CheckCircle color="success" />}
                      {notification.type === 'error' && <Warning color="error" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={notification.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {notification.timestamp}
                          </Typography>
                        </Box>
                      }
                    />
                    {!notification.read && (
                      <Chip label="New" size="small" color="primary" />
                    )}
                  </ListItem>
                ))}
              </List>
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
                    startIcon={<RequestPage />}
                    onClick={() => navigate('/employee/leave/apply')}
                  >
                    Apply Leave
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Receipt />}
                    onClick={() => navigate('/employee/payslips')}
                  >
                    View Payslips
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => navigate('/employee/profile')}
                  >
                    Update Profile
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<School />}
                    onClick={() => navigate('/employee/training')}
                  >
                    Training
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Assessment />}
                    onClick={() => navigate('/employee/performance')}
                  >
                    Performance
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Schedule />}
                    onClick={() => navigate('/employee/attendance')}
                  >
                    Attendance
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

export default EmployeeDashboardNew;

interface DashboardData {
  personalStats: {
    totalLeaves: number;
    pendingLeaves: number;
    approvedLeaves: number;
    remainingLeaves: number;
  };
  currentSalary: number;
  nextPayday: string;
  recentActivities: any[];
  leaveBalance: {
    casual: number;
    sick: number;
    annual: number;
  };
  attendanceThisMonth: number;
  profile: any;
  certifications: any;
  attendance: any;
}

const EmployeeDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Attendance state
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [todaysAttendance, setTodaysAttendance] = useState<any>(null);
  
  // Dialog states
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  // New certification form state
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuingOrganization: '',
    issueDate: '',
    expirationDate: '',
    category: '',
    description: '',
  });

  useEffect(() => {
    fetchDashboardData();
    fetchTodaysAttendance();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchTodaysAttendance();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const data = await dashboardAPI.getEmployeeDashboard();
      setDashboardData(data);
    } catch (error: any) {
      console.error('Error fetching employee dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaysAttendance = async () => {
    try {
      const attendance = await attendanceAPI.getTodaysAttendance();
      setTodaysAttendance(attendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    setAttendanceLoading(true);
    try {
      await attendanceAPI.checkIn();
      await fetchTodaysAttendance();
      showSnackbar('Checked in successfully!', 'success');
    } catch (error) {
      console.error('Error checking in:', error);
      showSnackbar('Error checking in', 'error');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setAttendanceLoading(true);
    try {
      await attendanceAPI.checkOut();
      await fetchTodaysAttendance();
      showSnackbar('Checked out successfully!', 'success');
    } catch (error) {
      console.error('Error checking out:', error);
      showSnackbar('Error checking out', 'error');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) return;

    try {
      await profileAPI.uploadPhoto(selectedFile);
      await fetchDashboardData();
      setPhotoDialogOpen(false);
      setSelectedFile(null);
      showSnackbar('Profile photo updated successfully!', 'success');
    } catch (error) {
      console.error('Error uploading photo:', error);
      showSnackbar('Error uploading photo', 'error');
    }
  };

  const handleCertificationSubmit = async () => {
    try {
      await certificationsAPI.create(newCertification);
      await fetchDashboardData();
      setCertDialogOpen(false);
      setNewCertification({
        name: '',
        issuingOrganization: '',
        issueDate: '',
        expirationDate: '',
        category: '',
        description: '',
      });
      showSnackbar('Certification added successfully!', 'success');
    } catch (error) {
      console.error('Error adding certification:', error);
      showSnackbar('Error adding certification', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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
          Welcome back, {user?.profile?.firstName || dashboardData?.profile?.firstName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's your personal dashboard with real-time updates
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Personal Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <EventNoteIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{dashboardData?.personalStats?.totalLeaves || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Leave Requests
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                  <PendingIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{dashboardData?.personalStats?.pendingLeaves || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Approvals
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{dashboardData?.personalStats?.remainingLeaves || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Remaining Leaves
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{dashboardData?.attendanceThisMonth || 0}%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Attendance Rate
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Attendance - Enhanced */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon color="primary" />
                Today's Attendance
              </Typography>

              {todaysAttendance ? (
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Check In:</Typography>
                    <Typography variant="body2">
                      {todaysAttendance.checkIn ? new Date(todaysAttendance.checkIn).toLocaleTimeString() : 'Not checked in'}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Check Out:</Typography>
                    <Typography variant="body2">
                      {todaysAttendance.checkOut ? new Date(todaysAttendance.checkOut).toLocaleTimeString() : 'Not checked out'}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2">Hours Worked:</Typography>
                    <Typography variant="body2">
                      {todaysAttendance.hoursWorked ? `${todaysAttendance.hoursWorked.toFixed(2)} hrs` : '0 hrs'}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" mb={2}>
                  No attendance record for today
                </Typography>
              )}

              <Stack direction="row" spacing={1} mb={2}>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={handleCheckIn}
                  disabled={attendanceLoading || todaysAttendance?.checkIn}
                  startIcon={<CheckCircleIcon />}
                >
                  Check In
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={handleCheckOut}
                  disabled={attendanceLoading || !todaysAttendance?.checkIn || todaysAttendance?.checkOut}
                  startIcon={<Cancel />}
                >
                  Check Out
                </Button>
              </Stack>

              {/* Monthly Attendance Progress */}
              <Box>
                <Typography variant="body2" gutterBottom>
                  Monthly Attendance Progress
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={dashboardData?.attendance?.monthlyProgress || 0}
                  sx={{ height: 8, borderRadius: 1, mb: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {dashboardData?.attendance?.daysPresent || 0} / {dashboardData?.attendance?.workingDays || 22} days
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Management - Enhanced */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                Profile Management
              </Typography>
              
              <Stack spacing={2} alignItems="center">
                <Box position="relative">
                  <Avatar 
                    sx={{ width: 80, height: 80, bgcolor: theme.palette.primary.main }}
                    src={dashboardData?.profile?.profilePicture}
                  >
                    {(dashboardData?.profile?.firstName || user?.profile?.firstName)?.charAt(0)}
                    {(dashboardData?.profile?.lastName || user?.profile?.lastName)?.charAt(0)}
                  </Avatar>
                  <IconButton 
                    size="small" 
                    sx={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'background.paper' }}
                    onClick={() => setPhotoDialogOpen(true)}
                  >
                    <PhotoCamera fontSize="small" />
                  </IconButton>
                </Box>
                
                <Box textAlign="center">
                  <Typography variant="h6">
                    {dashboardData?.profile?.firstName || user?.profile?.firstName} {dashboardData?.profile?.lastName || user?.profile?.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dashboardData?.profile?.jobTitle || user?.jobDetails?.designation} • {dashboardData?.profile?.department || user?.jobDetails?.department}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {dashboardData?.profile?.employeeId}
                  </Typography>
                </Box>
                
                <Stack direction="row" spacing={1} width="100%">
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    startIcon={<PersonIcon />}
                    onClick={() => navigate('/profile')}
                  >
                    Edit Profile
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Certifications - Enhanced */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon color="primary" />
                Certifications & Skills
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload your certifications to improve salary predictions and career growth
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Current Certifications ({dashboardData?.certifications?.total || 0})
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" gap={1}>
                    {dashboardData?.certifications?.categories?.map((category: any) => (
                      <Chip 
                        key={category.name}
                        label={`${category.name} (${category.count})`} 
                        size="small" 
                        color="primary" 
                      />
                    )) || [
                      <Chip key="default" label="No certifications yet" size="small" variant="outlined" />
                    ]}
                  </Stack>
                </Box>
                
                <Divider />
                
                <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
                  <Button
                    variant="contained"
                    startIcon={<Upload />}
                    onClick={() => setCertDialogOpen(true)}
                  >
                    Add Certificate
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/certifications')}
                  >
                    Manage All
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => navigate('/salary-prediction')}
                  >
                    Salary Prediction
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Leave Balance */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Leave Balance
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Casual Leave</Typography>
                    <Chip 
                      label={`${dashboardData?.leaveBalance?.casual || 0} days`}
                      size="small"
                      color="primary"
                    />
                  </Stack>
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Sick Leave</Typography>
                    <Chip 
                      label={`${dashboardData?.leaveBalance?.sick || 0} days`}
                      size="small"
                      color="secondary"
                    />
                  </Stack>
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Annual Leave</Typography>
                    <Chip 
                      label={`${dashboardData?.leaveBalance?.annual || 0} days`}
                      size="small"
                      color="success"
                    />
                  </Stack>
                </Box>
              </Stack>
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mt: 2 }}
                onClick={() => navigate('/leaves')}
              >
                Apply for Leave
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Salary Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Salary Information
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Current Monthly Salary
                  </Typography>
                  <Typography variant="h5" color="primary">
                    ₹{dashboardData?.currentSalary?.toLocaleString('en-IN') || '0'}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Next Payday
                  </Typography>
                  <Typography variant="body1">
                    {dashboardData?.nextPayday || 'Not scheduled'}
                  </Typography>
                </Box>
              </Stack>
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mt: 2 }}
                onClick={() => navigate('/payroll')}
              >
                View Payslips
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions for Employees */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Employee Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<EventNoteIcon />}
                  onClick={() => navigate('/leaves/apply')}
                >
                  Apply Leave
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ScheduleIcon />}
                  onClick={() => navigate('/attendance')}
                >
                  View Attendance
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PaymentIcon />}
                  onClick={() => navigate('/payroll/my-payslips')}
                >
                  My Payslips
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<SchoolIcon />}
                  onClick={() => navigate('/certifications')}
                >
                  Certifications
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Photo Upload Dialog */}
      <Dialog open={photoDialogOpen} onClose={() => setPhotoDialogOpen(false)}>
        <DialogTitle>Update Profile Photo</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input
              accept="image/*"
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              style={{ marginBottom: 16 }}
            />
            {selectedFile && (
              <Typography variant="body2" color="text.secondary">
                Selected: {selectedFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhotoDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePhotoUpload} variant="contained" disabled={!selectedFile}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Certification Dialog */}
      <Dialog open={certDialogOpen} onClose={() => setCertDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Certification</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Certification Name"
              value={newCertification.name}
              onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Issuing Organization"
              value={newCertification.issuingOrganization}
              onChange={(e) => setNewCertification(prev => ({ ...prev, issuingOrganization: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Category"
              select
              value={newCertification.category}
              onChange={(e) => setNewCertification(prev => ({ ...prev, category: e.target.value }))}
              fullWidth
            >
              <MenuItem value="Technical">Technical</MenuItem>
              <MenuItem value="Management">Management</MenuItem>
              <MenuItem value="Language">Language</MenuItem>
              <MenuItem value="Safety">Safety</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
            <TextField
              label="Issue Date"
              type="date"
              value={newCertification.issueDate}
              onChange={(e) => setNewCertification(prev => ({ ...prev, issueDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Expiration Date"
              type="date"
              value={newCertification.expirationDate}
              onChange={(e) => setNewCertification(prev => ({ ...prev, expirationDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Description"
              multiline
              rows={3}
              value={newCertification.description}
              onChange={(e) => setNewCertification(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCertDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCertificationSubmit} variant="contained">
            Add Certification
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployeeDashboard;
