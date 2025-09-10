import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Stack,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  CalendarMonth,
  ArrowBack,
  ArrowForward,
  Today,
  EventNote,
  Person,
  Refresh,
  FilterList,
  Visibility,
  Schedule,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface LeaveEvent {
  id: string;
  employeeName: string;
  employeeId: string;
  leaveType: 'casual' | 'sick' | 'annual' | 'emergency';
  startDate: string;
  endDate: string;
  status: 'approved' | 'pending' | 'rejected';
  reason?: string;
  department?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  leaves: LeaveEvent[];
}

const EmployeeLeaveCalendar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaveEvents, setLeaveEvents] = useState<LeaveEvent[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Real-time data refresh
  useEffect(() => {
    fetchLeaveData();
    generateCalendar();
    
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchLeaveData();
      setLastUpdate(new Date());
      console.log('Leave calendar data refreshed at:', new Date().toLocaleTimeString());
    }, 30000);

    return () => clearInterval(interval);
  }, [currentDate]);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock real-time leave data
      const mockLeaveEvents: LeaveEvent[] = [
        {
          id: '1',
          employeeName: 'John Smith',
          employeeId: 'EMP001',
          leaveType: 'annual',
          startDate: '2025-09-10',
          endDate: '2025-09-12',
          status: 'approved',
          reason: 'Family vacation',
          department: 'Engineering',
        },
        {
          id: '2',
          employeeName: 'Sarah Johnson',
          employeeId: 'EMP002',
          leaveType: 'sick',
          startDate: '2025-09-09',
          endDate: '2025-09-09',
          status: 'approved',
          reason: 'Medical appointment',
          department: 'HR',
        },
        {
          id: '3',
          employeeName: 'Mike Davis',
          employeeId: 'EMP003',
          leaveType: 'casual',
          startDate: '2025-09-15',
          endDate: '2025-09-16',
          status: 'pending',
          reason: 'Personal work',
          department: 'Marketing',
        },
        {
          id: '4',
          employeeName: 'Emily Chen',
          employeeId: 'EMP004',
          leaveType: 'annual',
          startDate: '2025-09-20',
          endDate: '2025-09-25',
          status: 'approved',
          reason: 'Honeymoon trip',
          department: 'Engineering',
        },
      ];
      
      setLeaveEvents(mockLeaveEvents);
    } catch (error) {
      console.error('Error fetching leave data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    const days: CalendarDay[] = [];
    
    // Add previous month days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(firstDayOfMonth);
      date.setDate(date.getDate() - (i + 1));
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
        leaves: getLeaveEventsForDate(date),
      });
    }
    
    // Add current month days
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, new Date()),
        leaves: getLeaveEventsForDate(date),
      });
    }
    
    // Add next month days to complete the grid
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
        leaves: getLeaveEventsForDate(date),
      });
    }
    
    setCalendarDays(days);
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const getLeaveEventsForDate = (date: Date): LeaveEvent[] => {
    return leaveEvents.filter(event => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      return date >= startDate && date <= endDate;
    });
  };

  const getLeaveTypeColor = (type: string, status: string) => {
    if (status === 'rejected') return '#f44336';
    if (status === 'pending') return '#ff9800';
    
    switch (type) {
      case 'casual': return '#2196f3';
      case 'sick': return '#9c27b0';
      case 'annual': return '#4caf50';
      case 'emergency': return '#ff5722';
      default: return '#757575';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (day: CalendarDay) => {
    if (day.leaves.length > 0) {
      setSelectedDate(day.date);
      setDialogOpen(true);
    }
  };

  const getMonthYearString = () => {
    return currentDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getDepartments = () => {
    const departments = ['all', ...new Set(leaveEvents.map(event => event.department).filter(Boolean))];
    return departments;
  };

  const filteredLeaveEvents = filterDepartment === 'all' 
    ? leaveEvents 
    : leaveEvents.filter(event => event.department === filterDepartment);

  const upcomingLeaves = leaveEvents
    .filter(event => new Date(event.startDate) >= new Date() && event.status === 'approved')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" gutterBottom>
              Team Leave Calendar
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Real-time view of team leave schedules and availability
            </Typography>
          </Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#4caf50',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                  '100%': { opacity: 1 },
                },
              }}
            />
            <Typography variant="caption">
              Live Updates
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      {/* Navigation and Controls */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" alignItems="center" spacing={2}>
                <IconButton onClick={() => navigateMonth('prev')} size="large">
                  <ArrowBack />
                </IconButton>
                <Typography variant="h5" sx={{ minWidth: 200, textAlign: 'center' }}>
                  {getMonthYearString()}
                </Typography>
                <IconButton onClick={() => navigateMonth('next')} size="large">
                  <ArrowForward />
                </IconButton>
              </Stack>
              
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="outlined" 
                  startIcon={<Today />}
                  onClick={goToToday}
                  size="small"
                >
                  Today
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Refresh />}
                  onClick={fetchLeaveData}
                  disabled={loading}
                  size="small"
                >
                  Refresh
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </Typography>
              <Chip 
                label={`${filteredLeaveEvents.length} leaves`} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Calendar */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 2 }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                {/* Weekday Headers */}
                <Grid container sx={{ mb: 1 }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <Grid item xs key={day}>
                      <Typography 
                        variant="subtitle2" 
                        align="center" 
                        sx={{ 
                          p: 1, 
                          fontWeight: 'bold',
                          color: 'text.secondary',
                          backgroundColor: 'grey.50'
                        }}
                      >
                        {day}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>

                {/* Calendar Days */}
                <Grid container>
                  {calendarDays.map((day, index) => (
                    <Grid item xs key={index}>
                      <Card
                        variant={day.isCurrentMonth ? 'outlined' : 'elevation'}
                        elevation={day.isCurrentMonth ? 0 : 1}
                        sx={{
                          minHeight: 80,
                          cursor: day.leaves.length > 0 ? 'pointer' : 'default',
                          opacity: day.isCurrentMonth ? 1 : 0.5,
                          bgcolor: day.isToday ? 'primary.50' : 'inherit',
                          border: day.isToday ? '2px solid' : '1px solid',
                          borderColor: day.isToday ? 'primary.main' : 'divider',
                          '&:hover': day.leaves.length > 0 ? {
                            backgroundColor: 'action.hover',
                            transform: 'scale(1.02)',
                          } : {},
                          transition: 'all 0.2s',
                        }}
                        onClick={() => handleDateClick(day)}
                      >
                        <CardContent sx={{ p: 1 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: day.isToday ? 'bold' : 'normal',
                              color: day.isToday ? 'primary.main' : 'inherit'
                            }}
                          >
                            {day.date.getDate()}
                          </Typography>
                          
                          {/* Leave indicators */}
                          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                            {day.leaves.slice(0, 2).map((leave, idx) => (
                              <Chip
                                key={idx}
                                size="small"
                                label={leave.employeeName.split(' ')[0]}
                                sx={{
                                  backgroundColor: getLeaveTypeColor(leave.leaveType, leave.status) + '20',
                                  color: getLeaveTypeColor(leave.leaveType, leave.status),
                                  fontSize: '10px',
                                  height: 16,
                                  '& .MuiChip-label': { px: 0.5 },
                                }}
                              />
                            ))}
                            {day.leaves.length > 2 && (
                              <Typography variant="caption" color="text.secondary">
                                +{day.leaves.length - 2} more
                              </Typography>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Quick Stats */}
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventNote color="primary" />
                Leave Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {leaveEvents.filter(l => l.status === 'approved').length}
                    </Typography>
                    <Typography variant="caption">Approved</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main">
                      {leaveEvents.filter(l => l.status === 'pending').length}
                    </Typography>
                    <Typography variant="caption">Pending</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Upcoming Leaves */}
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule color="primary" />
                Upcoming Leaves
              </Typography>
              {upcomingLeaves.length > 0 ? (
                <List dense>
                  {upcomingLeaves.map((leave) => (
                    <ListItem key={leave.id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: getLeaveTypeColor(leave.leaveType, leave.status) + '20', color: getLeaveTypeColor(leave.leaveType, leave.status), width: 32, height: 32 }}>
                          {leave.employeeName.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={leave.employeeName}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                            </Typography>
                            <Chip 
                              label={leave.leaveType} 
                              size="small" 
                              sx={{ 
                                backgroundColor: getLeaveTypeColor(leave.leaveType, leave.status) + '20',
                                color: getLeaveTypeColor(leave.leaveType, leave.status),
                                fontSize: '10px',
                                height: 16,
                              }} 
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No upcoming approved leaves
                </Typography>
              )}
            </Paper>

            {/* Legend */}
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Leave Types
              </Typography>
              <Stack spacing={1}>
                {[
                  { type: 'casual', label: 'Casual Leave' },
                  { type: 'sick', label: 'Sick Leave' },
                  { type: 'annual', label: 'Annual Leave' },
                  { type: 'emergency', label: 'Emergency Leave' },
                ].map(item => (
                  <Stack key={item.type} direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: getLeaveTypeColor(item.type, 'approved'),
                      }}
                    />
                    <Typography variant="body2">{item.label}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* Back Navigation */}
      <Box sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/employee/quick-actions')}
          startIcon={<ArrowBack />}
        >
          Back to Quick Actions
        </Button>
      </Box>

      {/* Date Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Leave Details for {selectedDate?.toLocaleDateString()}
        </DialogTitle>
        <DialogContent>
          {selectedDate && (
            <List>
              {getLeaveEventsForDate(selectedDate).map((leave) => (
                <div key={leave.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getLeaveTypeColor(leave.leaveType, leave.status) }}>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${leave.employeeName} (${leave.employeeId})`}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)} Leave
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {leave.startDate === leave.endDate 
                              ? 'Single day' 
                              : `${leave.startDate} to ${leave.endDate}`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Department: {leave.department}
                          </Typography>
                          {leave.reason && (
                            <Typography variant="body2" color="text.secondary">
                              Reason: {leave.reason}
                            </Typography>
                          )}
                          <Chip 
                            label={leave.status} 
                            size="small" 
                            color={
                              leave.status === 'approved' ? 'success' : 
                              leave.status === 'pending' ? 'warning' : 
                              'error'
                            } 
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider />
                </div>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeLeaveCalendar;
