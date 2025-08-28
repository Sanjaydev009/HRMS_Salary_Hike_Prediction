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
  // Additional fields for API integration
  personalStats?: {
    totalLeaves: number;
    pendingLeaves: number;
    approvedLeaves: number;
    remainingLeaves: number;
  };
  leaveBalance?: {
    casual: number;
    sick: number;
    annual: number;
  };
  attendanceThisMonth?: number;
  certifications?: {
    total: number;
    categories: Array<{
      name: string;
      count: number;
    }>;
  };
}

const EmployeeDashboardNew: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<EmployeeDashboardData | null>(null);
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
    fetchEmployeeDashboardData();
    fetchTodaysAttendance();
    // Set up auto-refresh every 5 minutes for performance
    const interval = setInterval(() => {
      fetchEmployeeDashboardData();
      fetchTodaysAttendance();
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchEmployeeDashboardData = async () => {
    try {
      setError(null);
      
      // Initialize with user data
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
          currentSalary: 0,
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
        personalStats: {
          totalLeaves: 0,
          pendingLeaves: 0,
          approvedLeaves: 0,
          remainingLeaves: 0,
        },
        leaveBalance: {
          casual: 0,
          sick: 0,
          annual: 0,
        },
        attendanceThisMonth: 0,
        certifications: {
          total: 0,
          categories: [],
        }
      };

      // Fetch leave balance data
      try {
        const leaveResponse = await fetch('/api/leaves/balance/me', {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (leaveResponse.ok) {
          const leaveData = await leaveResponse.json();
          if (leaveData.success) {
            dashboardData.leaveBalance = leaveData.balance || dashboardData.leaveBalance;
            dashboardData.leaveInfo.availableLeaves = leaveData.balance || dashboardData.leaveInfo.availableLeaves;
          }
        }
      } catch (leaveError) {
        console.warn('Failed to fetch leave balance:', leaveError);
      }

      // Fetch dashboard statistics
      try {
        const dashboardResponse = await fetch('/api/dashboard/employee', {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (dashboardResponse.ok) {
          const dashData = await dashboardResponse.json();
          if (dashData.success) {
            dashboardData = { ...dashboardData, ...dashData.data };
          }
        }
      } catch (dashError) {
        console.warn('Failed to fetch dashboard data:', dashError);
      }

      setDashboardData(dashboardData);
    } catch (error: any) {
      console.error('Error fetching employee dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaysAttendance = async () => {
    try {
      const response = await fetch('/api/attendance/today', {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTodaysAttendance(data.attendance);
        }
      }
    } catch (error) {
      console.warn('Error fetching today\'s attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    setAttendanceLoading(true);
    try {
      const response = await fetch('/api/attendance/checkin', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        await fetchTodaysAttendance();
        showSnackbar('Checked in successfully!', 'success');
      } else {
        throw new Error('Failed to check in');
      }
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
      const response = await fetch('/api/attendance/checkout', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        await fetchTodaysAttendance();
        showSnackbar('Checked out successfully!', 'success');
      } else {
        throw new Error('Failed to check out');
      }
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
      const formData = new FormData();
      formData.append('photo', selectedFile);
      
      const response = await fetch('/api/profile/photo', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (response.ok) {
        await fetchEmployeeDashboardData();
        setPhotoDialogOpen(false);
        setSelectedFile(null);
        showSnackbar('Profile photo updated successfully!', 'success');
      } else {
        throw new Error('Failed to upload photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      showSnackbar('Error uploading photo', 'error');
    }
  };

  const handleCertificationSubmit = async () => {
    try {
      const response = await fetch('/api/certifications', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCertification)
      });
      
      if (response.ok) {
        await fetchEmployeeDashboardData();
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
      } else {
        throw new Error('Failed to add certification');
      }
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
        <Button onClick={fetchEmployeeDashboardData} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
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
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<RequestPage />}
              onClick={() => navigate('/leaves')}
            >
              Request Leave
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Personal Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <EventNote />
                </Avatar>
                <Box>
                  <Typography variant="h6">{dashboardData.personalStats?.totalLeaves || 0}</Typography>
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
                  <Typography variant="h6">{dashboardData.leaveInfo.pendingRequests}</Typography>
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
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h6">{dashboardData.personalStats?.remainingLeaves || 0}</Typography>
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
                  <Typography variant="h6">{dashboardData.attendanceThisMonth || 0}%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Attendance Rate
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Attendance */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule color="primary" />
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
                  startIcon={<CheckCircle />}
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
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Management */}
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
                    src={dashboardData.profile.profilePicture}
                  >
                    {dashboardData.profile.firstName?.charAt(0)}
                    {dashboardData.profile.lastName?.charAt(0)}
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
                    {dashboardData.profile.firstName} {dashboardData.profile.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dashboardData.profile.designation} • {dashboardData.profile.department}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {dashboardData.profile.employeeId}
                  </Typography>
                </Box>
                
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
            </CardContent>
          </Card>
        </Grid>

        {/* Leave Balance */}
        <Grid item xs={12} md={6}>
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
                        {Math.max(0, leave.available - leave.used)}/{leave.available}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={leave.available > 0 ? ((leave.available - leave.used) / leave.available) * 100 : 0}
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

        {/* Work Performance Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Weekly Performance
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData.workMetrics || []}>
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

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<EventNote />}
                  onClick={() => navigate('/leaves')}
                >
                  Apply Leave
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Schedule />}
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
                  onClick={() => navigate('/payroll')}
                >
                  My Payslips
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<School />}
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

export default EmployeeDashboardNew;
