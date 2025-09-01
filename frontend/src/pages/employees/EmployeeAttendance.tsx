import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Skeleton,
  CircularProgress,
  LinearProgress,
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  AccessTime as AccessTimeIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import api from '../../services/api';

interface AttendanceRecord {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    position: string;
  };
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: 'present' | 'absent' | 'late' | 'half-day';
  workingHours: number;
  overtime: number;
  notes: string;
}

interface AttendanceStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  averageWorkingHours: number;
  attendanceRate: number;
  overtimeHours: number;
}

interface AttendanceFilters {
  department: string;
  status: string;
  dateFrom: Dayjs | null;
  dateTo: Dayjs | null;
  employee: string;
}

const EmployeeAttendance: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [filters, setFilters] = useState<AttendanceFilters>({
    department: '',
    status: '',
    dateFrom: dayjs().subtract(7, 'days'),
    dateTo: dayjs(),
    employee: '',
  });

  const [departments, setDepartments] = useState<string[]>([]);
  const [employees, setEmployees] = useState<Array<{ _id: string; name: string }>>([]);

  // Fetch attendance data
  const fetchAttendanceData = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      
      if (filters.department) params.append('department', filters.department);
      if (filters.status) params.append('status', filters.status);
      if (filters.employee) params.append('employee', filters.employee);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.format('YYYY-MM-DD'));
      if (filters.dateTo) params.append('dateTo', filters.dateTo.format('YYYY-MM-DD'));
      
      params.append('page', (page + 1).toString());
      params.append('limit', rowsPerPage.toString());

      const response = await api.get(`/attendance?${params.toString()}`);
      
      if (response.data.success) {
        setAttendanceRecords(response.data.attendance);
        console.log('Attendance data loaded:', response.data.attendance);
      } else {
        setError('Failed to load attendance data');
      }
    } catch (error: any) {
      console.error('Error fetching attendance:', error);
      setError(error.response?.data?.message || 'Failed to load attendance data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, page, rowsPerPage]);

  // Fetch attendance statistics
  const fetchAttendanceStats = useCallback(async () => {
    try {
      const response = await api.get('/attendance/stats');
      if (response.data.success) {
        setAttendanceStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
    }
  }, []);

  // Fetch departments and employees for filters
  const fetchFilterData = useCallback(async () => {
    try {
      const [deptResponse, empResponse] = await Promise.all([
        api.get('/employees/departments'),
        api.get('/employees')
      ]);

      if (deptResponse.data.success) {
        setDepartments(deptResponse.data.departments.map((dept: any) => dept.name));
      }

      if (empResponse.data.success) {
        setEmployees(empResponse.data.employees.map((emp: any) => ({
          _id: emp._id,
          name: `${emp.firstName} ${emp.lastName}`
        })));
      }
    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
  }, []);

  useEffect(() => {
    fetchAttendanceData();
    fetchAttendanceStats();
    fetchFilterData();
  }, [fetchAttendanceData, fetchAttendanceStats, fetchFilterData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAttendanceData();
    fetchAttendanceStats();
  };

  const handleFilterChange = (newFilters: Partial<AttendanceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({
      department: '',
      status: '',
      dateFrom: dayjs().subtract(7, 'days'),
      dateTo: dayjs(),
      employee: '',
    });
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      case 'half-day': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircleIcon />;
      case 'absent': return <CancelIcon />;
      case 'late': return <WarningIcon />;
      case 'half-day': return <ScheduleIcon />;
      default: return <PersonIcon />;
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '--';
    return dayjs(timeString).format('HH:mm');
  };

  const formatWorkingHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  if (loading && !refreshing) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>Employee Attendance</Typography>
        <Grid container spacing={3}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="40%" height={24} />
                  <Skeleton variant="rectangular" height={60} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Employee Attendance
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor and track employee attendance patterns
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setFiltersOpen(true)}
            >
              Filters
            </Button>
            <Button
              variant="outlined"
              startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        {attendanceStats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {attendanceStats.totalEmployees}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Employees
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: '#333' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <CheckCircleIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {attendanceStats.presentToday}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Present Today
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', color: '#333' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <WarningIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {attendanceStats.lateToday}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Late Today
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)', color: '#333' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <TrendingUpIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {attendanceStats.attendanceRate.toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Attendance Rate
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Additional Stats */}
        {attendanceStats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Working Hours Overview
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Average Working Hours
                        </Typography>
                        <Typography variant="h6">
                          {formatWorkingHours(attendanceStats.averageWorkingHours)}
                        </Typography>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={(attendanceStats.averageWorkingHours / 8) * 100} 
                        sx={{ height: 8, borderRadius: 4, mt: 1 }}
                      />
                    </Box>
                    
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Total Overtime Hours
                        </Typography>
                        <Typography variant="h6">
                          {formatWorkingHours(attendanceStats.overtimeHours)}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Today's Summary
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Present
                      </Typography>
                      <Chip 
                        label={attendanceStats.presentToday}
                        color="success"
                        size="small"
                      />
                    </Stack>
                    
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Absent
                      </Typography>
                      <Chip 
                        label={attendanceStats.absentToday}
                        color="error"
                        size="small"
                      />
                    </Stack>
                    
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Late
                      </Typography>
                      <Chip 
                        label={attendanceStats.lateToday}
                        color="warning"
                        size="small"
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Attendance Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Attendance Records
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Check In</TableCell>
                    <TableCell>Check Out</TableCell>
                    <TableCell>Working Hours</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceRecords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((record) => (
                    <TableRow key={record._id} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {record.employee.firstName[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {record.employee.firstName} {record.employee.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {record.employee.position}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={record.employee.department} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      
                      <TableCell>
                        {dayjs(record.date).format('MMM DD, YYYY')}
                      </TableCell>
                      
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {formatTime(record.checkIn)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {formatTime(record.checkOut)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {formatWorkingHours(record.workingHours)}
                        </Typography>
                        {record.overtime > 0 && (
                          <Typography variant="caption" color="warning.main">
                            +{formatWorkingHours(record.overtime)} OT
                          </Typography>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(record.status)}
                          label={record.status.toUpperCase()}
                          color={getStatusColor(record.status) as any}
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => {
                            setSelectedRecord(record);
                            setDetailsOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              component="div"
              count={attendanceRecords.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </CardContent>
        </Card>

        {/* Filters Dialog */}
        <Dialog open={filtersOpen} onClose={() => setFiltersOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              Filter Attendance Records
              <IconButton onClick={() => setFiltersOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={filters.department}
                  onChange={(e) => handleFilterChange({ department: e.target.value })}
                  label="Department"
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange({ status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                  <MenuItem value="late">Late</MenuItem>
                  <MenuItem value="half-day">Half Day</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Employee</InputLabel>
                <Select
                  value={filters.employee}
                  onChange={(e) => handleFilterChange({ employee: e.target.value })}
                  label="Employee"
                >
                  <MenuItem value="">All Employees</MenuItem>
                  {employees.map((emp) => (
                    <MenuItem key={emp._id} value={emp._id}>{emp.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <DatePicker
                label="From Date"
                value={filters.dateFrom}
                onChange={(date) => handleFilterChange({ dateFrom: date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />

              <DatePicker
                label="To Date"
                value={filters.dateTo}
                onChange={(date) => handleFilterChange({ dateTo: date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />

              <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={clearFilters} fullWidth>
                  Clear Filters
                </Button>
                <Button variant="contained" onClick={() => setFiltersOpen(false)} fullWidth>
                  Apply Filters
                </Button>
              </Stack>
            </Stack>
          </DialogContent>
        </Dialog>

        {/* Record Details Dialog */}
        <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              Attendance Details
              <IconButton onClick={() => setDetailsOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            {selectedRecord && (
              <Stack spacing={3} sx={{ mt: 1 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ width: 48, height: 48 }}>
                    {selectedRecord.employee.firstName[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {selectedRecord.employee.firstName} {selectedRecord.employee.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedRecord.employee.position} • {selectedRecord.employee.department}
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Date</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {dayjs(selectedRecord.date).format('MMMM DD, YYYY')}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Chip
                      icon={getStatusIcon(selectedRecord.status)}
                      label={selectedRecord.status.toUpperCase()}
                      color={getStatusColor(selectedRecord.status) as any}
                      size="small"
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">Check In</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatTime(selectedRecord.checkIn)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">Check Out</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatTime(selectedRecord.checkOut)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">Working Hours</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatWorkingHours(selectedRecord.workingHours)}
                    </Typography>
                  </Box>

                  {selectedRecord.overtime > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Overtime</Typography>
                      <Typography variant="body1" fontWeight={600} color="warning.main">
                        {formatWorkingHours(selectedRecord.overtime)}
                      </Typography>
                    </Box>
                  )}

                  {selectedRecord.notes && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Notes</Typography>
                      <Typography variant="body1">
                        {selectedRecord.notes}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Stack>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default EmployeeAttendance;
