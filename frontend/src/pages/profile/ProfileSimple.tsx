import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  TextField,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  Chip,
  Stack,
  CircularProgress,
  Tooltip,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Refresh as RefreshIcon,
  VerifiedUser as VerifiedUserIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  EventAvailable as EventAvailableIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import authService from '../../services/authService';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [userProfile, setUserProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    location: '',
    joinDate: '',
    employeeId: '',
    profilePicture: '',
    role: '',
    status: '',
    lastLogin: '',
    organization: '',
  });

  type AttendanceSummary = { present: number; absent: number; late: number };
  const [jobDetails, setJobDetails] = useState<{
    experience: string;
    certifications: string[];
    attendanceSummary: AttendanceSummary;
  }>({
    experience: '',
    certifications: [],
    attendanceSummary: { present: 0, absent: 0, late: 0 },
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    twoFactorAuth: false,
    darkMode: false,
  });

  // Real-time fetch with refresh
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await authService.getCurrentUser();
      const userData = response.user;
      
      setUserProfile({
        firstName: userData.profile?.firstName || '',
        lastName: userData.profile?.lastName || '',
        email: userData.email || '',
        phone: userData.profile?.phone || '',
        department: userData.jobDetails?.department || '',
        position: userData.jobDetails?.designation || '',
        location: userData.jobDetails?.workLocation || '',
        joinDate: userData.jobDetails?.joiningDate ? new Date(userData.jobDetails.joiningDate).toLocaleDateString() : '',
        employeeId: userData.employeeId || '',
        profilePicture: userData.profile?.profilePicture || '',
        role: userData.role || '',
        status: userData.status || 'active',
        lastLogin: userData.lastLogin ? new Date(userData.lastLogin).toLocaleString() : 'Never',
        organization: userData.organization || 'Acme Corp',
      });

      // Fetch real-time job details, certifications, attendance summary
      setJobDetails({
        experience: userData.jobDetails?.experience || '2 years',
        certifications: userData.certifications || ['HR Analytics', 'Leadership'],
        attendanceSummary: userData.attendanceSummary || { present: 22, absent: 2, late: 1 },
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    // Optionally, set up polling for real-time updates
    // const interval = setInterval(fetchUserData, 30000);
    // return () => clearInterval(interval);
  }, []);

  const handleSave = () => {
    // Here you would typically save to the backend
    console.log('Saving profile:', userProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original values
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (field: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            My Profile
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Manage your personal information and preferences
          </Typography>
        </Box>
        <Tooltip title="Refresh profile">
          <IconButton onClick={fetchUserData} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Personal Information
                  </Typography>
                  <Chip label={userProfile.status} color={userProfile.status === 'active' ? 'success' : 'warning'} size="small" sx={{ ml: 1 }} />
                  <Chip label={userProfile.role} color="primary" size="small" icon={<VerifiedUserIcon />} sx={{ ml: 1 }} />
                </Stack>
                {!isEditing ? (
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                    variant="outlined"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Stack direction="row" spacing={1}>
                    <Button
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      variant="contained"
                      size="small"
                    >
                      Save
                    </Button>
                    <Button
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      variant="outlined"
                      size="small"
                    >
                      Cancel
                    </Button>
                  </Stack>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name"
                    fullWidth
                    value={userProfile.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "standard"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name"
                    fullWidth
                    value={userProfile.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "standard"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    fullWidth
                    value={userProfile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "standard"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone"
                    fullWidth
                    value={userProfile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "standard"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Department"
                    fullWidth
                    value={userProfile.department}
                    disabled
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Position"
                    fullWidth
                    value={userProfile.position}
                    disabled
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Employee ID"
                    fullWidth
                    value={userProfile.employeeId}
                    disabled
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Join Date"
                    fullWidth
                    value={userProfile.joinDate}
                    disabled
                    variant="standard"
                  />
                </Grid>
              </Grid>
              <Divider sx={{ my: 3 }} />
              {/* Job Details, Certifications, Attendance */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <WorkIcon color="primary" />
                    <Typography variant="subtitle2">Experience:</Typography>
                    <Typography variant="body2" color="text.secondary">{jobDetails.experience}</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <SchoolIcon color="primary" />
                    <Typography variant="subtitle2">Certifications:</Typography>
                    <Stack direction="row" spacing={1}>
                      {jobDetails.certifications.map((cert: string) => (
                        <Chip key={cert} label={cert} color="info" size="small" />
                      ))}
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <EventAvailableIcon color="primary" />
                    <Typography variant="subtitle2">Attendance:</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Present: {jobDetails.attendanceSummary?.present ?? 0}, Absent: {jobDetails.attendanceSummary?.absent ?? 0}, Late: {jobDetails.attendanceSummary?.late ?? 0}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Picture and Quick Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Chip label={userProfile.organization} color="primary" size="small" />
                }
              >
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 2,
                    fontSize: '2.5rem',
                    bgcolor: 'primary.main'
                  }}
                  src={userProfile.profilePicture}
                >
                  {userProfile.firstName?.[0]}{userProfile.lastName?.[0]}
                </Avatar>
              </Badge>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {userProfile.firstName} {userProfile.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {userProfile.position}
              </Typography>
              <Chip 
                label={userProfile.department} 
                color="primary" 
                variant="outlined"
                sx={{ mb: 3 }}
              />
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1} alignItems="center">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VerifiedUserIcon color="action" fontSize="small" />
                  <Typography variant="body2">{userProfile.role}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon color="action" fontSize="small" />
                  <Typography variant="body2">Last login: {userProfile.lastLogin}</Typography>
                </Box>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={2} alignItems="center">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon color="action" fontSize="small" />
                  <Typography variant="body2">{userProfile.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon color="action" fontSize="small" />
                  <Typography variant="body2">{userProfile.phone}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon color="action" fontSize="small" />
                  <Typography variant="body2">{userProfile.location}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card sx={{ mt: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Preferences
              </Typography>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.emailNotifications}
                      onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.pushNotifications}
                      onChange={(e) => handlePreferenceChange('pushNotifications', e.target.checked)}
                    />
                  }
                  label="Push Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.twoFactorAuth}
                      onChange={(e) => handlePreferenceChange('twoFactorAuth', e.target.checked)}
                    />
                  }
                  label="Two-Factor Authentication"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.darkMode}
                      onChange={(e) => handlePreferenceChange('darkMode', e.target.checked)}
                    />
                  }
                  label="Dark Mode"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      )}
    </Box>
  );
};

export default Profile;
