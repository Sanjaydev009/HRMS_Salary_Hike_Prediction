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
  Alert,
  CircularProgress,
  Stack,
  Divider,
  MenuItem,
  Pagination,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  AccessTime,
  CalendarToday,
  TrendingUp,
  LocationOn,
  Assignment,
  Refresh,
} from '@mui/icons-material';
import api from '../../services/api';

interface AttendanceRecord {
  _id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day';
  totalHours: number;
  breakTime: number;
  location: string;
  notes?: string;
}

interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  totalHours: number;
  attendancePercentage: number;
}

interface TodayAttendance {
  attendance: AttendanceRecord | null;
  canCheckIn: boolean;
  canCheckOut: boolean;
}

const EmployeeMyAttendance: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [checkInLocation, setCheckInLocation] = useState('Office');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchAttendanceData();
    fetchTodayAttendance();
  }, [selectedMonth, selectedYear, page]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/attendance/my?month=${selectedMonth}&year=${selectedYear}&page=${page}&limit=10`);
      
      if (response.data.success) {
        setAttendanceRecords(response.data.data.attendance);
        setStats(response.data.data.stats);
        setTotalPages(response.data.data.pagination.pages);
      }
    } catch (error: any) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await api.get('/attendance/today');
      if (response.data.success) {
        setTodayAttendance(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching today attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      const response = await api.post('/attendance/check-in', {
        location: checkInLocation,
        notes: notes.trim() || undefined,
      });
      
      if (response.data.success) {
        await fetchTodayAttendance();
        await fetchAttendanceData();
        setNotes('');
      }
    } catch (error: any) {
      console.error('Error checking in:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      const response = await api.post('/attendance/check-out', {
        notes: notes.trim() || undefined,
      });
      
      if (response.data.success) {
        await fetchTodayAttendance();
        await fetchAttendanceData();
        setNotes('');
      }
    } catch (error: any) {
      console.error('Error checking out:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return 'success';
      case 'Late':
        return 'warning';
      case 'Half Day':
        return 'info';
      case 'Absent':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '--';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatHours = (hours: number) => {
    const hrs = Math.floor(hours);
    const mins = Math.round((hours - hrs) * 60);
    return `${hrs}h ${mins}m`;
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

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
          My Attendance
        </Typography>
        <Tooltip title="Refresh Data">
          <IconButton onClick={() => {
            fetchAttendanceData();
            fetchTodayAttendance();
          }}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Today's Check-in/Check-out */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Today's Attendance
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              {todayAttendance?.attendance ? (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Status: <Chip 
                      label={todayAttendance.attendance.status} 
                      color={getStatusColor(todayAttendance.attendance.status) as any}
                      size="small"
                    />
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Check-in: {formatTime(todayAttendance.attendance.checkIn)}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Check-out: {formatTime(todayAttendance.attendance.checkOut)}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Location: {todayAttendance.attendance.location}
                  </Typography>
                  {todayAttendance.attendance.totalHours > 0 && (
                    <Typography variant="body2">
                      Total Hours: {formatHours(todayAttendance.attendance.totalHours)}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Alert severity="info">No attendance record for today</Alert>
              )}
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              {todayAttendance?.canCheckIn && (
                <>
                  <TextField
                    select
                    label="Check-in Location"
                    value={checkInLocation}
                    onChange={(e) => setCheckInLocation(e.target.value)}
                    size="small"
                    fullWidth
                  >
                    <MenuItem value="Office">Office</MenuItem>
                    <MenuItem value="Home">Work from Home</MenuItem>
                    <MenuItem value="Client Site">Client Site</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                  
                  <TextField
                    label="Notes (Optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    multiline
                    rows={2}
                    size="small"
                    fullWidth
                  />
                  
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={handleCheckIn}
                    disabled={actionLoading}
                    fullWidth
                  >
                    {actionLoading ? 'Checking In...' : 'Check In'}
                  </Button>
                </>
              )}
              
              {todayAttendance?.canCheckOut && (
                <>
                  <TextField
                    label="Check-out Notes (Optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    multiline
                    rows={2}
                    size="small"
                    fullWidth
                  />
                  
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                    fullWidth
                  >
                    {actionLoading ? 'Checking Out...' : 'Check Out'}
                  </Button>
                </>
              )}
              
              {!todayAttendance?.canCheckIn && !todayAttendance?.canCheckOut && (
                <Alert severity="success">
                  You have completed your attendance for today
                </Alert>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <CalendarToday color="primary" />
                  <Box>
                    <Typography variant="h6">{stats.totalDays}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Days
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
                    <Typography variant="h6">{stats.presentDays}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Present Days
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
                  <TrendingUp color="info" />
                  <Box>
                    <Typography variant="h6">{stats.attendancePercentage}%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Attendance Rate
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
                  <AccessTime color="warning" />
                  <Box>
                    <Typography variant="h6">{formatHours(stats.totalHours)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Hours
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
          Attendance History
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              fullWidth
              size="small"
            >
              {months.map((month, index) => (
                <MenuItem key={index} value={index + 1}>
                  {month}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
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
        </Grid>
      </Paper>

      {/* Attendance Records Table */}
      <Paper sx={{ p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Check In</TableCell>
                <TableCell>Check Out</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Hours</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : attendanceRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No attendance records found for {months[selectedMonth - 1]} {selectedYear}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                attendanceRecords.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>
                      {new Date(record.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{formatTime(record.checkIn)}</TableCell>
                    <TableCell>{formatTime(record.checkOut)}</TableCell>
                    <TableCell>
                      <Chip
                        label={record.status}
                        color={getStatusColor(record.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {record.totalHours > 0 ? formatHours(record.totalHours) : '--'}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2">{record.location}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {record.notes ? (
                        <Tooltip title={record.notes}>
                          <Assignment fontSize="small" color="action" />
                        </Tooltip>
                      ) : (
                        '--'
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
    </Box>
  );
};

export default EmployeeMyAttendance;
