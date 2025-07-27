import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
} from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';

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

interface LeaveCalendarProps {
  requests: LeaveRequest[];
}

const LeaveCalendar: React.FC<LeaveCalendarProps> = ({ requests }) => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  // Get start and end of the month
  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');
  const startOfWeek = startOfMonth.startOf('week');
  const endOfWeek = endOfMonth.endOf('week');

  // Generate calendar days
  const calendarDays: Dayjs[] = [];
  let day = startOfWeek;
  while (day.isBefore(endOfWeek) || day.isSame(endOfWeek, 'day')) {
    calendarDays.push(day);
    day = day.add(1, 'day');
  }

  // Filter approved leaves for calendar display
  const approvedLeaves = requests.filter(req => req.status === 'Approved');

  // Get leaves for a specific date
  const getLeavesForDate = (date: Dayjs): LeaveRequest[] => {
    return approvedLeaves.filter(leave => {
      return date.isSame(leave.startDate, 'day') || 
             date.isSame(leave.endDate, 'day') || 
             (date.isAfter(leave.startDate, 'day') && date.isBefore(leave.endDate, 'day'));
    });
  };

  // Get leaves for selected date
  const selectedDateLeaves = selectedDate ? getLeavesForDate(selectedDate) : [];

  // Get all leaves for the current month
  const monthlyLeaves = approvedLeaves.filter(leave => {
    return leave.startDate.isSame(currentDate, 'month') || 
           leave.endDate.isSame(currentDate, 'month') ||
           (leave.startDate.isBefore(startOfMonth) && leave.endDate.isAfter(endOfMonth));
  });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? prev.subtract(1, 'month') : prev.add(1, 'month')
    );
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(dayjs());
    setSelectedDate(dayjs());
  };

  const getLeaveTypeColor = (leaveType: string): string => {
    const colors: { [key: string]: string } = {
      'Annual Leave': '#2196F3',
      'Sick Leave': '#FF9800',
      'Personal Leave': '#9C27B0',
      'Maternity/Paternity': '#4CAF50',
      'Emergency Leave': '#F44336',
      'Bereavement Leave': '#795548',
    };
    return colors[leaveType] || '#757575';
  };

  const renderCalendarDay = (day: Dayjs) => {
    const isCurrentMonth = day.isSame(currentDate, 'month');
    const isToday = day.isSame(dayjs(), 'day');
    const isSelected = selectedDate && day.isSame(selectedDate, 'day');
    const dayLeaves = getLeavesForDate(day);
    const isWeekend = day.day() === 0 || day.day() === 6;

    return (
      <Card
        key={day.format('YYYY-MM-DD')}
        sx={{
          minHeight: 120,
          cursor: 'pointer',
          border: isSelected ? 2 : 1,
          borderColor: isSelected ? 'primary.main' : 'divider',
          backgroundColor: isCurrentMonth 
            ? (isWeekend ? 'grey.50' : 'background.paper')
            : 'grey.100',
          '&:hover': {
            backgroundColor: isCurrentMonth ? 'action.hover' : 'grey.200',
          },
        }}
        onClick={() => setSelectedDate(day)}
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
              {day.format('D')}
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
            {dayLeaves.slice(0, 3).map((leave, index) => (
              <Chip
                key={`${leave.id}-${index}`}
                label={leave.employeeName}
                size="small"
                sx={{
                  fontSize: '0.6rem',
                  height: 18,
                  backgroundColor: getLeaveTypeColor(leave.leaveType),
                  color: 'white',
                  '& .MuiChip-label': {
                    px: 0.5,
                  },
                }}
              />
            ))}
            {dayLeaves.length > 3 && (
              <Typography variant="caption" color="text.secondary">
                +{dayLeaves.length - 3} more
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Grid container spacing={3}>
      {/* Calendar */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3 }}>
          {/* Calendar Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              {currentDate.format('MMMM YYYY')}
            </Typography>
            <Box>
              <Tooltip title="Today">
                <IconButton onClick={goToToday} size="small">
                  <Today />
                </IconButton>
              </Tooltip>
              <Tooltip title="Previous Month">
                <IconButton onClick={() => navigateMonth('prev')} size="small">
                  <ChevronLeft />
                </IconButton>
              </Tooltip>
              <Tooltip title="Next Month">
                <IconButton onClick={() => navigateMonth('next')} size="small">
                  <ChevronRight />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Days of Week Header */}
          <Grid container spacing={1} sx={{ mb: 1 }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Grid item xs key={day}>
                <Typography
                  variant="subtitle2"
                  align="center"
                  sx={{ fontWeight: 'bold', color: 'text.secondary' }}
                >
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {/* Calendar Grid */}
          <Grid container spacing={1}>
            {calendarDays.map((day) => (
              <Grid item xs key={day.format('YYYY-MM-DD')}>
                {renderCalendarDay(day)}
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>

      {/* Side Panel */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3 }}>
          {/* Legend */}
          <Typography variant="h6" gutterBottom>
            Leave Types
          </Typography>
          <Box sx={{ mb: 3 }}>
            {Object.entries({
              'Annual Leave': '#2196F3',
              'Sick Leave': '#FF9800',
              'Personal Leave': '#9C27B0',
              'Maternity/Paternity': '#4CAF50',
              'Emergency Leave': '#F44336',
              'Bereavement Leave': '#795548',
            }).map(([type, color]) => (
              <Box key={type} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    backgroundColor: color,
                    borderRadius: '50%',
                    mr: 1,
                  }}
                />
                <Typography variant="body2">{type}</Typography>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Selected Date Info */}
          {selectedDate ? (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedDate.format('MMMM D, YYYY')}
              </Typography>
              {selectedDateLeaves.length > 0 ? (
                <List dense>
                  {selectedDateLeaves.map((leave) => (
                    <ListItem key={leave.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={leave.employeeName}
                        secondary={`${leave.leaveType} - ${leave.reason}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No leaves scheduled for this date.
                </Typography>
              )}
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                This Month's Leaves
              </Typography>
              {monthlyLeaves.length > 0 ? (
                <List dense>
                  {monthlyLeaves.slice(0, 10).map((leave) => (
                    <ListItem key={leave.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={leave.employeeName}
                        secondary={
                          <>
                            <Typography variant="caption" display="block">
                              {leave.startDate.format('MMM D')} - {leave.endDate.format('MMM D')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {leave.leaveType}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                  {monthlyLeaves.length > 10 && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText>
                        <Typography variant="caption" color="text.secondary">
                          +{monthlyLeaves.length - 10} more leaves this month
                        </Typography>
                      </ListItemText>
                    </ListItem>
                  )}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No leaves scheduled for this month.
                </Typography>
              )}
            </>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default LeaveCalendar;
