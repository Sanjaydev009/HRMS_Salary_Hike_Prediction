import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  CalendarToday,
  EventAvailable,
  EventBusy,
  TrendingUp,
} from '@mui/icons-material';
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

interface LeaveStatistics {
  totalLeavesTaken: number;
  totalLeavesApproved: number;
  totalLeavesPending: number;
  totalLeavesRejected: number;
  averageLeaveDays: number;
}

const EmployeeLeaveBalance: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [statistics, setStatistics] = useState<LeaveStatistics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const leaveTypes = [
    { key: 'annual', label: 'Annual Leave', color: '#1976d2', icon: <CalendarToday /> },
    { key: 'sick', label: 'Sick Leave', color: '#f57c00', icon: <EventBusy /> },
    { key: 'casual', label: 'Casual Leave', color: '#388e3c', icon: <EventAvailable /> },
    { key: 'maternity', label: 'Maternity Leave', color: '#e91e63', icon: <TrendingUp /> },
    { key: 'paternity', label: 'Paternity Leave', color: '#9c27b0', icon: <TrendingUp /> },
  ];

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leaves/my');
      
      if (response.data.success) {
        setLeaveBalance(response.data.data.leaveBalances);
        setStatistics(response.data.data.leaveStats);
      }
    } catch (error: any) {
      console.error('Error fetching leave data:', error);
      setError('Failed to fetch leave balance');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'error';
    if (percentage >= 60) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Leave Balance
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Leave Balance Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {leaveTypes.map((type) => {
          const balance = leaveBalance?.[type.key as keyof LeaveBalance];
          const remaining = balance ? balance.remaining : 0;
          const total = balance ? balance.total : 0;
          const used = balance ? balance.used : 0;
          const percentage = total > 0 ? (used / total) * 100 : 0;

          return (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={type.key}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Box sx={{ color: type.color }}>{type.icon}</Box>
                    <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                      {type.label}
                    </Typography>
                  </Stack>

                  <Typography variant="h4" sx={{ mb: 1, color: type.color }}>
                    {remaining}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    of {total} days remaining
                  </Typography>

                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    color={getStatusColor(percentage) as any}
                    sx={{ mb: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {used} days used ({Math.round(percentage)}%)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Statistics */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Leave Statistics (This Year)
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="primary">
                        {statistics.totalLeavesTaken}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Leaves Taken
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="success.main">
                        {statistics.totalLeavesApproved}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Approved
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="warning.main">
                        {statistics.totalLeavesPending}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pending
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="error.main">
                        {statistics.totalLeavesRejected}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Rejected
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Leave Types Details Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Leave Types Details
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Leave Type</TableCell>
                <TableCell align="center">Total Quota</TableCell>
                <TableCell align="center">Used</TableCell>
                <TableCell align="center">Remaining</TableCell>
                <TableCell align="center">Usage</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveTypes.map((type) => {
                const balance = leaveBalance?.[type.key as keyof LeaveBalance];
                const remaining = balance ? balance.remaining : 0;
                const total = balance ? balance.total : 0;
                const used = balance ? balance.used : 0;
                const percentage = total > 0 ? (used / total) * 100 : 0;
                const status = getStatusColor(percentage);

                return (
                  <TableRow key={type.key}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ color: type.color }}>{type.icon}</Box>
                        <Typography>{type.label}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">{total}</TableCell>
                    <TableCell align="center">{used}</TableCell>
                    <TableCell align="center">
                      <Typography color={remaining > 0 ? 'text.primary' : 'error.main'}>
                        {remaining}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            color={status as any}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ minWidth: 35 }}>
                          {Math.round(percentage)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={
                          status === 'error' ? 'High Usage' :
                          status === 'warning' ? 'Medium Usage' : 'Low Usage'
                        }
                        color={status as any}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default EmployeeLeaveBalance;
