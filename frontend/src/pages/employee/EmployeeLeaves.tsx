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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Stack,
  MenuItem,
  LinearProgress,
  Pagination,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Add,
  CalendarToday,
  Event,
  Cancel,
  CheckCircle,
  Pending,
  Info,
  Refresh,
} from '@mui/icons-material';
import api from '../../services/api';

interface LeaveRecord {
  _id: string;
  leaveType: 'annual' | 'sick' | 'casual' | 'maternity' | 'paternity';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  approvedBy?: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  rejectionReason?: string;
  halfDay: boolean;
  emergencyContact?: string;
  handoverNotes?: string;
}

interface LeaveBalance {
  total: number;
  used: number;
  remaining: number;
}

interface LeaveBalances {
  annual: LeaveBalance;
  sick: LeaveBalance;
  casual: LeaveBalance;
  maternity: LeaveBalance;
  paternity: LeaveBalance;
}

interface LeaveStats {
  totalApplied: number;
  approved: number;
  pending: number;
  rejected: number;
  totalDaysUsed: number;
}

const EmployeeLeaves: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalances | null>(null);
  const [leaveStats, setLeaveStats] = useState<LeaveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Form state
  const [formData, setFormData] = useState({
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
    halfDay: false,
    emergencyContact: '',
    handoverNotes: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchLeaveData();
  }, [selectedYear, statusFilter, typeFilter, page]);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        year: selectedYear.toString(),
        page: page.toString(),
        limit: '10',
      });
      
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('leaveType', typeFilter);
      
      const response = await api.get(`/leaves/my?${params}`);
      
      if (response.data.success) {
        setLeaves(response.data.data.leaves);
        setLeaveBalances(response.data.data.leaveBalances);
        setLeaveStats(response.data.data.leaveStats);
        setTotalPages(response.data.data.pagination.pages);
      }
    } catch (error: any) {
      console.error('Error fetching leave data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.endDate) errors.endDate = 'End date is required';
    if (!formData.reason.trim()) errors.reason = 'Reason is required';
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (start < today) {
        errors.startDate = 'Start date cannot be in the past';
      }
      if (start > end) {
        errors.endDate = 'End date cannot be before start date';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      const response = await api.post('/leaves', formData);
      
      if (response.data.success) {
        setDialogOpen(false);
        resetForm();
        fetchLeaveData();
      }
    } catch (error: any) {
      setFormErrors({ 
        submit: error.response?.data?.message || 'Failed to submit leave application' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (leaveId: string) => {
    try {
      const response = await api.put(`/leaves/${leaveId}/cancel`);
      if (response.data.success) {
        fetchLeaveData();
      }
    } catch (error: any) {
      console.error('Error cancelling leave:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      leaveType: 'annual',
      startDate: '',
      endDate: '',
      reason: '',
      halfDay: false,
      emergencyContact: '',
      handoverNotes: '',
    });
    setFormErrors({});
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle fontSize="small" />;
      case 'rejected':
        return <Cancel fontSize="small" />;
      case 'pending':
        return <Pending fontSize="small" />;
      default:
        return <Info fontSize="small" />;
    }
  };

  const getBalanceColor = (balance: LeaveBalance) => {
    const percentage = (balance.remaining / balance.total) * 100;
    if (percentage > 50) return 'success';
    if (percentage > 20) return 'warning';
    return 'error';
  };

  const leaveTypes = [
    { value: 'annual', label: 'Annual Leave' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'casual', label: 'Casual Leave' },
    { value: 'maternity', label: 'Maternity Leave' },
    { value: 'paternity', label: 'Paternity Leave' },
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  if (loading && page === 1) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          My Leaves
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchLeaveData}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Leave Balances */}
      {leaveBalances && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {Object.entries(leaveBalances).map(([type, balance]) => (
            <Grid item xs={12} sm={6} md={2.4} key={type}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {leaveTypes.find(t => t.value === type)?.label}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    {balance.remaining} / {balance.total}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(balance.remaining / balance.total) * 100}
                    color={getBalanceColor(balance)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {balance.used} days used
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Leave Statistics */}
      {leaveStats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <CalendarToday color="primary" />
                  <Box>
                    <Typography variant="h6">{leaveStats.totalApplied}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Applied
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <CheckCircle color="success" />
                  <Box>
                    <Typography variant="h6">{leaveStats.approved}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Approved
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Pending color="warning" />
                  <Box>
                    <Typography variant="h6">{leaveStats.pending}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Event color="info" />
                  <Box>
                    <Typography variant="h6">{leaveStats.totalDaysUsed}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Days Used
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Leave History
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              select
              label="Year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              fullWidth
              size="small"
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              fullWidth
              size="small"
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              label="Leave Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="">All Types</MenuItem>
              {leaveTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Leave Records Table */}
      <Paper sx={{ p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Leave Type</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Days</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Applied Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : leaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No leave records found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                leaves.map((leave) => (
                  <TableRow key={leave._id}>
                    <TableCell>
                      {leaveTypes.find(t => t.value === leave.leaveType)?.label}
                      {leave.halfDay && (
                        <Chip label="Half Day" size="small" sx={{ ml: 1 }} />
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(leave.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(leave.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{leave.totalDays}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(leave.status)}
                        label={leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        color={getStatusColor(leave.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(leave.appliedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {leave.status === 'pending' && (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleCancel(leave._id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Paper>

      {/* Apply Leave Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Apply for Leave</DialogTitle>
        <DialogContent>
          {formErrors.submit && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formErrors.submit}
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Leave Type"
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value as any })}
                fullWidth
              >
                {leaveTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                type="date"
                label="Start Date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                error={!!formErrors.startDate}
                helperText={formErrors.startDate}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                type="date"
                label="End Date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                error={!!formErrors.endDate}
                helperText={formErrors.endDate}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                error={!!formErrors.reason}
                helperText={formErrors.reason}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Emergency Contact"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                fullWidth
                helperText="Optional - Contact person during your absence"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Handover Notes"
                value={formData.handoverNotes}
                onChange={(e) => setFormData({ ...formData, handoverNotes: e.target.value })}
                fullWidth
                multiline
                rows={2}
                helperText="Optional - Important tasks or responsibilities to handover"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeLeaves;
