import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';

interface Employee {
  _id: string;
  employeeId: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
    address?: string;
  };
  jobDetails: {
    department: string;
    designation: string;
    employmentType: string;
    salary: {
      basic: number;
      allowances?: number;
      currency?: string;
    };
    workLocation?: string;
  };
  role: string;
  joiningDate: string;
  status: 'active' | 'inactive';
  avatar?: string;
}

interface EditEmployeeDialogProps {
  open: boolean;
  employee: Employee | null;
  onClose: () => void;
  onUpdate: (updatedEmployee: Employee) => void;
}

const EditEmployeeDialog: React.FC<EditEmployeeDialogProps> = ({
  open,
  employee,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<Partial<Employee>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (employee) {
      setFormData({
        ...employee,
      });
    }
  }, [employee]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else if (keys.length === 2) {
        return {
          ...prev,
          [keys[0]]: {
            ...((prev as any)[keys[0]] || {}),
            [keys[1]]: value,
          },
        };
      } else if (keys.length === 3) {
        return {
          ...prev,
          [keys[0]]: {
            ...((prev as any)[keys[0]] || {}),
            [keys[1]]: {
              ...((prev as any)[keys[0]]?.[keys[1]] || {}),
              [keys[2]]: value,
            },
          },
        };
      }
      return prev;
    });
  };

  const handleSubmit = async () => {
    if (!employee) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/employees/${employee._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        onUpdate(result.data.employee);
        onClose();
      } else {
        setError(result.message || 'Failed to update employee');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  if (!employee || !formData.profile) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon color="primary" />
          <Typography variant="h6">
            Edit Employee - {formData.profile.firstName} {formData.profile.lastName}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" />
              Personal Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.profile?.firstName || ''}
              onChange={(e) => handleChange('profile.firstName', e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.profile?.lastName || ''}
              onChange={(e) => handleChange('profile.lastName', e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={formData.profile?.phone || ''}
              onChange={(e) => handleChange('profile.phone', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Job Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
              <WorkIcon color="primary" />
              Job Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Department"
              value={formData.jobDetails?.department || ''}
              onChange={(e) => handleChange('jobDetails.department', e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Designation"
              value={formData.jobDetails?.designation || ''}
              onChange={(e) => handleChange('jobDetails.designation', e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <WorkIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Basic Salary"
              type="number"
              value={formData.jobDetails?.salary?.basic || ''}
              onChange={(e) => handleChange('jobDetails.salary.basic', Number(e.target.value))}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Allowances"
              type="number"
              value={formData.jobDetails?.salary?.allowances || ''}
              onChange={(e) => handleChange('jobDetails.salary.allowances', Number(e.target.value))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Work Location"
              value={formData.jobDetails?.workLocation || ''}
              onChange={(e) => handleChange('jobDetails.workLocation', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Employment Type"
              value={formData.jobDetails?.employmentType || ''}
              onChange={(e) => handleChange('jobDetails.employmentType', e.target.value)}
              select
              SelectProps={{
                native: true,
              }}
            >
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Updating...' : 'Update Employee'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditEmployeeDialog;
