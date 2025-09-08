import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Fab,
  Alert,
  Skeleton,
  Divider,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
  Add,
  FilterList,
  People,
  Warning,
  CalendarToday,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  LocalHospital,
  Person,
  Flight,
  Error
} from '@mui/icons-material';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  department: string;
  position: string;
  leaveType: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  duration: number;
  appliedDate: Date;
  approvedBy?: string;
  approvedDate?: Date;
  color: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps?: any;
}

interface TeamAvailability {
  employee: {
    id: string;
    name: string;
    email: string;
    department: string;
    position: string;
    avatar?: string;
  };
  totalDays: number;
  leaveDays: number;
  availableDays: number;
  availabilityPercentage: number;
  leaves: any[];
}

const LeaveCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventDetailOpen, setEventDetailOpen] = useState(false);
  const [teamAvailability, setTeamAvailability] = useState<TeamAvailability[]>([]);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);
  
  // Filters
  const [filters, setFilters] = useState({
    department: 'all',
    status: 'all',
    leaveType: 'all',
    view: 'month'
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Calendar view state
  const [calendarView, setCalendarView] = useState('month');
  const [showWeekends, setShowWeekends] = useState(true);

  const departments = ['All Departments', 'Engineering', 'HR', 'Marketing', 'Sales', 'Finance'];
  const leaveTypes = ['All Types', 'vacation', 'sick', 'personal', 'emergency', 'maternity', 'paternity'];

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Fetch calendar events
  const fetchCalendarEvents = useCallback(async () => {
    console.log('🗓️ FETCHING CALENDAR EVENTS - START');
    setLoading(true);
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      const queryParams = new URLSearchParams({
        month: month.toString(),
        year: year.toString(),
        view: filters.view,
        ...(filters.department !== 'all' && { department: filters.department })
      });

      const url = `/api/calendar/events?${queryParams}`;
      console.log('🌐 Fetching URL:', url);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response OK:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Raw API data:', data);
        console.log('📊 Events count:', data.events?.length || 0);
        
        const formattedEvents = data.events.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          appliedDate: new Date(event.appliedDate),
          approvedDate: event.approvedDate ? new Date(event.approvedDate) : undefined
        }));
        
        console.log('✅ Formatted events:', formattedEvents);
        setEvents(formattedEvents);
      } else {
        console.error('❌ API Response not OK:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('💥 Error fetching calendar events:', error);
    } finally {
      setLoading(false);
      console.log('🗓️ FETCHING CALENDAR EVENTS - END');
    }
  }, [currentDate, filters]);

  // Fetch team availability
  const fetchTeamAvailability = async () => {
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const queryParams = new URLSearchParams({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        ...(filters.department !== 'all' && { department: filters.department })
      });

      const response = await fetch(`/api/calendar/team-availability?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTeamAvailability(data.availability);
      }
    } catch (error) {
      console.error('Error fetching team availability:', error);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, [fetchCalendarEvents]);

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Event handlers
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventDetailOpen(true);
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      eventStart.setHours(0, 0, 0, 0);
      eventEnd.setHours(23, 59, 59, 999);
      
      const checkDate = new Date(date);
      checkDate.setHours(12, 0, 0, 0);
      
      return checkDate >= eventStart && checkDate <= eventEnd;
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  // Get leave type icon
  const getLeaveTypeIcon = (type: string) => {
    switch (type) {
      case 'sick': return <LocalHospital fontSize="small" />;
      case 'vacation': return <Flight fontSize="small" />;
      case 'personal': return <Person fontSize="small" />;
      case 'emergency': return <Error fontSize="small" />;
      default: return <CalendarToday fontSize="small" />;
    }
  };

  // Get leave type color
  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'sick': return '#e91e63';
      case 'vacation': return '#2196f3';
      case 'personal': return '#9c27b0';
      case 'emergency': return '#ff5722';
      case 'maternity': return '#8bc34a';
      case 'paternity': return '#607d8b';
      default: return '#4caf50';
    }
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Debug logging
  console.log('🎨 CALENDAR COMPONENT RENDER');
  console.log('📊 Events state:', events);
  console.log('⏰ Loading state:', loading);
  console.log('📅 Current date:', currentDate);
  console.log('🎯 Calendar days generated:', calendarDays.length);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          📅 Leave Calendar
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<People />}
            onClick={() => {
              fetchTeamAvailability();
              setAvailabilityOpen(true);
            }}
          >
            Team Availability
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setFiltersOpen(true)}
          >
            Filters
          </Button>
          
          <Fab
            color="primary"
            size="medium"
            onClick={() => {/* Handle new leave request */}}
            sx={{ ml: 1 }}
          >
            <Add />
          </Fab>
        </Box>
      </Box>

      {/* Calendar Navigation */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handlePrevMonth} color="primary">
              <ChevronLeft />
            </IconButton>
            
            <Typography variant="h5" sx={{ fontWeight: 'bold', minWidth: 200, textAlign: 'center' }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Typography>
            
            <IconButton onClick={handleNextMonth} color="primary">
              <ChevronRight />
            </IconButton>
            
            <Button
              variant="outlined"
              startIcon={<Today />}
              onClick={handleToday}
              sx={{ ml: 2 }}
            >
              Today
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showWeekends}
                  onChange={(e) => setShowWeekends(e.target.checked)}
                />
              }
              label="Show Weekends"
            />
          </Box>
        </Box>
      </Paper>

      {/* Calendar Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <CalendarToday />
                </Avatar>
                <Box>
                  <Typography variant="h6">{events.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Leaves
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <HourglassEmpty />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {events.filter(e => e.status === 'pending').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Approval
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {events.filter(e => e.status === 'approved').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <Warning />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {conflicts.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Conflicts
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Calendar */}
      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={80} />
            ))}
          </Box>
        ) : (
          <>
            {/* Week Header */}
            <Grid container spacing={1} sx={{ mb: 1 }}>
              {weekDays.map((day, index) => {
                if (!showWeekends && (index === 0 || index === 6)) return null;
                return (
                  <Grid item xs key={day}>
                    <Typography
                      variant="subtitle2"
                      align="center"
                      sx={{ fontWeight: 'bold', color: 'text.secondary', py: 1 }}
                    >
                      {day}
                    </Typography>
                  </Grid>
                );
              })}
            </Grid>

            {/* Calendar Grid */}
            <Grid container spacing={1}>
              {calendarDays.map((day, index) => {
                if (!showWeekends && (day.getDay() === 0 || day.getDay() === 6)) return null;
                
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isToday = day.toDateString() === new Date().toDateString();
                const dayEvents = getEventsForDate(day);
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                return (
                  <Grid item xs key={day.toISOString()}>
                    <Card
                      sx={{
                        minHeight: 120,
                        cursor: 'pointer',
                        border: isToday ? 2 : 1,
                        borderColor: isToday ? 'primary.main' : 'divider',
                        backgroundColor: isCurrentMonth 
                          ? (isWeekend ? 'grey.50' : 'background.paper')
                          : 'grey.100',
                        '&:hover': {
                          backgroundColor: isCurrentMonth ? 'action.hover' : 'grey.200',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: isToday ? 'bold' : 'normal',
                              color: isCurrentMonth 
                                ? (isToday ? 'primary.main' : 'text.primary')
                                : 'text.disabled',
                            }}
                          >
                            {day.getDate()}
                          </Typography>
                          {isToday && (
                            <Chip 
                              size="small" 
                              label="Today" 
                              color="primary" 
                              sx={{ fontSize: '0.6rem', height: 16 }} 
                            />
                          )}
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {dayEvents.slice(0, 3).map((event, eventIndex) => (
                            <Chip
                              key={`${event.id}-${eventIndex}`}
                              label={event.employeeName}
                              size="small"
                              icon={getLeaveTypeIcon(event.leaveType)}
                              onClick={() => handleEventClick(event)}
                              sx={{
                                fontSize: '0.6rem',
                                height: 20,
                                backgroundColor: getLeaveTypeColor(event.leaveType),
                                color: 'white',
                                '& .MuiChip-label': {
                                  px: 0.5,
                                },
                                '& .MuiChip-icon': {
                                  color: 'white',
                                  fontSize: '12px'
                                }
                              }}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <Typography variant="caption" color="text.secondary">
                              +{dayEvents.length - 3} more
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}
      </Paper>

      {/* Event Detail Dialog */}
      <Dialog
        open={eventDetailOpen}
        onClose={() => setEventDetailOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={selectedEvent.employeeAvatar}>
                  {selectedEvent.employeeName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {getLeaveTypeIcon(selectedEvent.leaveType)} {selectedEvent.employeeName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedEvent.department} • {selectedEvent.position}
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  <Chip
                    label={selectedEvent.status}
                    color={getStatusColor(selectedEvent.status) as any}
                    variant="filled"
                  />
                </Box>
              </Box>
            </DialogTitle>

            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Leave Details
                      </Typography>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Leave Type
                          </Typography>
                          <Typography variant="body1" sx={{ textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getLeaveTypeIcon(selectedEvent.leaveType)} {selectedEvent.leaveType}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Duration
                          </Typography>
                          <Typography variant="body1">
                            {selectedEvent.duration} day{selectedEvent.duration > 1 ? 's' : ''}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Start Date
                          </Typography>
                          <Typography variant="body1">
                            {selectedEvent.start.toLocaleDateString()}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            End Date
                          </Typography>
                          <Typography variant="body1">
                            {selectedEvent.end.toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Application Details
                      </Typography>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Applied Date
                          </Typography>
                          <Typography variant="body1">
                            {selectedEvent.appliedDate.toLocaleDateString()}
                          </Typography>
                        </Box>
                        
                        {selectedEvent.approvedBy && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Approved By
                            </Typography>
                            <Typography variant="body1">
                              {selectedEvent.approvedBy}
                            </Typography>
                          </Box>
                        )}
                        
                        {selectedEvent.approvedDate && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Approved Date
                            </Typography>
                            <Typography variant="body1">
                              {selectedEvent.approvedDate.toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}
                        
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Reason
                          </Typography>
                          <Typography variant="body1">
                            {selectedEvent.reason || 'No reason provided'}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setEventDetailOpen(false)}>
                Close
              </Button>
              {selectedEvent.status === 'pending' && (
                <>
                  <Button color="error" variant="outlined">
                    Reject
                  </Button>
                  <Button color="success" variant="contained">
                    Approve
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Team Availability Dialog */}
      <Dialog
        open={availabilityOpen}
        onClose={() => setAvailabilityOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Team Availability - {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {teamAvailability.map((member) => (
              <Grid item xs={12} sm={6} md={4} key={member.employee.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar src={member.employee.avatar}>
                        {member.employee.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">
                          {member.employee.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {member.employee.department}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Availability
                      </Typography>
                      <Typography variant="h6" color={
                        member.availabilityPercentage >= 80 ? 'success.main' :
                        member.availabilityPercentage >= 60 ? 'warning.main' : 'error.main'
                      }>
                        {member.availabilityPercentage}%
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2">
                      Available: {member.availableDays}/{member.totalDays} days
                    </Typography>
                    <Typography variant="body2">
                      On Leave: {member.leaveDays} days
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvailabilityOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Filters Dialog */}
      <Dialog
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Calendar Filters</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={filters.department}
                label="Department"
                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
              >
                <MenuItem value="all">All Departments</MenuItem>
                {departments.slice(1).map(dept => (
                  <MenuItem key={dept} value={dept.toLowerCase()}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Leave Type</InputLabel>
              <Select
                value={filters.leaveType}
                label="Leave Type"
                onChange={(e) => setFilters(prev => ({ ...prev, leaveType: e.target.value }))}
              >
                <MenuItem value="all">All Types</MenuItem>
                {leaveTypes.slice(1).map(type => (
                  <MenuItem key={type} value={type}>
                    {getLeaveTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFiltersOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              fetchCalendarEvents();
              setFiltersOpen(false);
            }}
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveCalendar;
