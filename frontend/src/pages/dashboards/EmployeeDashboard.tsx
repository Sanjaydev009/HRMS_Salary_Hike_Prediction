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
  Divider,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  EventNote as EventNoteIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  TrendingUp as TrendingUpIcon,
  PhotoCamera,
  Upload,
  School as SchoolIcon,
  Cancel,
  Edit as EditIcon,
  AccountBalanceWallet as PayrollIcon,
  Download as DownloadIcon,
  Receipt as ReceiptIcon,
  Refresh as RefreshIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  dashboardAPI, 
  profileAPI, 
  certificationsAPI, 
  attendanceAPI 
} from '../../services/api';
import ProfileUpdateDialog from '../../components/profile/ProfileUpdateDialog';

// Payroll Section Component for Employee Dashboard
const PayrollSection: React.FC<{ userEmployeeId?: string }> = ({ userEmployeeId }) => {
  const [payrollRecords, setPayrollRecords] = useState<any[]>([]);
  const [payrollLoading, setPayrollLoading] = useState(true);
  const [payrollError, setPayrollError] = useState<string | null>(null);
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const fetchPayrollRecords = async () => {
    try {
      setPayrollLoading(true);
      setPayrollError(null);
      
      const response = await fetch('/api/payroll/my', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payroll records');
      }

      const data = await response.json();
      if (data.success) {
        setPayrollRecords(data.data.payrollRecords || []);
      } else {
        throw new Error(data.message || 'Failed to load payroll records');
      }
    } catch (error) {
      console.error('Error fetching payroll records:', error);
      setPayrollError(error instanceof Error ? error.message : 'Failed to load payroll records');
    } finally {
      setPayrollLoading(false);
    }
  };

  const downloadPayslip = async (payrollId: string, month: number, year: number) => {
    try {
      const response = await fetch(`/api/payroll/${payrollId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download payslip');
      }

      const data = await response.json();
      if (data.success) {
        // Create a simple payslip download (in a real app, this would be a PDF)
        const payslipData = data.data.payroll;
        const payslipContent = `
PAYSLIP - ${month}/${year}
========================
Employee: ${payslipData.employeeId?.profile?.firstName} ${payslipData.employeeId?.profile?.lastName}
Employee ID: ${payslipData.employeeId?.employeeId}
Department: ${payslipData.employeeId?.jobDetails?.department}

EARNINGS
--------
Basic Salary: ${formatCurrency(payslipData.basicSalary || 0)}
Allowances: ${formatCurrency(payslipData.allowances?.housing + payslipData.allowances?.transport + payslipData.allowances?.medical + payslipData.allowances?.other || 0)}
Overtime: ${formatCurrency(payslipData.allowances?.overtime || 0)}
GROSS SALARY: ${formatCurrency(payslipData.calculations?.grossSalary || 0)}

DEDUCTIONS
----------
Tax: ${formatCurrency(payslipData.deductions?.tax || 0)}
Insurance: ${formatCurrency(payslipData.deductions?.insurance || 0)}
Provident Fund: ${formatCurrency(payslipData.deductions?.providentFund || 0)}
Other: ${formatCurrency(payslipData.deductions?.other || 0)}
TOTAL DEDUCTIONS: ${formatCurrency(payslipData.calculations?.totalDeductions || 0)}

NET SALARY: ${formatCurrency(payslipData.calculations?.netSalary || 0)}

ATTENDANCE
----------
Working Days: ${payslipData.attendance?.workingDays || 0}
Present Days: ${payslipData.attendance?.presentDays || 0}
Attendance %: ${payslipData.attendance?.attendancePercentage || 0}%

Payment Status: ${payslipData.paymentDetails?.status?.toUpperCase() || 'PENDING'}
Generated: ${new Date(payslipData.createdAt).toLocaleDateString()}
        `;

        // Create and download the file
        const blob = new Blob([payslipContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Payslip_${month}_${year}_${payslipData.employeeId?.employeeId}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading payslip:', error);
      alert('Failed to download payslip');
    }
  };

  React.useEffect(() => {
    fetchPayrollRecords();
  }, []);

  return (
    <Card elevation={2}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PayrollIcon color="primary" />
            My Payroll & Salary Records
          </Typography>
          <Chip 
            label="Real-time" 
            size="small" 
            color="success" 
            variant="outlined"
          />
        </Stack>

        {payrollLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : payrollError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {payrollError}
          </Alert>
        ) : payrollRecords.length === 0 ? (
          <Box textAlign="center" py={4}>
            <ReceiptIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Payroll Records Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Your payroll records will appear here once they are generated by HR
            </Typography>
            <Button 
              variant="outlined" 
              onClick={fetchPayrollRecords}
              startIcon={<TrendingUpIcon />}
            >
              Refresh Records
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              View and download your salary slips. All amounts are in Indian Rupees (₹).
            </Typography>

            <Grid container spacing={2}>
              {payrollRecords.slice(0, 6).map((record) => (
                <Grid item xs={12} sm={6} md={4} key={record._id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      transition: 'all 0.2s',
                      '&:hover': { 
                        boxShadow: 2, 
                        transform: 'translateY(-2px)' 
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2" fontWeight="bold">
                            {record.payPeriod?.month}/{record.payPeriod?.year}
                          </Typography>
                          <Chip 
                            label={record.paymentDetails?.status || 'pending'} 
                            size="small" 
                            color={
                              record.paymentDetails?.status === 'paid' ? 'success' : 
                              record.paymentDetails?.status === 'processed' ? 'warning' : 
                              'default'
                            }
                          />
                        </Stack>

                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Net Salary
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            {formatCurrency(record.calculations?.netSalary || 0)}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Attendance: {record.attendance?.presentDays || 0}/{record.attendance?.workingDays || 22} days
                          </Typography>
                        </Box>

                        <Stack direction="row" spacing={1} mt={1}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() => downloadPayslip(
                              record._id, 
                              record.payPeriod?.month, 
                              record.payPeriod?.year
                            )}
                            fullWidth
                          >
                            Download
                          </Button>
                        </Stack>

                        <Typography variant="caption" color="text.secondary">
                          Generated: {new Date(record.createdAt).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {payrollRecords.length > 6 && (
              <Box textAlign="center" mt={2}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/payroll')}
                  startIcon={<ReceiptIcon />}
                >
                  View All Payroll Records ({payrollRecords.length})
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                size="small"
                startIcon={<TrendingUpIcon />}
                onClick={fetchPayrollRecords}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ReceiptIcon />}
                onClick={() => navigate('/payroll')}
              >
                All Records
              </Button>
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

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
  
  // Salary prediction state
  const [salaryPrediction, setSalaryPrediction] = useState<any>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  
  // Real-time updates
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Dialog states
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
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
    category: 'Technical',
    skillLevel: 'Intermediate',
    description: '',
  });

  useEffect(() => {
    fetchDashboardData();
    fetchTodaysAttendance();
    fetchSalaryPrediction();
    // Enhanced real-time updates every 15 seconds for better responsiveness
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchTodaysAttendance();
      setLastUpdate(new Date());
      console.log('Dashboard data refreshed at:', new Date().toLocaleTimeString());
    }, 15000); // Reduced from 30 seconds to 15 seconds for better real-time experience
    return () => clearInterval(interval);
  }, []);

  // Enhanced real-time data refresh function
  const refreshAllData = async () => {
    setLoading(true);
    try {
      console.log('Manual refresh initiated at:', new Date().toLocaleTimeString());
      await Promise.all([
        fetchDashboardData(),
        fetchTodaysAttendance(),
        fetchSalaryPrediction()
      ]);
      setLastUpdate(new Date());
      setSnackbar({
        open: true,
        message: 'Dashboard data refreshed successfully at ' + new Date().toLocaleTimeString(),
        severity: 'success'
      });
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
      setSnackbar({
        open: true,
        message: 'Error refreshing dashboard data - please try again',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Enhanced navigation with proper error handling
  const handleNavigate = (path: string, title?: string) => {
    try {
      navigate(path);
      if (title) {
        setSnackbar({
          open: true,
          message: `Navigating to ${title}...`,
          severity: 'success'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Navigation error occurred',
        severity: 'error'
      });
    }
  };

  // Keyboard shortcuts for navigation - Following Sidebar Structure
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            handleNavigate('/employee/today-attendance', "Today's Attendance");
            break;
          case '2':
            event.preventDefault();
            handleNavigate('/employee/profile', 'My Profile');
            break;
          case '3':
            event.preventDefault();
            handleNavigate('/employee/my-certifications', 'Certifications & Skills');
            break;
          case '4':
            event.preventDefault();
            handleNavigate('/employee/my-leave-balance', 'Leave Balance');
            break;
          case '5':
            event.preventDefault();
            handleNavigate('/employee/leave/apply', 'Apply Leave');
            break;
          case '6':
            event.preventDefault();
            handleNavigate('/employee/leaves', 'My Leaves');
            break;
          case '7':
            event.preventDefault();
            handleNavigate('/employee/quick-actions', 'Quick Actions');
            break;
          case '8':
            event.preventDefault();
            handleNavigate('/employee/payroll', 'Payroll');
            break;
          case 'r':
          case 'R':
            event.preventDefault();
            refreshAllData();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Auto-refresh data when browser tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshAllData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      console.log('Fetching dashboard data at:', new Date().toLocaleTimeString());
      
      // Add cache busting to ensure fresh data
      const timestamp = new Date().getTime();
      const data = await dashboardAPI.getUserDashboard();
      setDashboardData(data);
      
      console.log('Dashboard data fetched successfully:', data);
    } catch (error: any) {
      console.error('Error fetching employee dashboard data:', error);
      if (error.response?.status === 401) {
        setError('Unable to determine user role. Please log in again.');
      } else {
        setError('Failed to load dashboard data - ' + (error.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSalaryPrediction = async () => {
    try {
      setPredictionLoading(true);
      
      // First check if ML service is available
      const statusResponse = await fetch('http://localhost:8001/model/status');
      if (!statusResponse.ok) {
        throw new Error('ML service unavailable');
      }
      
      // Get user certifications and other data
      const token = localStorage.getItem('token');
      
      const [certResponse, attendanceResponse] = await Promise.all([
        fetch('http://localhost:5001/api/certifications/my', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5001/api/attendance/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      const certData = await certResponse.json();
      const attendanceData = await attendanceResponse.json();
      
      // Prepare ML request with real-time data
      const mlRequest = {
        employee_data: {
          department: user?.jobDetails?.department || dashboardData?.profile?.department || 'Unknown',
          designation: user?.jobDetails?.designation || dashboardData?.profile?.jobTitle || 'Unknown',
          experience_years: dashboardData?.profile?.experience || 2,
          performance_rating: dashboardData?.profile?.performanceRating || 3.5,
          education_level: dashboardData?.profile?.education || 'Bachelor',
          location: dashboardData?.profile?.location || 'Office',
          current_salary: dashboardData?.currentSalary || dashboardData?.profile?.salary || 50000,
          attendance_metrics: {
            attendance_rate: attendanceData.data?.attendanceRate || dashboardData?.attendanceThisMonth || 85,
            average_hours_per_day: 8,
            punctuality_score: 85,
            remote_work_percentage: 25,
            overtime_hours_monthly: 10,
            consistency_score: 75
          },
          certification_data: {
            total_certifications: certData.data?.stats?.total || dashboardData?.certifications?.total || 0,
            technical_certifications: certData.data?.stats?.categories?.Technical || 0,
            management_certifications: certData.data?.stats?.categories?.Management || 0,
            leadership_certifications: certData.data?.stats?.categories?.Leadership || 0,
            certification_impact_score: (certData.data?.stats?.total || 0) * 15,
            recent_certifications: certData.data?.stats?.total || 0,
            expired_certifications: 0,
            certification_diversity_score: Object.keys(certData.data?.stats?.categories || {}).length * 25
          },
          project_completion_rate: dashboardData?.profile?.projectCompletionRate || 85,
          team_size_managed: dashboardData?.profile?.teamSize || 0,
          revenue_generated: dashboardData?.profile?.revenueGenerated || 0
        }
      };

      // Call ML service for real-time prediction
      const mlResponse = await fetch('http://localhost:8001/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mlRequest)
      });

      if (!mlResponse.ok) {
        throw new Error('ML prediction failed');
      }

      const prediction = await mlResponse.json();
      setSalaryPrediction(prediction);
      
    } catch (error) {
      console.error('Error fetching real-time salary prediction:', error);
      // Fallback to backend API
      try {
        const prediction = await certificationsAPI.getSalaryPrediction();
        setSalaryPrediction({
          predicted_salary: prediction.data.predictedSalary || prediction.data.currentSalary,
          confidence_score: 75,
          recommendations: prediction.data.recommendations || [],
          performance_indicators: {
            overall_performance: Math.min(100, (prediction.data.totalCertifications || 0) * 20 + 60),
            skill_advancement: Math.min(100, (prediction.data.totalCertifications || 0) * 15 + 40),
            growth_potential: Math.min(100, (prediction.data.increasePercentage || 0) * 2 + 50)
          }
        });
      } catch (fallbackError) {
        console.error('Fallback prediction also failed:', fallbackError);
      }
    } finally {
      setPredictionLoading(false);
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
      await fetchDashboardData(); // Refresh real-time dashboard data
      showSnackbar('✅ Checked in successfully! HR has been notified.', 'success');
      setLastUpdate(new Date()); // Update real-time timestamp
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
      await fetchDashboardData(); // Refresh real-time dashboard data
      showSnackbar('✅ Checked out successfully!', 'success');
      setLastUpdate(new Date()); // Update real-time timestamp
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
        category: 'Technical',
        skillLevel: 'Intermediate',
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
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
      {/* Welcome Header - Enhanced with Real-time Controls */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" gutterBottom>
              Welcome back, {user?.profile?.firstName || dashboardData?.profile?.firstName}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Here's your personal dashboard with real-time updates
            </Typography>
          </Box>
          <Box textAlign="right">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box textAlign="right">
                <Typography variant="caption" color="text.secondary">
                  🔄 Last updated: {lastUpdate?.toLocaleTimeString() || 'Loading...'}
                </Typography>
                <br />
                <Chip 
                  label={loading ? "Updating..." : "Live Data"} 
                  size="small" 
                  color={loading ? "warning" : "success"}
                  variant="outlined"
                  sx={{ mt: 0.5 }}
                />
              </Box>
              <Tooltip title={
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>Keyboard Shortcuts (Sidebar Navigation):</Typography>
                  <Typography variant="caption" component="div">• Ctrl+1: Today's Attendance</Typography>
                  <Typography variant="caption" component="div">• Ctrl+2: My Profile</Typography>
                  <Typography variant="caption" component="div">• Ctrl+3: Certifications & Skills</Typography>
                  <Typography variant="caption" component="div">• Ctrl+4: Leave Balance</Typography>
                  <Typography variant="caption" component="div">• Ctrl+5: Apply Leave</Typography>
                  <Typography variant="caption" component="div">• Ctrl+6: My Leaves</Typography>
                  <Typography variant="caption" component="div">• Ctrl+7: Quick Actions</Typography>
                  <Typography variant="caption" component="div">• Ctrl+8: Payroll</Typography>
                  <Typography variant="caption" component="div">• Ctrl+R: Refresh Data</Typography>
                </Box>
              }>
                <IconButton size="small">
                  <HelpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={refreshAllData}
                disabled={loading}
                sx={{ minWidth: 'auto' }}
              >
                {loading ? 'Updating...' : 'Refresh'}
              </Button>
            </Stack>
          </Box>
        </Stack>
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

        {/* Quick Navigation Panel - Following Sidebar Navigation Structure */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon color="primary" />
              Quick Navigation & Real-time Access - Sidebar Routes
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  size="small"
                  startIcon={<ScheduleIcon />}
                  onClick={() => handleNavigate('/employee/today-attendance', "Today's Attendance")}
                  sx={{ py: 1 }}
                >
                  Today's Attendance
                </Button>
              </Grid>
              <Grid item xs={6} sm={4} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  size="small"
                  startIcon={<PersonIcon />}
                  onClick={() => handleNavigate('/employee/profile', 'My Profile')}
                  sx={{ py: 1 }}
                >
                  My Profile
                </Button>
              </Grid>
              <Grid item xs={6} sm={4} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  size="small"
                  startIcon={<SchoolIcon />}
                  onClick={() => handleNavigate('/employee/my-certifications', 'Certifications & Skills')}
                  sx={{ py: 1 }}
                >
                  Certifications & Skills
                </Button>
              </Grid>
              <Grid item xs={6} sm={4} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  size="small"
                  startIcon={<EventNoteIcon />}
                  onClick={() => handleNavigate('/employee/my-leave-balance', 'Leave Balance')}
                  sx={{ py: 1 }}
                >
                  Leave Balance
                </Button>
              </Grid>
              <Grid item xs={6} sm={4} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  size="small"
                  startIcon={<EventNoteIcon />}
                  onClick={() => handleNavigate('/employee/leave/apply', 'Apply Leave')}
                  sx={{ py: 1 }}
                >
                  Apply Leave
                </Button>
              </Grid>
              <Grid item xs={6} sm={4} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  size="small"
                  startIcon={<EventNoteIcon />}
                  onClick={() => handleNavigate('/employee/leaves', 'My Leaves')}
                  sx={{ py: 1 }}
                >
                  My Leaves
                </Button>
              </Grid>
              <Grid item xs={6} sm={4} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  size="small"
                  startIcon={<TrendingUpIcon />}
                  onClick={() => handleNavigate('/employee/quick-actions', 'Quick Actions')}
                  sx={{ py: 1 }}
                >
                  Quick Actions
                </Button>
              </Grid>
              <Grid item xs={6} sm={4} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  size="small"
                  startIcon={<PayrollIcon />}
                  onClick={() => handleNavigate('/employee/payroll', 'Payroll')}
                  sx={{ py: 1 }}
                >
                  Payroll
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Today's Attendance - Enhanced with Real-Time Updates */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon color="primary" />
                  Today's Attendance
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                        '100%': { opacity: 1 },
                      },
                    }}
                  />
                  <Typography variant="caption" color="success.main">
                    Live
                  </Typography>
                </Stack>
              </Stack>

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

              {/* Quick Navigation */}
              <Stack direction="row" spacing={1} mt={2}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleNavigate('/employee/today-attendance', 'Attendance Details')}
                >
                  View Details
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => handleNavigate('/employee/attendance', 'Attendance History')}
                >
                  Full History
                </Button>
              </Stack>
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
                    startIcon={<EditIcon />}
                    onClick={() => setProfileDialogOpen(true)}
                  >
                    Edit Profile
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

      

        {/* Leave Balance - Enhanced with Real-time Updates */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventNoteIcon color="primary" />
                  Leave Balance
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                        '100%': { opacity: 1 },
                      },
                    }}
                  />
                  <Typography variant="caption" color="success.main">
                    Live
                  </Typography>
                </Stack>
              </Stack>

              {/* Real-time Leave Balance Display */}
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                      Casual Leave
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Chip 
                        label={`${dashboardData?.leaveBalance?.casual || 0} days`}
                        size="small"
                        color="primary"
                        variant={(dashboardData?.leaveBalance?.casual || 0) > 0 ? "filled" : "outlined"}
                      />
                      {(dashboardData?.leaveBalance?.casual || 0) <= 2 && (dashboardData?.leaveBalance?.casual || 0) > 0 && (
                        <Typography variant="caption" color="warning.main">
                          Low
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((dashboardData?.leaveBalance?.casual || 0) / 12 * 100, 100)}
                    sx={{ height: 4, borderRadius: 2, mt: 0.5, mb: 1 }}
                    color="primary"
                  />
                </Box>

                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'secondary.main' }} />
                      Sick Leave
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Chip 
                        label={`${dashboardData?.leaveBalance?.sick || 0} days`}
                        size="small"
                        color="secondary"
                        variant={(dashboardData?.leaveBalance?.sick || 0) > 0 ? "filled" : "outlined"}
                      />
                      {(dashboardData?.leaveBalance?.sick || 0) <= 2 && (dashboardData?.leaveBalance?.sick || 0) > 0 && (
                        <Typography variant="caption" color="warning.main">
                          Low
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((dashboardData?.leaveBalance?.sick || 0) / 10 * 100, 100)}
                    sx={{ height: 4, borderRadius: 2, mt: 0.5, mb: 1 }}
                    color="secondary"
                  />
                </Box>

                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                      Annual Leave
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Chip 
                        label={`${dashboardData?.leaveBalance?.annual || 0} days`}
                        size="small"
                        color="success"
                        variant={(dashboardData?.leaveBalance?.annual || 0) > 0 ? "filled" : "outlined"}
                      />
                      {(dashboardData?.leaveBalance?.annual || 0) <= 3 && (dashboardData?.leaveBalance?.annual || 0) > 0 && (
                        <Typography variant="caption" color="warning.main">
                          Low
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((dashboardData?.leaveBalance?.annual || 0) / 21 * 100, 100)}
                    sx={{ height: 4, borderRadius: 2, mt: 0.5, mb: 1 }}
                    color="success"
                  />
                </Box>
              </Stack>

              {/* Real-time Leave Statistics */}
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  📊 Real-time Leave Statistics
                </Typography>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="primary.main">
                      {(dashboardData?.leaveBalance?.casual || 0) + 
                       (dashboardData?.leaveBalance?.sick || 0) + 
                       (dashboardData?.leaveBalance?.annual || 0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Available
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h6" color="warning.main">
                      {dashboardData?.personalStats?.pendingLeaves || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pending Requests
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h6" color="success.main">
                      {dashboardData?.personalStats?.approvedLeaves || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      This Year
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Enhanced Action Buttons */}
              <Stack spacing={1} sx={{ mt: 2 }}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  startIcon={<EventNoteIcon />}
                  onClick={() => handleNavigate('/employee/leave/apply', 'Apply Leave')}
                  sx={{ 
                    py: 1.5,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)',
                    }
                  }}
                >
                  Apply for Leave
                </Button>
                
                <Stack direction="row" spacing={1}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    fullWidth
                    startIcon={<EventNoteIcon />}
                    onClick={() => handleNavigate('/employee/my-leave-balance', 'Leave Balance Details')}
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small"
                    fullWidth
                    startIcon={<ScheduleIcon />}
                    onClick={() => handleNavigate('/employee/leaves', 'My Leaves')}
                  >
                    Leave History
                  </Button>
                </Stack>
              </Stack>

              {/* Real-time Update Timestamp */}
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
                🕐 Last updated: {lastUpdate?.toLocaleTimeString() || 'Loading...'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Salary Prediction with Real-Time ML Data */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="primary" />
                  AI Salary Prediction
                </Typography>
                <Chip 
                  label={predictionLoading ? "Calculating..." : "Live ML"} 
                  size="small" 
                  color={predictionLoading ? "warning" : "success"} 
                  variant="outlined"
                />
              </Stack>
              
              {predictionLoading ? (
                <Box display="flex" flexDirection="column" alignItems="center" p={2}>
                  <CircularProgress size={32} />
                  <Typography variant="caption" sx={{ mt: 1 }}>
                    Real-time ML analysis...
                  </Typography>
                </Box>
              ) : salaryPrediction ? (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Predicted Salary
                    </Typography>
                    <Typography variant="h5" color="success.main">
                      {salaryPrediction.predicted_salary ? formatCurrency(salaryPrediction.predicted_salary) : 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Confidence: {salaryPrediction.confidence_score || 0}%
                    </Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Growth Potential
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(salaryPrediction.performance_indicators?.growth_potential || 0, 100)} 
                      sx={{ height: 8, borderRadius: 4, mb: 1 }}
                    />
                    <Typography variant="caption">
                      {Math.round(salaryPrediction.performance_indicators?.growth_potential || 0)}% potential
                    </Typography>
                  </Box>

                  {salaryPrediction.recommendations && salaryPrediction.recommendations.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        AI Recommendation
                      </Typography>
                      <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                        {typeof salaryPrediction.recommendations[0] === 'string' 
                          ? salaryPrediction.recommendations[0]
                          : salaryPrediction.recommendations[0]?.message || 'Continue developing your skills'
                        }
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Performance Indicators
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip 
                        label={`Skills: ${Math.round(salaryPrediction.performance_indicators?.skill_advancement || 0)}%`}
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                      <Chip 
                        label={`Overall: ${Math.round(salaryPrediction.performance_indicators?.overall_performance || 0)}%`}
                        size="small" 
                        color="secondary" 
                        variant="outlined"
                      />
                    </Stack>
                  </Box>
                </Stack>
              ) : (
                <Box textAlign="center" py={2}>
                  <Typography variant="body2" color="text.secondary">
                    Add data to see ML predictions
                  </Typography>
                </Box>
              )}
              
              <Stack direction="row" spacing={1} mt={2}>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<TrendingUpIcon />}
                  onClick={fetchSalaryPrediction}
                  disabled={predictionLoading}
                >
                  Refresh ML
                </Button>
                <Button 
                  variant="text" 
                  size="small"
                  startIcon={<SchoolIcon />}
                  onClick={() => navigate('/salary-prediction')}
                >
                  Full Analysis
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Leave Requests with HR Notes - NEW SECTION */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventNoteIcon color="primary" />
                  Recent Leave Requests
                </Typography>
                <Chip 
                  label="Real-time" 
                  size="small" 
                  color="success" 
                  variant="outlined"
                />
              </Stack>

              {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
                <Stack spacing={2}>
                  {dashboardData.recentActivities
                    .filter(activity => activity.type === 'leave_request')
                    .slice(0, 5)
                    .map((activity, index) => (
                    <Card 
                      key={activity.id || index} 
                      variant="outlined"
                      sx={{ 
                        border: activity.status === 'rejected' ? '1px solid #f44336' : 
                               activity.status === 'approved' ? '1px solid #4caf50' : 
                               '1px solid #ff9800',
                        backgroundColor: activity.status === 'rejected' ? '#ffebee' : 
                                       activity.status === 'approved' ? '#e8f5e8' : 
                                       '#fff3e0'
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                          <Box flex={1}>
                            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {activity.title}
                              </Typography>
                              <Chip 
                                label={activity.status} 
                                size="small" 
                                color={
                                  activity.status === 'approved' ? 'success' : 
                                  activity.status === 'rejected' ? 'error' : 
                                  'warning'
                                }
                              />
                            </Stack>
                            
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {activity.description}
                            </Typography>

                            {/* Display HR Notes prominently */}
                            {activity.hrNotes && (
                              <Alert 
                                severity={activity.status === 'approved' ? 'success' : 'error'} 
                                sx={{ mt: 1, fontSize: '0.875rem' }}
                              >
                                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                  HR Feedback:
                                </Typography>
                                <Typography variant="body2">
                                  {activity.hrNotes}
                                </Typography>
                              </Alert>
                            )}

                            {/* Backward compatibility with rejectionReason */}
                            {!activity.hrNotes && activity.rejectionReason && (
                              <Alert severity="error" sx={{ mt: 1, fontSize: '0.875rem' }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                  Rejection Reason:
                                </Typography>
                                <Typography variant="body2">
                                  {activity.rejectionReason}
                                </Typography>
                              </Alert>
                            )}

                            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                              Applied: {new Date(activity.timestamp).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}

                  <Box textAlign="center" mt={2}>
                    <Button 
                      variant="outlined" 
                      onClick={() => handleNavigate('/employee/leaves', 'My Leaves')}
                      startIcon={<EventNoteIcon />}
                    >
                      View All Leave Requests
                    </Button>
                  </Box>
                </Stack>
              ) : (
                <Box textAlign="center" py={4}>
                  <EventNoteIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Leave Requests Yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Your recent leave applications and HR feedback will appear here
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => handleNavigate('/employee/leave/apply', 'Apply Leave')}
                    startIcon={<EventNoteIcon />}
                  >
                    Apply for Leave
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Payroll & Salary Records - NEW SECTION */}
        <Grid item xs={12}>
          <PayrollSection userEmployeeId={user?.id} />
        </Grid>

        {/* Quick Actions for Employees - Following Sidebar Structure */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon color="primary" />
              Employee Quick Actions - Sidebar Navigation Routes
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Access all sidebar sections from here - exact same routes as sidebar
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<ScheduleIcon />}
                  onClick={() => handleNavigate('/employee/today-attendance', "Today's Attendance")}
                  sx={{ py: 1.5 }}
                >
                  Today's Attendance
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  startIcon={<PersonIcon />}
                  onClick={() => handleNavigate('/employee/profile', 'My Profile')}
                  sx={{ py: 1.5 }}
                >
                  My Profile
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  startIcon={<SchoolIcon />}
                  onClick={() => handleNavigate('/employee/my-certifications', 'Certifications & Skills')}
                  sx={{ py: 1.5 }}
                >
                  Certifications & Skills
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<EventNoteIcon />}
                  onClick={() => handleNavigate('/employee/my-leave-balance', 'Leave Balance')}
                  sx={{ py: 1.5 }}
                >
                  Leave Balance
                </Button>
              </Grid>
            </Grid>
            <Divider sx={{ my: 3 }} />
            <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EventNoteIcon />}
                onClick={() => handleNavigate('/employee/leave/apply', 'Apply Leave')}
              >
                Apply Leave
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EventNoteIcon />}
                onClick={() => handleNavigate('/employee/leaves', 'My Leaves')}
              >
                My Leaves
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<TrendingUpIcon />}
                onClick={() => handleNavigate('/employee/quick-actions', 'Quick Actions')}
              >
                Quick Actions
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PayrollIcon />}
                onClick={() => handleNavigate('/employee/payroll', 'Payroll')}
              >
                Payroll
              </Button>
            </Stack>
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

      {/* Profile Update Dialog */}
      <ProfileUpdateDialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        onProfileUpdated={() => {
          fetchDashboardData();
          showSnackbar('Profile updated successfully!', 'success');
        }}
        userProfile={user || dashboardData}
      />
    </Box>
  );
};

export default EmployeeDashboard;
