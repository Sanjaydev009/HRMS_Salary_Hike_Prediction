import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  PlayArrow as CheckInIcon,
  Stop as CheckOutIcon,
  AccessTime,
  EventAvailable,
  EventBusy,
  TrendingUp,
} from '@mui/icons-material';
import api from '../../services/api';

interface AttendanceRecord {
  _id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  totalHours: number;
  status: 'present' | 'absent' | 'late' | 'half-day';
  notes?: string;
}

interface TodayAttendance {
  _id?: string;
  checkIn: string | null;
  checkOut: string | null;
  totalHours: number;
  status: string;
}

const EmployeeAttendance: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null);
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [canCheckOut, setCanCheckOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openNotesDialog, setOpenNotesDialog] = useState(false);
  const [notes, setNotes] = useState('');

  const [stats, setStats] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    averageHours: 0,
  });

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch attendance records and today's attendance
      const [recordsResponse, todayResponse] = await Promise.all([
        api.get('/attendance/my'),
        api.get('/attendance/today')
      ]);

      const records = recordsResponse.data.data.attendance || [];
      setAttendanceRecords(records);
      
      // Extract attendance data from the response structure
      const todayData = todayResponse.data.data;
      setTodayAttendance(todayData?.attendance || null);
      setCanCheckIn(todayData?.canCheckIn || false);
      setCanCheckOut(todayData?.canCheckOut || false);

      // Calculate stats
      const totalDays = records.length;
      const presentDays = records.filter((r: AttendanceRecord) => r.status === 'present' || r.status === 'late').length;
      const absentDays = records.filter((r: AttendanceRecord) => r.status === 'absent').length;
      const totalHours = records.reduce((sum: number, r: AttendanceRecord) => sum + (r.totalHours || 0), 0);
      const averageHours = totalDays > 0 ? totalHours / totalDays : 0;

      setStats({
        totalDays,
        presentDays,
        absentDays,
        averageHours: Math.round(averageHours * 100) / 100,
      });
    } catch (error: any) {
      console.error('Error fetching attendance data:', error);
      setError(error.response?.data?.message || 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      await api.post('/attendance/check-in', { notes });
      
      // Refresh attendance data
      await fetchAttendanceData();
      setOpenNotesDialog(false);
      setNotes('');
    } catch (error: any) {
      console.error('Error checking in:', error);
      setError(error.response?.data?.message || 'Failed to check in');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      await api.post('/attendance/check-out', { notes });
      
      // Refresh attendance data
      await fetchAttendanceData();
      setOpenNotesDialog(false);
      setNotes('');
    } catch (error: any) {
      console.error('Error checking out:', error);
      setError(error.response?.data?.message || 'Failed to check out');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '--:--';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'late':
        return 'warning';
      case 'absent':
        return 'error';
      case 'half-day':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Attendance
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Today's Status */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Status - {new Date().toLocaleDateString()}
              </Typography>
              
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AccessTime color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Check In
                      </Typography>
                      <Typography variant="h6">
                        {formatTime(todayAttendance?.checkIn || null)}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CheckOutIcon color="secondary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Check Out
                      </Typography>
                      <Typography variant="h6">
                        {formatTime(todayAttendance?.checkOut || null)}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <TrendingUp color="success" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Hours Worked
                      </Typography>
                      <Typography variant="h6">
                        {todayAttendance?.totalHours || 0}h
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Stack direction="row" spacing={1}>
                    {canCheckIn && (
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckInIcon />}
                        onClick={() => setOpenNotesDialog(true)}
                        disabled={submitting}
                      >
                        Check In
                      </Button>
                    )}
                    {canCheckOut && (
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<CheckOutIcon />}
                        onClick={() => setOpenNotesDialog(true)}
                        disabled={submitting}
                      >
                        Check Out
                      </Button>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Card sx={{ backgroundColor: '#e3f2fd' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <EventAvailable color="primary" />
                    <Box>
                      <Typography variant="h4">{stats.presentDays}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Present Days
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6}>
              <Card sx={{ backgroundColor: '#ffebee' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <EventBusy color="error" />
                    <Box>
                      <Typography variant="h4">{stats.absentDays}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Absent Days
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card sx={{ backgroundColor: '#f3e5f5' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AccessTime color="secondary" />
                    <Box>
                      <Typography variant="h4">{stats.averageHours}h</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Average Hours/Day
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Attendance History */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Attendance History
          </Typography>
          
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Check In</TableCell>
                  <TableCell>Check Out</TableCell>
                  <TableCell>Hours</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceRecords.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>{formatDate(record.date)}</TableCell>
                    <TableCell>{formatTime(record.checkIn)}</TableCell>
                    <TableCell>{formatTime(record.checkOut)}</TableCell>
                    <TableCell>{record.totalHours || 0}h</TableCell>
                    <TableCell>
                      <Chip
                        label={record.status}
                        color={getStatusColor(record.status) as any}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{record.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Check In/Out Dialog */}
      <Dialog open={openNotesDialog} onClose={() => setOpenNotesDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {canCheckIn ? 'Check In' : 'Check Out'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about your attendance..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNotesDialog(false)}>Cancel</Button>
          <Button 
            onClick={canCheckIn ? handleCheckIn : handleCheckOut}
            variant="contained"
            disabled={submitting}
            color={canCheckIn ? 'success' : 'error'}
          >
            {submitting ? 'Processing...' : (canCheckIn ? 'Check In' : 'Check Out')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeAttendance;
