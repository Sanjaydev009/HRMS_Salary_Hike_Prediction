import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
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
  Divider,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CalendarToday,
  Event,
  Public,
  Business,
  Refresh,
} from '@mui/icons-material';

interface Holiday {
  _id: string;
  name: string;
  date: string;
  type: 'national' | 'company' | 'optional';
  description?: string;
  isOptional: boolean;
}

interface HolidayStats {
  totalHolidays: number;
  nationalHolidays: number;
  companyHolidays: number;
  optionalHolidays: number;
  upcomingHolidays: number;
}

const EmployeeHolidays: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [stats, setStats] = useState<HolidayStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedYear = new Date().getFullYear();

  // Mock holidays data - replace with API call
  const mockHolidays: Holiday[] = [
    {
      _id: '1',
      name: 'New Year\'s Day',
      date: '2024-01-01',
      type: 'national',
      description: 'Start of the new year',
      isOptional: false,
    },
    {
      _id: '2',
      name: 'Republic Day',
      date: '2024-01-26',
      type: 'national',
      description: 'Indian Republic Day',
      isOptional: false,
    },
    {
      _id: '3',
      name: 'Good Friday',
      date: '2024-03-29',
      type: 'optional',
      description: 'Christian holiday',
      isOptional: true,
    },
    {
      _id: '4',
      name: 'Independence Day',
      date: '2024-08-15',
      type: 'national',
      description: 'Indian Independence Day',
      isOptional: false,
    },
    {
      _id: '5',
      name: 'Company Founding Day',
      date: '2024-09-15',
      type: 'company',
      description: 'Anniversary of company founding',
      isOptional: false,
    },
    {
      _id: '6',
      name: 'Gandhi Jayanti',
      date: '2024-10-02',
      type: 'national',
      description: 'Mahatma Gandhi\'s birthday',
      isOptional: false,
    },
    {
      _id: '7',
      name: 'Diwali',
      date: '2024-11-01',
      type: 'national',
      description: 'Festival of lights',
      isOptional: false,
    },
    {
      _id: '8',
      name: 'Christmas',
      date: '2024-12-25',
      type: 'national',
      description: 'Christian holiday',
      isOptional: false,
    },
  ];

  useEffect(() => {
    fetchHolidays();
  }, [selectedYear]);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setHolidays(mockHolidays);
        calculateStats(mockHolidays);
        setLoading(false);
      }, 1000);
    } catch (error: any) {
      console.error('Error fetching holidays:', error);
      setError('Failed to fetch holidays');
      setLoading(false);
    }
  };

  const calculateStats = (holidayList: Holiday[]) => {
    const today = new Date();
    const stats: HolidayStats = {
      totalHolidays: holidayList.length,
      nationalHolidays: holidayList.filter(h => h.type === 'national').length,
      companyHolidays: holidayList.filter(h => h.type === 'company').length,
      optionalHolidays: holidayList.filter(h => h.type === 'optional').length,
      upcomingHolidays: holidayList.filter(h => new Date(h.date) >= today).length,
    };
    setStats(stats);
  };

  const getHolidayTypeIcon = (type: string) => {
    switch (type) {
      case 'national':
        return <Public />;
      case 'company':
        return <Business />;
      case 'optional':
        return <Event />;
      default:
        return <CalendarToday />;
    }
  };

  const getHolidayTypeColor = (type: string) => {
    switch (type) {
      case 'national':
        return 'primary';
      case 'company':
        return 'secondary';
      case 'optional':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { weekday: 'short' });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) >= new Date();
  };

  const isPast = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const groupHolidaysByMonth = () => {
    const grouped: { [month: string]: Holiday[] } = {};
    holidays.forEach(holiday => {
      const date = new Date(holiday.date);
      const monthKey = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(holiday);
    });
    return grouped;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const groupedHolidays = groupHolidaysByMonth();

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Company Holidays {selectedYear}
        </Typography>
        <Tooltip title="Refresh Holidays">
          <IconButton onClick={fetchHolidays}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Holiday Statistics */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="primary">
                  {stats.totalHolidays}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Holidays
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="secondary">
                  {stats.upcomingHolidays}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upcoming
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5" style={{ color: '#1976d2' }}>
                  {stats.nationalHolidays}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  National
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5" style={{ color: '#9c27b0' }}>
                  {stats.companyHolidays}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Company
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Holidays by Month */}
      <Grid container spacing={3}>
        {Object.entries(groupedHolidays).map(([month, monthHolidays]) => (
          <Grid item xs={12} md={6} key={month}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                {month}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                {monthHolidays.map((holiday) => (
                  <Card 
                    key={holiday._id} 
                    sx={{ 
                      border: 1, 
                      borderColor: isUpcoming(holiday.date) ? 'primary.main' : 'grey.300',
                      opacity: isPast(holiday.date) ? 0.7 : 1,
                    }}
                  >
                    <CardContent sx={{ py: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ 
                          bgcolor: isUpcoming(holiday.date) ? 'primary.main' : 'grey.400',
                          width: 40,
                          height: 40,
                        }}>
                          <Typography variant="body2" fontWeight="bold">
                            {new Date(holiday.date).getDate()}
                          </Typography>
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            <Typography variant="subtitle2" fontWeight="medium">
                              {holiday.name}
                            </Typography>
                            <Chip
                              icon={getHolidayTypeIcon(holiday.type)}
                              label={holiday.type.toUpperCase()}
                              size="small"
                              color={getHolidayTypeColor(holiday.type) as any}
                            />
                            {holiday.isOptional && (
                              <Chip
                                label="Optional"
                                size="small"
                                variant="outlined"
                                color="warning"
                              />
                            )}
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            {getDayName(holiday.date)} • {formatDate(holiday.date)}
                          </Typography>
                          {holiday.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {holiday.description}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Holiday Table */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          All Holidays
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Holiday Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Day</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {holidays.map((holiday) => (
                <TableRow 
                  key={holiday._id}
                  sx={{ 
                    backgroundColor: isUpcoming(holiday.date) ? 'action.hover' : 'inherit',
                    opacity: isPast(holiday.date) ? 0.7 : 1,
                  }}
                >
                  <TableCell>
                    <Typography fontWeight={isUpcoming(holiday.date) ? 'medium' : 'normal'}>
                      {new Date(holiday.date).toLocaleDateString('en-IN')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={isUpcoming(holiday.date) ? 'medium' : 'normal'}>
                      {holiday.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        icon={getHolidayTypeIcon(holiday.type)}
                        label={holiday.type.toUpperCase()}
                        size="small"
                        color={getHolidayTypeColor(holiday.type) as any}
                      />
                      {holiday.isOptional && (
                        <Chip
                          label="Optional"
                          size="small"
                          variant="outlined"
                          color="warning"
                        />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {getDayName(holiday.date)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {holiday.description || '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default EmployeeHolidays;
