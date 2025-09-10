import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Divider,
  Chip,
  Stack,
  CircularProgress,
  Tooltip,
  IconButton,
  Badge,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Phone,
  Email,
  LocationOn,
  Work,
  CalendarToday,
  Refresh as RefreshIcon,
  VerifiedUser as VerifiedUserIcon,
  School as SchoolIcon,
  EventAvailable as EventAvailableIcon,
  AccessTime as AccessTimeIcon,
  PhotoCamera,
  CloudUpload,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useDispatch } from 'react-redux';
import { updateUserProfile } from '../../store/slices/authSlice';
import authService from '../../services/authService';

const EmployeeProfile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Store complete user data from database
  const [dbUserData, setDbUserData] = useState<any>(null);
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });
  
  const [realTimeData, setRealTimeData] = useState({
    status: 'active',
    lastLogin: '',
    organization: 'Acme Corp',
    experience: '2 years',
    certifications: ['HR Analytics', 'Leadership'],
    attendanceSummary: { present: 22, absent: 2, late: 1 },
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    emergencyContactName: '',
  });

  const [photoUploading, setPhotoUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch real attendance data
  const fetchAttendanceData = async (userId: string) => {
    try {
      const response = await fetch(`/api/attendance/my?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.attendance) {
          const records = result.data.attendance;
          const summary = {
            present: records.filter((r: any) => r.status === 'Present').length,
            absent: records.filter((r: any) => r.status === 'Absent').length,
            late: records.filter((r: any) => r.status === 'Late').length,
          };
          return summary;
        }
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
    return { present: 0, absent: 0, late: 0 };
  };

  // Fetch real certifications data
  const fetchCertificationsData = async (userId: string) => {
    try {
      const response = await fetch(`/api/certifications/my`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.certifications) {
          return result.data.certifications.map((cert: any) => cert.name || cert.title);
        }
      }
    } catch (error) {
      console.error('Error fetching certifications:', error);
    }
    return ['No certifications found'];
  };

  // Show notification
  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotification({ open: true, message, severity });
  };

  // Handle profile photo upload
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('Please select an image file', 'error');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('Image size should be less than 5MB', 'error');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      setPhotoUploading(true);
      
      const formData = new FormData();
      formData.append('profilePhoto', file);

      const response = await fetch('/api/profile/upload-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error('Failed to upload photo');
      }

      const result = await response.json();
      if (result.success) {
        showNotification('Profile photo updated successfully!', 'success');
        
        // Update Redux store with new profile picture
        dispatch(updateUserProfile({ 
          profilePicture: result.data.profilePicture 
        }));
        
        // Refresh profile data to get the updated photo
        await fetchRealTimeData();
        // Clear preview after successful upload
        setPreviewImage(null);
      } else {
        throw new Error(result.message || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      showNotification('Failed to upload photo. Please try again.', 'error');
      setPreviewImage(null);
    } finally {
      setPhotoUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };
  // Real-time data fetching from database
  const fetchRealTimeData = async () => {
    try {
      setLoading(true);
      // Fetch real data from database via profile API
      const response = await fetch('/api/profile/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const result = await response.json();
      if (result.success) {
        const userData = result.data.user;
        console.log('Fetched user data:', userData); // Debug log
        console.log('Emergency contact data:', userData.emergencyContact); // Debug log
        
        // Store complete user data from database
        setDbUserData(userData);

        // Fetch real attendance and certifications data
        const [attendanceData, certificationsData] = await Promise.all([
          fetchAttendanceData(userData._id),
          fetchCertificationsData(userData._id)
        ]);
        
        setRealTimeData({
          status: userData.status || 'active',
          lastLogin: userData.lastLogin ? new Date(userData.lastLogin).toLocaleString() : 'Never',
          organization: userData.organization || 'Acme Corp',
          experience: userData.jobDetails?.experience || userData.profile?.experience || 'Not specified',
          certifications: certificationsData.length > 0 ? certificationsData : ['No certifications'],
          attendanceSummary: attendanceData,
        });

        // Update form data with fresh data from database
        console.log('Setting emergency contact data:', {
          name: userData.emergencyContact?.name,
          phone: userData.emergencyContact?.phone,
          full: userData.emergencyContact
        });
        
        setFormData({
          firstName: userData.profile?.firstName || '',
          lastName: userData.profile?.lastName || '',
          phone: userData.profile?.phone || '',
          email: userData.email || '',
          address: userData.profile?.address || '',
          emergencyContact: userData.emergencyContact?.phone || '',
          emergencyContactName: userData.emergencyContact?.name || '',
        });
      } else {
        throw new Error(result.message || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      showNotification('Failed to fetch profile data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealTimeData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const updateData = {
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address
        },
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContact
        }
      };
      
      console.log('Sending update data:', updateData);
      
      // Save data to database via profile API
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      if (result.success) {
        showNotification('Profile updated successfully!', 'success');
        setIsEditing(false);
        // Refresh data from database
        await fetchRealTimeData();
      } else {
        throw new Error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showNotification('Failed to save profile. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to current database values - refetch to be safe
    fetchRealTimeData();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>
        <Tooltip title="Refresh profile data">
          <IconButton onClick={fetchRealTimeData} color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {!dbUserData ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} />
          <Typography sx={{ ml: 2 }}>Loading profile data from database...</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Stack direction="row" spacing={3} alignItems="center">
              {/* Profile Photo with Upload */}
              <Box sx={{ position: 'relative' }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Chip label={realTimeData.organization} color="primary" size="small" />
                  }
                >
                  <Avatar
                    sx={{ 
                      width: 100, 
                      height: 100,
                      border: '3px solid',
                      borderColor: photoUploading ? 'grey.400' : 'primary.main',
                      boxShadow: 2,
                      opacity: photoUploading ? 0.7 : 1,
                      transition: 'all 0.3s ease'
                    }}
                    src={previewImage || (dbUserData?.profile?.profilePicture ? dbUserData.profile.profilePicture : undefined)}
                  >
                    {dbUserData?.profile?.firstName?.[0]}{dbUserData?.profile?.lastName?.[0]}
                  </Avatar>
                </Badge>
                
                {/* Photo Upload Button */}
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-photo-upload"
                  type="file"
                  onChange={handlePhotoUpload}
                />
                
                <label htmlFor="profile-photo-upload">
                  <Tooltip title={dbUserData?.profile?.profilePicture ? "Change profile photo" : "Upload profile photo"}>
                    <IconButton
                      component="span"
                      disabled={photoUploading}
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: -8,
                        backgroundColor: 'primary.main',
                        color: 'white',
                        width: 32,
                        height: 32,
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                        boxShadow: 2,
                      }}
                    >
                      {photoUploading ? <CircularProgress size={16} color="inherit" /> : <PhotoCamera fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </label>
              </Box>
              <Box>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                  <Typography variant="h5">
                    {dbUserData?.profile?.firstName} {dbUserData?.profile?.lastName}
                  </Typography>
                  <Chip 
                    label={realTimeData.status} 
                    color={realTimeData.status === 'active' ? 'success' : 'warning'} 
                    size="small" 
                  />
                  <Chip 
                    label={dbUserData?.role?.toUpperCase()} 
                    color="primary" 
                    size="small" 
                    icon={<VerifiedUserIcon />}
                  />
                </Stack>
                <Typography variant="subtitle1" color="text.secondary">
                  {dbUserData?.jobDetails?.designation || 'Employee'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {dbUserData?.jobDetails?.department || 'Department'} • Employee ID: {dbUserData?.employeeId}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                  <AccessTimeIcon color="action" fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Last login: {realTimeData.lastLogin}
                  </Typography>
                </Stack>
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              {!isEditing ? (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                >
                  Edit Profile
                </Button>
              ) : (
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
                    onClick={handleSave}
                    color="primary"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </Stack>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "standard"}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "standard"}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "standard"}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "standard"}
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "standard"}
                    multiline
                    rows={2}
                    InputProps={{
                      startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />,
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Job Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Job Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Work color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Designation
                    </Typography>
                    <Typography variant="body1">
                      {dbUserData?.jobDetails?.designation || 'Not specified'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Work color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Department
                    </Typography>
                    <Typography variant="body1">
                      {dbUserData?.jobDetails?.department || 'Not specified'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Joining Date
                    </Typography>
                    <Typography variant="body1">
                      {dbUserData?.jobDetails?.joiningDate ? 
                        new Date(dbUserData.jobDetails.joiningDate).toLocaleDateString() : 
                        'Not specified'
                      }
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Emergency Contact */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Emergency Contact
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Emergency Contact Name"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "standard"}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Emergency Contact Phone"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "standard"}
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Professional Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Professional Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Work color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Experience
                    </Typography>
                    <Typography variant="body1">
                      {realTimeData.experience}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SchoolIcon color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Certifications
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      {realTimeData.certifications.map((cert: string) => (
                        <Chip key={cert} label={cert} color="info" size="small" />
                      ))}
                    </Stack>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventAvailableIcon color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      This Month's Attendance
                    </Typography>
                    <Typography variant="body1">
                      Present: {realTimeData.attendanceSummary.present}, 
                      Absent: {realTimeData.attendanceSummary.absent}, 
                      Late: {realTimeData.attendanceSummary.late}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      )}

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployeeProfile;
