import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Stack,
  Chip,
} from '@mui/material';
import {
  Add,
  Edit,
  Phone,
  Email,
} from '@mui/icons-material';
import api from '../../services/api';

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

const EmployeeEmergencyContacts: React.FC = () => {
  const [contact, setContact] = useState<EmergencyContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchEmergencyContact();
  }, []);

  const fetchEmergencyContact = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile/emergency-contacts');
      
      if (response.data.success) {
        setContact(response.data.data.emergencyContact);
        if (response.data.data.emergencyContact) {
          setFormData(response.data.data.emergencyContact);
        }
      }
    } catch (error: any) {
      console.error('Error fetching emergency contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.relationship.trim()) {
      newErrors.relationship = 'Relationship is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenDialog = () => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        relationship: contact.relationship || '',
        phone: contact.phone || '',
        email: contact.email || '',
      });
    } else {
      setFormData({
        name: '',
        relationship: '',
        phone: '',
        email: '',
      });
    }
    setErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setErrors({});
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const response = await api.put('/profile/emergency-contacts', formData);
      
      if (response.data.success) {
        setContact(response.data.data.emergencyContact);
        setDialogOpen(false);
      }
    } catch (error: any) {
      console.error('Error saving emergency contact:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to save emergency contact' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: '',
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Emergency Contact
        </Typography>
        <Button
          variant="contained"
          startIcon={contact ? <Edit /> : <Add />}
          onClick={handleOpenDialog}
        >
          {contact ? 'Edit Contact' : 'Add Contact'}
        </Button>
      </Box>

      {contact ? (
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6" color="primary">
                      {contact.name}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        Relationship:
                      </Typography>
                      <Chip 
                        label={contact.relationship} 
                        color="primary" 
                        size="small" 
                      />
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body1">
                        {contact.phone}
                      </Typography>
                    </Stack>
                    {contact.email && (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Email fontSize="small" color="action" />
                        <Typography variant="body1">
                          {contact.email}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Important:</strong> Keep your emergency contact information up to date. 
                  This person will be contacted in case of emergencies at the workplace.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </Paper>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Emergency Contact Added
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Please add an emergency contact for workplace safety purposes.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenDialog}
            sx={{ mt: 2 }}
          >
            Add Emergency Contact
          </Button>
        </Paper>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {contact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {errors.submit && (
              <Alert severity="error">{errors.submit}</Alert>
            )}
            
            <TextField
              label="Full Name"
              value={formData.name}
              onChange={handleInputChange('name')}
              fullWidth
              required
              error={!!errors.name}
              helperText={errors.name}
            />
            
            <TextField
              label="Relationship"
              value={formData.relationship}
              onChange={handleInputChange('relationship')}
              fullWidth
              required
              error={!!errors.relationship}
              helperText={errors.relationship || 'e.g., Father, Mother, Spouse, Sibling, Friend'}
              placeholder="e.g., Father, Mother, Spouse"
            />
            
            <TextField
              label="Phone Number"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              fullWidth
              required
              error={!!errors.phone}
              helperText={errors.phone}
              placeholder="+1-555-0123"
            />
            
            <TextField
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              fullWidth
              error={!!errors.email}
              helperText={errors.email || 'Optional - for email notifications'}
              placeholder="email@example.com"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={saving || !formData.name || !formData.relationship || !formData.phone}
          >
            {saving ? 'Saving...' : (contact ? 'Update' : 'Add') + ' Contact'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeEmergencyContacts;
