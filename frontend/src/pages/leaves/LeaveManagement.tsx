import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { leaveAPI } from '../../services/api';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  CheckCircle,
  Cancel,
  Visibility,
  CalendarToday,
  TrendingUp,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import LeaveRequestForm from '../../components/leaves/LeaveRequestForm';
import LeaveCalendar from '../../components/leaves/LeaveCalendar';

interface LeaveRequest {
  id: string;
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
}

interface LeaveBalance {
  leaveType: string;
  allocated: number;
  used: number;
  pending: number;
  available: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`leave-tabpanel-${index}`}
      aria-labelledby={`leave-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const LeaveManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get user role from Redux store
  const { user } = useSelector((state: RootState) => state.auth);
  const currentUserRole = user?.role || 'employee';
  const currentUserId = user?.id;

  // State for real-time data
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

  // Fetch leave balances from API
  const fetchLeaveBalances = async () => {
    try {
      const response = await leaveAPI.getBalance();
      console.log('Balance API Response:', response); // Debug log
      
      if (response.success && response.data && response.data.leaveBalance) {
        // Transform API data to match our interface
        const balances = Object.entries(response.data.leaveBalance).map(([leaveType, balance]: [string, any]) => ({
          leaveType: leaveType.charAt(0).toUpperCase() + leaveType.slice(1),
          allocated: balance.total || balance.allocated || 0,
          used: balance.used || 0,
          pending: 0, // This would need to be calculated or provided by API
          available: balance.remaining || balance.available || 0,
        }));
        
        setLeaveBalances(balances);
      } else {
        console.error('Unexpected balance API response structure:', response);
        setLeaveBalances([]);
      }
      
    } catch (err) {
      console.error('Error fetching leave balances:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leave balances');
      
      // Fallback: Show empty state instead of hardcoded data
      setLeaveBalances([]);
    }
  };

  // Fetch leave requests from API
  const fetchLeaveRequests = async () => {
    try {
      const response = await leaveAPI.getAll();
      console.log('Leaves API Response:', response); // Debug log
      
      if (response.success && response.data && response.data.leaves) {
        // Transform API data to match our interface
        const transformedRequests = response.data.leaves.map((leave: any) => ({
          id: leave._id,
          employeeId: leave.employeeId._id,
          employeeName: `${leave.employeeId.profile.firstName} ${leave.employeeId.profile.lastName}`,
          leaveType: leave.leaveType,
          startDate: dayjs(leave.startDate),
          endDate: dayjs(leave.endDate),
          duration: leave.numberOfDays,
          reason: leave.reason,
          status: leave.status.charAt(0).toUpperCase() + leave.status.slice(1), // Capitalize status
          appliedDate: dayjs(leave.appliedDate || leave.createdAt),
          approvedBy: leave.approvedBy ? `${leave.approvedBy.profile.firstName} ${leave.approvedBy.profile.lastName}` : undefined,
          approvedDate: leave.approvedDate ? dayjs(leave.approvedDate) : undefined,
          comments: leave.rejectionReason || leave.comments,
        }));

        setLeaveRequests(transformedRequests);
        console.log('Transformed requests:', transformedRequests); // Debug log
      } else {
        console.error('Unexpected API response structure:', response);
        setLeaveRequests([]);
      }
      
    } catch (err) {
      console.error('Error fetching leave requests:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leave requests');
      
      // Fallback: Show empty state instead of hardcoded data
      setLeaveRequests([]);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchLeaveBalances(),
        fetchLeaveRequests(),
      ]);
      
      setLoading(false);
    };

    loadData();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleNewRequest = () => {
    setSelectedRequest(null);
    setFormOpen(true);
  };

  const handleViewRequest = (id: string) => {
    const request = leaveRequests.find(req => req.id === id);
    if (request) {
      setSelectedRequest(request);
      setFormOpen(true);
    }
  };

  const handleApproveRequest = async (id: string) => {
    try {
      await leaveAPI.approve(id, { status: 'approved' });
      
      // Refresh data after approval
      await fetchLeaveRequests();
      
    } catch (err) {
      console.error('Error approving request:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      await leaveAPI.approve(id, { 
        status: 'rejected', 
        rejectionReason: 'Request rejected by manager' 
      });

      // Refresh data after rejection
      await fetchLeaveRequests();
      
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError(err instanceof Error ? err.message : 'Failed to reject request');
    }
  };

  const handleSaveRequest = async (request: Omit<LeaveRequest, 'id'>) => {
    try {
      const leaveData = {
        leaveType: request.leaveType,
        startDate: request.startDate.format('YYYY-MM-DD'),
        endDate: request.endDate.format('YYYY-MM-DD'),
        reason: request.reason,
        halfDay: false,
      };

      await leaveAPI.apply(leaveData);

      // Refresh data after submission
      await Promise.all([
        fetchLeaveRequests(),
        fetchLeaveBalances(),
      ]);
      
      setFormOpen(false);
      
    } catch (err) {
      console.error('Error submitting leave request:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit leave request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      case 'Pending': return 'warning';
      case 'Cancelled': return 'default';
      default: return 'default';
    }
  };

  // Filter requests based on user role
  const filteredRequests = currentUserRole === 'employee' 
    ? leaveRequests.filter(req => req.employeeId === currentUserId)
    : leaveRequests;

  const pendingRequests = leaveRequests.filter(req => req.status === 'Pending');

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Leave Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleNewRequest}
            disabled={loading}
          >
            Request Leave
          </Button>
        </Box>

        <Typography variant="body1" color="text.secondary" gutterBottom>
          Manage leave requests, track balances, and view team availability.
        </Typography>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Quick Stats */}
            {currentUserRole === 'employee' && (
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {leaveBalances.map((balance, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" component="div" gutterBottom>
                          {balance.leaveType}
                        </Typography>
                        <Typography variant="h4" color="primary">
                          {balance.available}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Available days
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Used: {balance.used} | Pending: {balance.pending}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

        {/* Manager/HR Stats */}
        {(currentUserRole === 'hr' || currentUserRole === 'manager' || currentUserRole === 'admin') && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingUp sx={{ mr: 1, color: 'warning.main' }} />
                    <Typography variant="h6">Pending Requests</Typography>
                  </Box>
                  <Typography variant="h4" color="warning.main">
                    {pendingRequests.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Require attention
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ mr: 1, color: 'info.main' }} />
                    <Typography variant="h6">This Month</Typography>
                  </Box>
                  <Typography variant="h4" color="info.main">
                    12
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total requests
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabs */}
        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="leave management tabs">
              <Tab label="Leave Requests" />
              <Tab label="Leave Calendar" />
              {currentUserRole === 'employee' && <Tab label="My Balance" />}
            </Tabs>
          </Box>

          {/* Leave Requests Tab */}
          <TabPanel value={tabValue} index={0}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {(currentUserRole === 'hr' || currentUserRole === 'manager' || currentUserRole === 'admin') && (
                      <TableCell>Employee</TableCell>
                    )}
                    <TableCell>Leave Type</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Applied Date</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          {loading ? 'Loading leave requests...' : 
                           error ? 'Error loading requests. Please try again.' :
                           'No leave requests found.'}
                        </Typography>
                        {error && (
                          <Button 
                            variant="outlined" 
                            size="small" 
                            onClick={() => {
                              setError(null);
                              fetchLeaveRequests();
                            }}
                            sx={{ mt: 1 }}
                          >
                            Retry
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      {(currentUserRole === 'hr' || currentUserRole === 'manager' || currentUserRole === 'admin') && (
                        <TableCell>{request.employeeName}</TableCell>
                      )}
                      <TableCell>{request.leaveType}</TableCell>
                      <TableCell>{request.startDate.format('MMM DD, YYYY')}</TableCell>
                      <TableCell>{request.endDate.format('MMM DD, YYYY')}</TableCell>
                      <TableCell>{request.duration} days</TableCell>
                      <TableCell>
                        <Chip
                          label={request.status}
                          color={getStatusColor(request.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{request.appliedDate.format('MMM DD, YYYY')}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewRequest(request.id)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {(currentUserRole === 'hr' || currentUserRole === 'manager' || currentUserRole === 'admin') && 
                         request.status === 'Pending' && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleApproveRequest(request.id)}
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRejectRequest(request.id)}
                              >
                                <Cancel />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  )))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Leave Calendar Tab */}
          <TabPanel value={tabValue} index={1}>
            <LeaveCalendar requests={leaveRequests} />
          </TabPanel>

          {/* My Balance Tab (Employee only) */}
          {currentUserRole === 'employee' && (
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={3}>
                {leaveBalances.map((balance, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {balance.leaveType}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="body2">Allocated: {balance.allocated}</Typography>
                          <Typography variant="body2">Available: {balance.available}</Typography>
                        </Box>
                        <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
                          <Box
                            sx={{
                              width: `${(balance.used / balance.allocated) * 100}%`,
                              bgcolor: 'primary.main',
                              height: 8,
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption">Used: {balance.used}</Typography>
                          <Typography variant="caption">Pending: {balance.pending}</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
          )}
        </Paper>
          </>
        )}

        {/* Leave Request Form */}
        <LeaveRequestForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSave={handleSaveRequest}
          request={selectedRequest}
          mode={selectedRequest ? 'view' : 'add'}
          leaveBalances={leaveBalances}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default LeaveManagement;
