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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Badge,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  EventNote,
  ArrowBack,
  CalendarToday,
  Celebration,
  Public,
  LocationOn,
  Schedule,
  Refresh,
  NotificationAdd,
  Download,
  Share,
  Event,
  Today,
  Weekend,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'national' | 'religious' | 'cultural' | 'company' | 'optional';
  description: string;
  isOptional: boolean;
  category: string;
  region?: string;
  observedBy: string[];
  traditions?: string[];
  significance?: string;
}

interface HolidayStats {
  total: number;
  upcoming: number;
  thisMonth: number;
  nationalHolidays: number;
  companyHolidays: number;
  optionalHolidays: number;
}

const EmployeeHolidays: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [reminderDialog, setReminderDialog] = useState(false);

  // Real-time data refresh
  useEffect(() => {
    fetchHolidayData();
    
    // Auto-refresh every 60 seconds for real-time updates
    const interval = setInterval(() => {
      fetchHolidayData();
      setLastUpdate(new Date());
      console.log('Holiday data refreshed at:', new Date().toLocaleTimeString());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchHolidayData = async () => {
    try {
      setLoading(true);
      
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock holiday data for 2025
      const mockHolidays: Holiday[] = [
        {
          id: '1',
          name: 'New Year\'s Day',
          date: '2025-01-01',
          type: 'national',
          description: 'First day of the Gregorian calendar year',
          isOptional: false,
          category: 'Public Holiday',
          observedBy: ['All Employees'],
          traditions: ['Resolutions', 'Celebrations', 'Family time'],
          significance: 'Marks the beginning of a new year with fresh starts and new goals',
        },
        {
          id: '2',
          name: 'Republic Day',
          date: '2025-01-26',
          type: 'national',
          description: 'National holiday celebrating the constitution of India',
          isOptional: false,
          category: 'National Holiday',
          region: 'India',
          observedBy: ['All Employees'],
          traditions: ['Flag hoisting', 'Parade watching', 'Patriotic songs'],
          significance: 'Commemorates the adoption of the Constitution of India',
        },
        {
          id: '3',
          name: 'Holi',
          date: '2025-03-14',
          type: 'religious',
          description: 'Festival of colors and spring',
          isOptional: false,
          category: 'Religious Holiday',
          observedBy: ['Hindu employees', 'Cultural enthusiasts'],
          traditions: ['Playing with colors', 'Sweets', 'Music and dance'],
          significance: 'Celebrates the victory of good over evil and the arrival of spring',
        },
        {
          id: '4',
          name: 'Good Friday',
          date: '2025-04-18',
          type: 'religious',
          description: 'Commemoration of the crucifixion of Jesus Christ',
          isOptional: true,
          category: 'Religious Holiday',
          observedBy: ['Christian employees'],
          traditions: ['Prayer services', 'Fasting', 'Church attendance'],
          significance: 'Remembers the sacrifice of Jesus Christ for humanity',
        },
        {
          id: '5',
          name: 'Independence Day',
          date: '2025-08-15',
          type: 'national',
          description: 'National holiday celebrating independence from British rule',
          isOptional: false,
          category: 'National Holiday',
          region: 'India',
          observedBy: ['All Employees'],
          traditions: ['Flag hoisting', 'Cultural programs', 'Patriotic activities'],
          significance: 'Celebrates India\'s independence from British colonial rule in 1947',
        },
        {
          id: '6',
          name: 'Gandhi Jayanti',
          date: '2025-10-02',
          type: 'national',
          description: 'Birthday of Mahatma Gandhi',
          isOptional: false,
          category: 'National Holiday',
          observedBy: ['All Employees'],
          traditions: ['Peace activities', 'Community service', 'Non-violence promotion'],
          significance: 'Honors the Father of the Nation and his principles of non-violence',
        },
        {
          id: '7',
          name: 'Diwali',
          date: '2025-10-20',
          type: 'religious',
          description: 'Festival of lights',
          isOptional: false,
          category: 'Religious Holiday',
          observedBy: ['Hindu employees', 'Cultural enthusiasts'],
          traditions: ['Lighting diyas', 'Fireworks', 'Sweets exchange', 'Family gatherings'],
          significance: 'Celebrates the triumph of light over darkness and good over evil',
        },
        {
          id: '8',
          name: 'Christmas Day',
          date: '2025-12-25',
          type: 'religious',
          description: 'Birth of Jesus Christ',
          isOptional: false,
          category: 'Religious Holiday',
          observedBy: ['Christian employees', 'Cultural enthusiasts'],
          traditions: ['Christmas tree', 'Gift exchange', 'Family meals', 'Carol singing'],
          significance: 'Celebrates the birth of Jesus Christ and the spirit of giving',
        },
        {
          id: '9',
          name: 'Company Foundation Day',
          date: '2025-09-15',
          type: 'company',
          description: 'Annual celebration of company establishment',
          isOptional: false,
          category: 'Company Holiday',
          observedBy: ['All Employees'],
          traditions: ['Company events', 'Team activities', 'Achievement awards'],
          significance: 'Celebrates our company\'s journey and achievements',
        },
        {
          id: '10',
          name: 'Eid ul-Fitr',
          date: '2025-04-30',
          type: 'religious',
          description: 'End of Ramadan fasting',
          isOptional: true,
          category: 'Religious Holiday',
          observedBy: ['Muslim employees'],
          traditions: ['Special prayers', 'Feasting', 'Gift giving', 'Charity'],
          significance: 'Marks the end of the holy month of Ramadan',
        },
      ];
      
      setHolidays(mockHolidays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    } catch (error) {
      console.error('Error fetching holiday data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHolidayStats = (): HolidayStats => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    
    return {
      total: holidays.length,
      upcoming: holidays.filter(h => new Date(h.date) >= today).length,
      thisMonth: holidays.filter(h => {
        const hDate = new Date(h.date);
        return hDate.getMonth() === thisMonth && hDate.getFullYear() === thisYear;
      }).length,
      nationalHolidays: holidays.filter(h => h.type === 'national').length,
      companyHolidays: holidays.filter(h => h.type === 'company').length,
      optionalHolidays: holidays.filter(h => h.isOptional).length,
    };
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'national': return '#f44336';
      case 'religious': return '#9c27b0';
      case 'cultural': return '#ff9800';
      case 'company': return '#2196f3';
      case 'optional': return '#4caf50';
      default: return '#757575';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'national': return <Public />;
      case 'religious': return <Celebration />;
      case 'cultural': return <Event />;
      case 'company': return <EventNote />;
      default: return <CalendarToday />;
    }
  };

  const isUpcoming = (date: string) => {
    return new Date(date) >= new Date();
  };

  const getDaysUntil = (date: string) => {
    const today = new Date();
    const holidayDate = new Date(date);
    const diffTime = holidayDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getFilteredHolidays = () => {
    if (filterType === 'all') return holidays;
    if (filterType === 'upcoming') return holidays.filter(h => isUpcoming(h.date));
    return holidays.filter(h => h.type === filterType);
  };

  const handleHolidayClick = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setDialogOpen(true);
  };

  const handleSetReminder = () => {
    setReminderDialog(true);
  };

  const exportHolidays = () => {
    const csvContent = holidays.map(h => 
      `${h.name},${h.date},${h.type},${h.category},${h.description}`
    ).join('\n');
    
    const blob = new Blob([`Name,Date,Type,Category,Description\n${csvContent}`], 
      { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'company_holidays_2025.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const stats = getHolidayStats();
  const filteredHolidays = getFilteredHolidays();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', color: 'white' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" gutterBottom>
              Company Holidays 2025
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Plan your time off with our comprehensive holiday calendar
            </Typography>
          </Box>
          <Stack direction="row" alignItems="center" spacing={2}>
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
                Real-time Updates
              </Typography>
            </Stack>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Download />}
              onClick={exportHolidays}
              sx={{ color: 'white', borderColor: 'white' }}
            >
              Export
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} md={2}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  <CalendarToday />
                </Avatar>
                <Box>
                  <Typography variant="h5">{stats.total}</Typography>
                  <Typography variant="caption">Total Holidays</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} md={2}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ bgcolor: 'success.light' }}>
                  <Today />
                </Avatar>
                <Box>
                  <Typography variant="h5">{stats.upcoming}</Typography>
                  <Typography variant="caption">Upcoming</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} md={2}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ bgcolor: 'warning.light' }}>
                  <Schedule />
                </Avatar>
                <Box>
                  <Typography variant="h5">{stats.thisMonth}</Typography>
                  <Typography variant="caption">This Month</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} md={2}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ bgcolor: 'error.light' }}>
                  <Public />
                </Avatar>
                <Box>
                  <Typography variant="h5">{stats.nationalHolidays}</Typography>
                  <Typography variant="caption">National</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} md={2}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ bgcolor: 'info.light' }}>
                  <EventNote />
                </Avatar>
                <Box>
                  <Typography variant="h5">{stats.companyHolidays}</Typography>
                  <Typography variant="caption">Company</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} md={2}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ bgcolor: 'secondary.light' }}>
                  <Weekend />
                </Avatar>
                <Box>
                  <Typography variant="h5">{stats.optionalHolidays}</Typography>
                  <Typography variant="caption">Optional</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {['all', 'upcoming', 'national', 'religious', 'company', 'optional'].map(type => (
              <Button
                key={type}
                variant={filterType === type ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setFilterType(type)}
                sx={{ mb: { xs: 1, sm: 0 } }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <Typography variant="caption" color="text.secondary">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              startIcon={<Refresh />}
              onClick={fetchHolidayData}
              disabled={loading}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Holiday List */}
          <Grid item xs={12} lg={8}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Holiday Calendar ({filteredHolidays.length} holidays)
              </Typography>
              
              <List>
                {filteredHolidays.map((holiday, index) => (
                  <React.Fragment key={holiday.id}>
                    <ListItem 
                      alignItems="flex-start" 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'action.hover' },
                        borderRadius: 1,
                        mb: 1,
                      }}
                      onClick={() => handleHolidayClick(holiday)}
                    >
                      <ListItemAvatar>
                        <Badge
                          badgeContent={isUpcoming(holiday.date) ? getDaysUntil(holiday.date) : null}
                          color="primary"
                          max={999}
                          overlap="circular"
                        >
                          <Avatar sx={{ bgcolor: getTypeColor(holiday.type) }}>
                            {getTypeIcon(holiday.type)}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      
                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="h6" component="span">
                              {holiday.name}
                            </Typography>
                            <Chip 
                              label={holiday.type} 
                              size="small" 
                              sx={{ 
                                backgroundColor: getTypeColor(holiday.type) + '20',
                                color: getTypeColor(holiday.type) 
                              }}
                            />
                            {holiday.isOptional && (
                              <Chip 
                                label="Optional" 
                                size="small" 
                                variant="outlined"
                                color="secondary"
                              />
                            )}
                            {isUpcoming(holiday.date) && getDaysUntil(holiday.date) <= 7 && (
                              <Chip 
                                label="Soon" 
                                size="small" 
                                color="warning"
                              />
                            )}
                          </Stack>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.primary">
                              📅 {new Date(holiday.date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {holiday.description}
                            </Typography>
                            {isUpcoming(holiday.date) && (
                              <Typography variant="caption" color="primary">
                                {getDaysUntil(holiday.date) === 0 
                                  ? 'Today!' 
                                  : getDaysUntil(holiday.date) === 1 
                                    ? 'Tomorrow' 
                                    : `${getDaysUntil(holiday.date)} days away`
                                }
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      
                      <Stack direction="column" spacing={1} alignItems="end">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetReminder();
                          }}
                        >
                          <NotificationAdd />
                        </IconButton>
                      </Stack>
                    </ListItem>
                    {index < filteredHolidays.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Next Holiday */}
              {stats.upcoming > 0 && (
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Today color="primary" />
                    Next Holiday
                  </Typography>
                  {(() => {
                    const nextHoliday = holidays.find(h => isUpcoming(h.date));
                    if (!nextHoliday) return null;
                    return (
                      <Card variant="outlined" sx={{ p: 2, bgcolor: getTypeColor(nextHoliday.type) + '10' }}>
                        <Typography variant="h6" color={getTypeColor(nextHoliday.type)}>
                          {nextHoliday.name}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          {new Date(nextHoliday.date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getDaysUntil(nextHoliday.date) === 0 
                            ? 'Today!' 
                            : `${getDaysUntil(nextHoliday.date)} days to go`
                          }
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.max(0, 100 - (getDaysUntil(nextHoliday.date) / 365 * 100))} 
                          sx={{ mt: 1 }}
                        />
                      </Card>
                    );
                  })()}
                </Paper>
              )}

              {/* Holiday Types Distribution */}
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Holiday Distribution
                </Typography>
                <Stack spacing={2}>
                  {[
                    { type: 'national', count: stats.nationalHolidays, label: 'National' },
                    { type: 'religious', count: holidays.filter(h => h.type === 'religious').length, label: 'Religious' },
                    { type: 'company', count: stats.companyHolidays, label: 'Company' },
                    { type: 'optional', count: stats.optionalHolidays, label: 'Optional' },
                  ].map(item => (
                    <Box key={item.type}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="body2">{item.label}</Typography>
                        <Typography variant="body2">{item.count}</Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={(item.count / stats.total) * 100}
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getTypeColor(item.type)
                          }
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Paper>

              {/* Quick Actions */}
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Stack spacing={1}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Download />}
                    onClick={exportHolidays}
                  >
                    Export Calendar
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<NotificationAdd />}
                    onClick={handleSetReminder}
                  >
                    Set Reminders
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Share />}
                  >
                    Share Calendar
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      )}

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

      {/* Holiday Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: selectedHoliday ? getTypeColor(selectedHoliday.type) : 'primary.main', color: 'white' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
              {selectedHoliday && getTypeIcon(selectedHoliday.type)}
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedHoliday?.name}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {selectedHoliday && new Date(selectedHoliday.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedHoliday && (
            <Stack spacing={3}>
              <Alert 
                severity="info" 
                sx={{ 
                  backgroundColor: getTypeColor(selectedHoliday.type) + '10',
                  border: `1px solid ${getTypeColor(selectedHoliday.type)}30`
                }}
              >
                <Typography variant="body2">
                  <strong>Significance:</strong> {selectedHoliday.significance || selectedHoliday.description}
                </Typography>
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Holiday Details</Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Type</Typography>
                      <Chip 
                        label={selectedHoliday.type} 
                        sx={{ 
                          backgroundColor: getTypeColor(selectedHoliday.type) + '20',
                          color: getTypeColor(selectedHoliday.type) 
                        }}
                      />
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">Category</Typography>
                      <Typography variant="body1">{selectedHoliday.category}</Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">Observed By</Typography>
                      <Typography variant="body1">{selectedHoliday.observedBy.join(', ')}</Typography>
                    </Box>
                    
                    {selectedHoliday.region && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">Region</Typography>
                        <Typography variant="body1">{selectedHoliday.region}</Typography>
                      </Box>
                    )}
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  {selectedHoliday.traditions && (
                    <Box>
                      <Typography variant="h6" gutterBottom>Traditions & Customs</Typography>
                      <List dense>
                        {selectedHoliday.traditions.map((tradition, index) => (
                          <ListItem key={index} sx={{ pl: 0 }}>
                            <ListItemText primary={`• ${tradition}`} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSetReminder} startIcon={<NotificationAdd />}>
            Set Reminder
          </Button>
          <Button onClick={() => setDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reminder Dialog */}
      <Dialog open={reminderDialog} onClose={() => setReminderDialog(false)}>
        <DialogTitle>Set Holiday Reminder</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Get notified before upcoming holidays to plan your time off.
          </Typography>
          <TextField
            select
            fullWidth
            label="Reminder Time"
            defaultValue="1"
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value="1">1 day before</option>
            <option value="3">3 days before</option>
            <option value="7">1 week before</option>
            <option value="14">2 weeks before</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReminderDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setReminderDialog(false);
              // Add reminder logic here
            }}
          >
            Set Reminder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeHolidays;
