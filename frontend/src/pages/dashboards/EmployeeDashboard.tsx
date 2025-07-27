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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  dashboardAPI, 
  profileAPI, 
  certificationsAPI, 
  attendanceAPI 
} from '../../services/api';
import ProfileUpdateDialog from '../../components/profile/ProfileUpdateDialog';

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
    // Set up auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchTodaysAttendance();
      setLastUpdate(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const data = await dashboardAPI.getUserDashboard();
      setDashboardData(data);
    } catch (error: any) {
      console.error('Error fetching employee dashboard data:', error);
      if (error.response?.status === 401) {
        setError('Unable to determine user role. Please log in again.');
      } else {
        setError('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSalaryPrediction = async () => {
    try {
      setPredictionLoading(true);
      const prediction = await certificationsAPI.getSalaryPrediction();
      setSalaryPrediction(prediction.data);
    } catch (error) {
      console.error('Error fetching salary prediction:', error);
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
            <Typography variant="caption" color="text.secondary">
              🔄 Last updated: {lastUpdate?.toLocaleTimeString() || 'Loading...'}
            </Typography>
            <br />
            <Chip 
              label="Live Data" 
              size="small" 
              color="success" 
              variant="outlined"
              sx={{ mt: 0.5 }}
            />
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

        {/* Salary Prediction with Real-Time Data */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon color="primary" />
                Salary Prediction & Growth
              </Typography>
              
              {predictionLoading ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : salaryPrediction ? (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Predicted Salary Increase
                    </Typography>
                    <Typography variant="h5" color="success.main">
                      +{salaryPrediction.increasePercentage || 0}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Based on your certifications
                    </Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Impact Score
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((salaryPrediction.totalCertifications || 0) * 10, 100)} 
                      sx={{ height: 8, borderRadius: 4, mb: 1 }}
                    />
                    <Typography variant="caption">
                      {salaryPrediction.totalCertifications || 0} certifications
                    </Typography>
                  </Box>

                  {salaryPrediction.recommendations && salaryPrediction.recommendations.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Recommendations
                      </Typography>
                      <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                        {typeof salaryPrediction.recommendations[0] === 'string' 
                          ? salaryPrediction.recommendations[0]
                          : salaryPrediction.recommendations[0]?.message || 'No recommendations available'
                        }
                      </Typography>
                    </Box>
                  )}
                </Stack>
              ) : (
                <Box textAlign="center" py={2}>
                  <Typography variant="body2" color="text.secondary">
                    Upload certifications to see predictions
                  </Typography>
                </Box>
              )}
              
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mt: 2 }}
                startIcon={<SchoolIcon />}
                onClick={() => navigate('/certifications')}
              >
                Manage Certifications
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
