import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  Send,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import api from '../../services/api';

interface LeaveBalanceDetails {
  total: number;
  used: number;
  remaining: number;
}

interface LeaveBalance {
  annual: LeaveBalanceDetails;
  sick: LeaveBalanceDetails;
  casual: LeaveBalanceDetails;
  maternity: LeaveBalanceDetails;
  paternity: LeaveBalanceDetails;
}

interface LeaveApplication {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  halfDay: boolean;
  emergencyContact: string;
}

const EmployeeLeaveApply: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<LeaveApplication>({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    halfDay: false,
    emergencyContact: '',
  });

  const leaveTypes = [
    { value: 'annual', label: 'Annual Leave' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'casual', label: 'Casual Leave' },
    { value: 'maternity', label: 'Maternity Leave' },
    { value: 'paternity', label: 'Paternity Leave' },
  ];

  useEffect(() => {
    fetchLeaveBalance();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leaves/my');
      
      if (response.data.success) {
        setLeaveBalance(response.data.data.leaveBalances);
      }
    } catch (error: any) {
      console.error('Error fetching leave balance:', error);
      setError('Failed to fetch leave balance');
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      // Calculate working days (excluding weekends) to match backend logic
      let workingDays = 0;
      const currentDate = new Date(start);
      
      while (currentDate <= end) {
        const dayOfWeek = currentDate.getDay();
        // Skip weekends (Sunday = 0, Saturday = 6)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          workingDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return formData.halfDay ? workingDays / 2 : workingDays;
    }
    return 0;
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
        setError('Please fill in all required fields');
        return;
      }

      const totalDays = calculateDays();
      if (totalDays <= 0) {
        setError('Invalid date range');
        return;
      }

      // Check if user has enough available days
      const availableDays = getAvailableDays(formData.leaveType);
      if (totalDays > availableDays) {
        setError(`Insufficient leave balance. You have ${availableDays} days available for ${formData.leaveType} leave.`);
        return;
      }

      const submitData = {
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalDays,
        reason: formData.reason,
        halfDay: formData.halfDay,
        emergencyContact: formData.emergencyContact,
      };

      const response = await api.post('/leaves/apply', submitData);
      
      if (response.data.success) {
        setSuccess(true);
        setFormData({
          leaveType: '',
          startDate: '',
          endDate: '',
          reason: '',
          halfDay: false,
          emergencyContact: '',
        });
        await fetchLeaveBalance();
      }
    } catch (error: any) {
      console.error('Error applying for leave:', error);
      setError(error.response?.data?.message || 'Failed to apply for leave');
    } finally {
      setSubmitting(false);
    }
  };

  const getAvailableDays = (type: string) => {
    if (!leaveBalance) return 0;
    const balance = leaveBalance[type as keyof LeaveBalance];
    return balance ? balance.remaining : 0;
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
      <Typography variant="h4" gutterBottom>
        Apply for Leave
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Leave application submitted successfully! You will be notified once it's reviewed.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Leave Balance Summary */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Leave Balance
            </Typography>
            <Grid container spacing={2}>
              {leaveTypes.map((type) => (
                <Grid item xs={6} sm={4} md={2.4} key={type.value}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h6" color="primary">
                        {getAvailableDays(type.value)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {type.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Leave Application Form */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Leave Application
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Leave Type"
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  required
                >
                  {leaveTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label} ({getAvailableDays(option.value)} days available)
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2">Half Day?</Typography>
                  <Button
                    variant={formData.halfDay ? "contained" : "outlined"}
                    size="small"
                    onClick={() => setFormData({ ...formData, halfDay: !formData.halfDay })}
                  >
                    {formData.halfDay ? "Yes" : "No"}
                  </Button>
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: dayjs().format('YYYY-MM-DD'),
                  }}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: formData.startDate || dayjs().format('YYYY-MM-DD'),
                  }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason for Leave"
                  multiline
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Emergency Contact (Optional)"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="Name and phone number"
                />
              </Grid>

              {formData.startDate && formData.endDate && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    Total days: {calculateDays()} {formData.halfDay && '(Half day)'}
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<Send />}
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setFormData({
                        leaveType: '',
                        startDate: '',
                        endDate: '',
                        reason: '',
                        halfDay: false,
                        emergencyContact: '',
                      });
                      setError(null);
                      setSuccess(false);
                    }}
                  >
                    Reset
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeLeaveApply;
