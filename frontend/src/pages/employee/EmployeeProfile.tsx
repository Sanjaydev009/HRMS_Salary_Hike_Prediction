import React, { useState } from 'react';
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
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const EmployeeProfile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    phone: user?.profile?.phone || '',
    email: user?.email || '',
    address: 'San Francisco, CA', // Mock data
    emergencyContact: '+1 234-567-8910', // Mock data
    emergencyContactName: 'John Doe', // Mock data
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // TODO: Implement API call to save profile
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
    setFormData({
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      phone: user?.profile?.phone || '',
      email: user?.email || '',
      address: 'San Francisco, CA',
      emergencyContact: '+1 234-567-8910',
      emergencyContactName: 'John Doe',
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Stack direction="row" spacing={3} alignItems="center">
              <Avatar
                sx={{ width: 100, height: 100 }}
                src={user?.profile?.profilePicture}
              >
                {user?.profile?.firstName?.[0]}{user?.profile?.lastName?.[0]}
              </Avatar>
              <Box>
                <Typography variant="h5">
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {user?.jobDetails?.designation || 'Employee'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.jobDetails?.department || 'Department'} • Employee ID: {user?.employeeId}
                </Typography>
                <Chip 
                  label={user?.role?.toUpperCase()} 
                  color="primary" 
                  size="small" 
                  sx={{ mt: 1 }}
                />
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
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    color="primary"
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
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
                      {user?.jobDetails?.designation || 'Not specified'}
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
                      {user?.jobDetails?.department || 'Not specified'}
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
                      {user?.jobDetails?.joiningDate ? 
                        new Date(user.jobDetails.joiningDate).toLocaleDateString() : 
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
      </Grid>
    </Box>
  );
};

export default EmployeeProfile;
