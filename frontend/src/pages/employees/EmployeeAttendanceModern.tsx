import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  Skeleton,
  Alert,
  Fade,
  useTheme,
  alpha,
  Container,
  LinearProgress,
  Divider,
  ButtonGroup,
  Badge,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Timeline as TimelineIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckInIcon,
  Cancel as CheckOutIcon,
  Fastfood as LunchIcon,
  Coffee as BreakIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import api from '../../services/api';

interface AttendanceRecord {
  _id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  lunchBreakStart?: string;
  lunchBreakEnd?: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Holiday';
  hoursWorked: number;
  overtime: number;
  notes?: string;
}

interface AttendanceStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  averageHours: number;
  attendanceRate: number;
  topPerformers: Array<{
    name: string;
    rate: number;
    department: string;
  }>;
  departmentStats: Array<{
    department: string;
    total: number;
    present: number;
    rate: number;
  }>;
  weeklyTrends: Array<{
    day: string;
    present: number;
    absent: number;
    late: number;
  }>;
}

const EmployeeAttendanceModern: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

  // Mock data
  const mockStats: AttendanceStats = {
    totalEmployees: 310,
    presentToday: 287,
    absentToday: 15,
    lateToday: 8,
    averageHours: 8.2,
    attendanceRate: 92.6,
    topPerformers: [
      { name: 'Sarah Johnson', rate: 98.5, department: 'Engineering' },
      { name: 'Michael Chen', rate: 97.2, department: 'Sales' },
      { name: 'Emily Davis', rate: 96.8, department: 'Marketing' },
    ],
    departmentStats: [
      { department: 'Engineering', total: 125, present: 118, rate: 94.4 },
      { department: 'Sales', total: 85, present: 79, rate: 92.9 },
      { department: 'Marketing', total: 45, present: 42, rate: 93.3 },
      { department: 'HR', total: 25, present: 24, rate: 96.0 },
      { department: 'Finance', total: 30, present: 28, rate: 93.3 },
    ],
    weeklyTrends: [
      { day: 'Mon', present: 285, absent: 20, late: 5 },
      { day: 'Tue', present: 290, absent: 15, late: 5 },
      { day: 'Wed', present: 287, absent: 18, late: 5 },
      { day: 'Thu', present: 292, absent: 13, late: 5 },
      { day: 'Fri', present: 275, absent: 25, late: 10 },
      { day: 'Sat', present: 45, absent: 265, late: 0 },
      { day: 'Sun', present: 12, absent: 298, late: 0 },
    ],
  };

  const mockRecords: AttendanceRecord[] = [
    {
      _id: '1',
      employeeId: 'EMP001',
      employeeName: 'Sarah Johnson',
      department: 'Engineering',
      date: '2024-01-15',
      checkIn: '09:00',
      checkOut: '18:00',
      lunchBreakStart: '13:00',
      lunchBreakEnd: '14:00',
      status: 'Present',
      hoursWorked: 8,
      overtime: 0,
    },
    {
      _id: '2',
      employeeId: 'EMP002',
      employeeName: 'Michael Chen',
      department: 'Sales',
      date: '2024-01-15',
      checkIn: '09:15',
      checkOut: '18:30',
      lunchBreakStart: '12:30',
      lunchBreakEnd: '13:30',
      status: 'Late',
      hoursWorked: 8.25,
      overtime: 0.5,
    },
    {
      _id: '3',
      employeeId: 'EMP003',
      employeeName: 'Emily Davis',
      department: 'Marketing',
      date: '2024-01-15',
      checkIn: '08:45',
      checkOut: '17:45',
      lunchBreakStart: '13:00',
      lunchBreakEnd: '14:00',
      status: 'Present',
      hoursWorked: 8,
      overtime: 0,
    },
    {
      _id: '4',
      employeeId: 'EMP004',
      employeeName: 'David Wilson',
      department: 'HR',
      date: '2024-01-15',
      status: 'Absent',
      hoursWorked: 0,
      overtime: 0,
      notes: 'Sick leave',
    },
    {
      _id: '5',
      employeeId: 'EMP005',
      employeeName: 'Anna Rodriguez',
      department: 'Finance',
      date: '2024-01-15',
      checkIn: '09:00',
      checkOut: '13:00',
      status: 'Half Day',
      hoursWorked: 4,
      overtime: 0,
      notes: 'Medical appointment',
    },
  ];

  const fetchAttendanceData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      const [statsResponse, recordsResponse] = await Promise.all([
        api.get('/attendance/stats'),
        api.get('/attendance/today')
      ]);
      
      setAttendanceStats(statsResponse.data);
      setAttendanceRecords(recordsResponse.data.attendance || recordsResponse.data);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching attendance data:', error);
      setError(error.response?.data?.message || 'Failed to load attendance data');
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'success';
      case 'Absent': return 'error';
      case 'Late': return 'warning';
      case 'Half Day': return 'info';
      case 'Holiday': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present': return <CheckCircleIcon />;
      case 'Absent': return <CancelIcon />;
      case 'Late': return <WarningIcon />;
      case 'Half Day': return <AccessTimeIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = 
      record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !departmentFilter || record.department === departmentFilter;
    const matchesStatus = !statusFilter || record.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const paginatedRecords = filteredRecords.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Container maxWidth={false} sx={{ py: { xs: 2, sm: 3 } }}>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="40%" height={24} />
                  <Skeleton variant="rectangular" height={100} sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth={false} sx={{ py: { xs: 2, sm: 3 } }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
      pb: { xs: 2, sm: 4 }
    }}>
      <Container maxWidth={false} sx={{ py: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={{ xs: 2, sm: 0 }}
          sx={{ mb: { xs: 3, sm: 4 } }}
        >
          <Box>
            <Typography 
              variant={isMobile ? "h4" : "h3"}
              fontWeight={700}
              sx={{ 
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Employee Attendance
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Real-time attendance tracking and analytics
            </Typography>
          </Box>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={(newValue) => newValue && setSelectedDate(newValue)}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    size={isSmallScreen ? "small" : "medium"}
                    sx={{ minWidth: { xs: '100%', sm: 200 } }}
                  />
                )}
              />
            </LocalizationProvider>
            
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchAttendanceData}
              size={isSmallScreen ? "small" : "medium"}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                }
              }}
            >
              Refresh
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              size={isSmallScreen ? "small" : "medium"}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              Export
            </Button>
          </Stack>
        </Stack>

        {/* Key Metrics Cards */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          <Grid item xs={6} sm={3}>
            <Card 
              elevation={0}
              sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.main, 0.05)})`,
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ 
                    bgcolor: theme.palette.success.main,
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 }
                  }}>
                    <CheckCircleIcon />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant={isSmallScreen ? "h5" : "h4"}
                      fontWeight={700}
                      color="success.main"
                    >
                      {attendanceStats?.presentToday}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      Present Today
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card 
              elevation={0}
              sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)}, ${alpha(theme.palette.error.main, 0.05)})`,
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ 
                    bgcolor: theme.palette.error.main,
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 }
                  }}>
                    <CancelIcon />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant={isSmallScreen ? "h5" : "h4"}
                      fontWeight={700}
                      color="error.main"
                    >
                      {attendanceStats?.absentToday}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      Absent Today
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card 
              elevation={0}
              sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.main, 0.05)})`,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ 
                    bgcolor: theme.palette.warning.main,
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 }
                  }}>
                    <WarningIcon />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant={isSmallScreen ? "h5" : "h4"}
                      fontWeight={700}
                      color="warning.main"
                    >
                      {attendanceStats?.lateToday}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      Late Today
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card 
              elevation={0}
              sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.main, 0.05)})`,
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ 
                    bgcolor: theme.palette.info.main,
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 }
                  }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant={isSmallScreen ? "h5" : "h4"}
                      fontWeight={700}
                      color="info.main"
                    >
                      {attendanceStats?.attendanceRate}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      Attendance Rate
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper 
          elevation={0}
          sx={{ 
            mb: { xs: 2, sm: 3 },
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Tabs
            value={selectedTab}
            onChange={(_, newValue) => setSelectedTab(newValue)}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              label="Today's Records" 
              icon={<TodayIcon />} 
              iconPosition="start"
              sx={{ minHeight: { xs: 60, sm: 72 } }}
            />
            <Tab 
              label="Analytics" 
              icon={<TimelineIcon />} 
              iconPosition="start"
              sx={{ minHeight: { xs: 60, sm: 72 } }}
            />
            <Tab 
              label="Department Stats" 
              icon={<BusinessIcon />} 
              iconPosition="start"
              sx={{ minHeight: { xs: 60, sm: 72 } }}
            />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {selectedTab === 0 && (
          <Box>
            {/* Filters */}
            <Paper 
              elevation={0}
              sx={{ 
                p: { xs: 2, sm: 3 }, 
                mb: { xs: 2, sm: 3 },
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={departmentFilter}
                      label="Department"
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                    >
                      <MenuItem value="">All Departments</MenuItem>
                      <MenuItem value="Engineering">Engineering</MenuItem>
                      <MenuItem value="Sales">Sales</MenuItem>
                      <MenuItem value="Marketing">Marketing</MenuItem>
                      <MenuItem value="HR">HR</MenuItem>
                      <MenuItem value="Finance">Finance</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Status"
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <MenuItem value="">All Status</MenuItem>
                      <MenuItem value="Present">Present</MenuItem>
                      <MenuItem value="Absent">Absent</MenuItem>
                      <MenuItem value="Late">Late</MenuItem>
                      <MenuItem value="Half Day">Half Day</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {filteredRecords.length} records
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Attendance Table */}
            <Card 
              elevation={0}
              sx={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Check In</TableCell>
                      <TableCell>Check Out</TableCell>
                      <TableCell>Hours</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedRecords.map((record) => (
                      <TableRow key={record._id} hover>
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {record.employeeName.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {record.employeeName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {record.employeeId}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip label={record.department} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          {record.checkIn ? (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <CheckInIcon sx={{ fontSize: 16, color: 'success.main' }} />
                              <Typography variant="body2">{record.checkIn}</Typography>
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.checkOut ? (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <CheckOutIcon sx={{ fontSize: 16, color: 'info.main' }} />
                              <Typography variant="body2">{record.checkOut}</Typography>
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {record.hoursWorked}h
                          </Typography>
                          {record.overtime > 0 && (
                            <Typography variant="caption" color="warning.main">
                              +{record.overtime}h OT
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={record.status}
                            color={getStatusColor(record.status) as any}
                            size="small"
                            icon={getStatusIcon(record.status)}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small">
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredRecords.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setPage(0);
                }}
              />
            </Card>
          </Box>
        )}

        {selectedTab === 1 && (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {/* Weekly Trends Chart */}
            <Grid item xs={12} lg={8}>
              <Card 
                elevation={0}
                sx={{ 
                  height: { xs: 400, sm: 500 },
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
                  <Typography variant={isSmallScreen ? "h6" : "h5"} fontWeight={600} sx={{ mb: 2 }}>
                    Weekly Attendance Trends
                  </Typography>
                  
                  <ResponsiveContainer width="100%" height="80%">
                    <AreaChart data={attendanceStats?.weeklyTrends}>
                      <defs>
                        <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: 8,
                          boxShadow: theme.shadows[8]
                        }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="present" 
                        stackId="1"
                        stroke={theme.palette.success.main}
                        fillOpacity={1} 
                        fill="url(#colorPresent)" 
                        name="Present"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="absent" 
                        stackId="1"
                        stroke={theme.palette.error.main}
                        fillOpacity={1} 
                        fill="url(#colorAbsent)" 
                        name="Absent"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Top Performers */}
            <Grid item xs={12} lg={4}>
              <Card 
                elevation={0}
                sx={{ 
                  height: { xs: 400, sm: 500 },
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant={isSmallScreen ? "h6" : "h5"} fontWeight={600} sx={{ mb: 3 }}>
                    Top Performers
                  </Typography>
                  
                  <Stack spacing={3}>
                    {attendanceStats?.topPerformers.map((performer, index) => (
                      <Stack key={performer.name} direction="row" spacing={2} alignItems="center">
                        <Avatar 
                          sx={{ 
                            width: 40, 
                            height: 40,
                            bgcolor: index === 0 ? 'gold' : index === 1 ? 'silver' : '#cd7f32',
                            color: 'white'
                          }}
                        >
                          {index + 1}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1" fontWeight={600}>
                            {performer.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {performer.department}
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={performer.rate}
                            sx={{ 
                              mt: 1,
                              height: 6, 
                              borderRadius: 3,
                              bgcolor: alpha(theme.palette.success.main, 0.2),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                bgcolor: theme.palette.success.main
                              }
                            }}
                          />
                        </Box>
                        <Typography variant="h6" fontWeight={700} color="success.main">
                          {performer.rate}%
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {selectedTab === 2 && (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {attendanceStats?.departmentStats.map((dept) => (
              <Grid item xs={12} sm={6} md={4} key={dept.department}>
                <Card 
                  elevation={0}
                  sx={{ 
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8]
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={600}>
                          {dept.department}
                        </Typography>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          <BusinessIcon />
                        </Avatar>
                      </Stack>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="h4" fontWeight={700} color="primary">
                            {dept.present}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Present
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="h4" fontWeight={700} color="text.secondary">
                            {dept.total}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Total
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      <Box>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography variant="body2">Attendance Rate</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {dept.rate}%
                          </Typography>
                        </Stack>
                        <LinearProgress 
                          variant="determinate" 
                          value={dept.rate}
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: alpha(theme.palette.primary.main, 0.2),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                            }
                          }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default EmployeeAttendanceModern;
