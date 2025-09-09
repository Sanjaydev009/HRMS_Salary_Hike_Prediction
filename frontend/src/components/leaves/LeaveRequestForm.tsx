import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

interface LeaveRequest {
  id?: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: Dayjs;
  endDate: Dayjs;
  duration: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  appliedDate: Dayjs;
  approvedBy?: string;
  approvedDate?: Dayjs;
  comments?: string;
  hrNotes?: string;
  rejectionReason?: string;
}

interface LeaveBalance {
  leaveType: string;
  allocated: number;
  used: number;
  pending: number;
  available: number;
}

interface LeaveRequestFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (request: Omit<LeaveRequest, 'id'>) => void;
  request?: LeaveRequest | null;
  mode: 'add' | 'edit' | 'view';
  leaveBalances: LeaveBalance[];
}

const leaveTypes = [
  'Annual Leave',
  'Sick Leave',
  'Personal Leave',
  'Maternity/Paternity',
  'Emergency Leave',
  'Bereavement Leave',
];

const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({
  open,
  onClose,
  onSave,
  request,
  mode,
  leaveBalances,
}) => {
  const [formData, setFormData] = useState<{
    employeeId: string;
    employeeName: string;
    leaveType: string;
    startDate: Dayjs;
    endDate: Dayjs;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
    appliedDate: Dayjs;
    comments: string;
  }>({
    employeeId: localStorage.getItem('userId') || '1',
    employeeName: localStorage.getItem('userName') || 'Current User',
    leaveType: '',
    startDate: dayjs(),
    endDate: dayjs(),
    reason: '',
    status: 'Pending',
    appliedDate: dayjs(),
    comments: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [availableDays, setAvailableDays] = useState<number>(0);

  useEffect(() => {
    if (request && mode !== 'add') {
      setFormData({
        employeeId: request.employeeId,
        employeeName: request.employeeName,
        leaveType: request.leaveType,
        startDate: request.startDate,
        endDate: request.endDate,
        reason: request.reason,
        status: request.status,
        appliedDate: request.appliedDate,
        comments: request.comments || '',
      });
    } else {
      // Reset form for new request
      setFormData({
        employeeId: localStorage.getItem('userId') || '1',
        employeeName: localStorage.getItem('userName') || 'Current User',
        leaveType: '',
        startDate: dayjs(),
        endDate: dayjs(),
        reason: '',
        status: 'Pending',
        appliedDate: dayjs(),
        comments: '',
      });
    }
    setErrors({});
  }, [request, mode, open]);

  useEffect(() => {
    if (formData.leaveType) {
      const balance = leaveBalances.find(b => b.leaveType === formData.leaveType);
      setAvailableDays(balance?.available || 0);
    }
  }, [formData.leaveType, leaveBalances]);

  const calculateDuration = (start: Dayjs, end: Dayjs): number => {
    if (!start || !end || !start.isValid() || !end.isValid()) return 0;
    
    let duration = 0;
    let current = start.clone();
    
    while (current.isSame(end, 'day') || current.isBefore(end, 'day')) {
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (current.day() !== 0 && current.day() !== 6) {
        duration++;
      }
      current = current.add(1, 'day');
    }
    
    return duration;
  };

  const duration = calculateDuration(formData.startDate, formData.endDate);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.leaveType) {
      newErrors.leaveType = 'Leave type is required';
    }

    if (!formData.startDate || !formData.startDate.isValid()) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate || !formData.endDate.isValid()) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && formData.startDate.isAfter(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    if (duration > availableDays && mode === 'add') {
      newErrors.duration = `Insufficient leave balance. Available: ${availableDays} days`;
    }

    if (formData.startDate && formData.startDate.isBefore(dayjs(), 'day') && mode === 'add') {
      newErrors.startDate = 'Start date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'view') {
      onClose();
      return;
    }

    if (validateForm()) {
      const requestData = {
        ...formData,
        duration,
      };
      onSave(requestData);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          component: 'form',
          onSubmit: handleSubmit,
        }}
      >
        <DialogTitle>
          {mode === 'add' && 'Request Leave'}
          {mode === 'edit' && 'Edit Leave Request'}
          {mode === 'view' && 'Leave Request Details'}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              {/* Employee Info */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee Name"
                  value={formData.employeeName}
                  disabled
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Applied Date"
                  value={formData.appliedDate.format('MMM DD, YYYY')}
                  disabled
                />
              </Grid>

              {/* Leave Type */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.leaveType}>
                  <InputLabel>Leave Type</InputLabel>
                  <Select
                    value={formData.leaveType}
                    label="Leave Type"
                    onChange={(e) => handleChange('leaveType', e.target.value)}
                    disabled={isReadOnly}
                  >
                    {leaveTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {errors.leaveType && (
                  <Typography variant="caption" color="error">
                    {errors.leaveType}
                  </Typography>
                )}
              </Grid>

              {/* Available Days */}
              {formData.leaveType && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ pt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Available Days: {availableDays}
                    </Typography>
                  </Box>
                </Grid>
              )}

              {/* Dates */}
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) => handleChange('startDate', date)}
                  disabled={isReadOnly}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.startDate}
                      helperText={errors.startDate}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="End Date"
                  value={formData.endDate}
                  onChange={(date) => handleChange('endDate', date)}
                  disabled={isReadOnly}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.endDate}
                      helperText={errors.endDate}
                    />
                  )}
                />
              </Grid>

              {/* Duration */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duration (Business Days)"
                  value={duration}
                  disabled
                  helperText={errors.duration}
                  error={!!errors.duration}
                />
              </Grid>

              {/* Status (for view/edit mode) */}
              {mode !== 'add' && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ pt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Status
                    </Typography>
                    <Chip
                      label={formData.status}
                      color={
                        formData.status === 'Approved' ? 'success' :
                        formData.status === 'Rejected' ? 'error' :
                        formData.status === 'Pending' ? 'warning' : 'default'
                      }
                    />
                  </Box>
                </Grid>
              )}

              {/* Reason */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason"
                  multiline
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => handleChange('reason', e.target.value)}
                  error={!!errors.reason}
                  helperText={errors.reason}
                  disabled={isReadOnly}
                />
              </Grid>

              {/* HR Notes (for approved/rejected requests) */}
              {mode === 'view' && (request?.hrNotes || request?.rejectionReason) && (
                <Grid item xs={12}>
                  <Alert 
                    severity={request?.status === 'Approved' ? 'success' : request?.status === 'Rejected' ? 'error' : 'info'}
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      HR Notes {request?.status === 'Rejected' ? '(Reason for Rejection)' : ''}
                    </Typography>
                    <Typography variant="body2">
                      {request?.hrNotes || request?.rejectionReason}
                    </Typography>
                    {request?.approvedBy && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        By: {request.approvedBy} on {request.approvedDate?.format('MMM DD, YYYY')}
                      </Typography>
                    )}
                  </Alert>
                </Grid>
              )}

              {/* Legacy Comments (for backward compatibility) */}
              {mode === 'view' && formData.comments && !request?.hrNotes && !request?.rejectionReason && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Comments"
                    multiline
                    rows={2}
                    value={formData.comments}
                    disabled
                  />
                </Grid>
              )}

              {/* Approval Info */}
              {mode === 'view' && (formData.status === 'Approved' || formData.status === 'Rejected') && (
                <Grid item xs={12}>
                  <Alert severity={formData.status === 'Approved' ? 'success' : 'error'}>
                    <Typography variant="body2">
                      {formData.status} by {request?.approvedBy} on{' '}
                      {request?.approvedDate?.format('MMM DD, YYYY')}
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>
            {mode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {mode !== 'view' && (
            <Button type="submit" variant="contained">
              {mode === 'add' ? 'Submit Request' : 'Update Request'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default LeaveRequestForm;
