import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Badge,
  Divider,
  Button,
  TextField,
  InputAdornment,
  Collapse,
  Stack,
  LinearProgress,
  useTheme,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Container,
  Fade,
  Zoom,
  ButtonGroup,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import api from '../../services/api';

interface Employee {
  _id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  status: string;
  phone?: string;
  avatar?: string;
  hireDate?: string;
  salary?: number;
}

interface Department {
  _id: string;
  count: number;
  avgSalary: number;
}

interface AttendanceRecord {
  employeeName: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`employee-tabpanel-${index}`}
      aria-labelledby={`employee-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

const IntegratedEmployeeManagement: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeesRes, analyticsRes, attendanceRes] = await Promise.all([
        api.get('/employees'),
        api.get('/dashboard/analytics'),
        api.get('/attendance/today')
      ]);

      setEmployees(employeesRes.data.employees || employeesRes.data);
      setDepartments(analyticsRes.data.analytics?.departmentStats || []);
      setAttendance(attendanceRes.data.attendance || attendanceRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      default: return 'default';
    }
  };

  const departmentData = departments.map(dept => ({
    name: dept._id,
    count: dept.count,
    avgSalary: dept.avgSalary
  }));

  const attendanceStats = {
    present: attendance.filter(a => a.status === 'Present').length,
    absent: attendance.filter(a => a.status === 'Absent').length,
    late: attendance.filter(a => a.status === 'Late').length,
  };

  const attendancePieData = [
    { name: 'Present', value: attendanceStats.present, color: '#4caf50' },
    { name: 'Absent', value: attendanceStats.absent, color: '#f44336' },
    { name: 'Late', value: attendanceStats.late, color: '#ff9800' },
  ];

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default', p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Enhanced Header with Actions */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        backdropFilter: 'blur(10px)',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ 
            width: { xs: 40, sm: 48 }, 
            height: { xs: 40, sm: 48 }, 
            bgcolor: 'primary.main',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
          }}>
            <DashboardIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
          </Avatar>
          <Box>
            <Typography variant="h3" sx={{ 
              fontWeight: 700, 
              color: 'text.primary',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' }
            }}>
              Employee Management Hub
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5, display: { xs: 'none', sm: 'block' } }}>
              Comprehensive employee data and analytics center
            </Typography>
          </Box>
        </Box>
        
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ minWidth: { xs: '100%', sm: 'auto' } }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            sx={{ 
              borderRadius: 3,
              textTransform: 'none',
              px: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
            }}
          >
            Add Employee
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            sx={{ borderRadius: 3, textTransform: 'none', px: 3 }}
          >
            Export Data
          </Button>
          <IconButton 
            onClick={fetchData}
            sx={{ 
              borderRadius: 2, 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* Enhanced Quick Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            title: 'Total Employees',
            value: employees.length,
            icon: PeopleIcon,
            color: theme.palette.primary.main,
            gradient: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            change: '+12%',
            changeColor: 'success.main'
          },
          {
            title: 'Present Today',
            value: attendanceStats.present,
            icon: CheckCircleIcon,
            color: theme.palette.success.main,
            gradient: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
            change: '+5%',
            changeColor: 'success.main'
          },
          {
            title: 'Departments',
            value: departments.length,
            icon: BusinessIcon,
            color: theme.palette.info.main,
            gradient: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
            change: '+2%',
            changeColor: 'success.main'
          },
          {
            title: 'Avg Attendance',
            value: '94%',
            icon: TrendingUpIcon,
            color: theme.palette.warning.main,
            gradient: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
            change: '+3%',
            changeColor: 'success.main'
          },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Zoom in timeout={300 + index * 100}>
              <Card sx={{ 
                height: '100%', 
                borderRadius: 3, 
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': { 
                  transform: 'translateY(-8px)', 
                  boxShadow: '0 16px 48px rgba(0,0,0,0.15)' 
                },
                background: `linear-gradient(135deg, ${alpha(stat.color, 0.05)}, ${alpha(stat.color, 0.1)})`
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Avatar sx={{ 
                      width: 56, 
                      height: 56, 
                      background: stat.gradient,
                      boxShadow: `0 8px 24px ${alpha(stat.color, 0.3)}`
                    }}>
                      <stat.icon sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Chip 
                      label={stat.change} 
                      size="small" 
                      sx={{ 
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        color: 'success.main',
                        fontWeight: 600 
                      }} 
                    />
                  </Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    color: stat.color,
                    mb: 1,
                    fontSize: { xs: '1.75rem', sm: '2.125rem' }
                  }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      {/* Enhanced Main Content Tabs */}
      <Paper sx={{ 
        borderRadius: 3, 
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
      }}>
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})`
        }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                py: 2,
                px: 4,
                minHeight: 64,
              },
              '& .Mui-selected': {
                color: 'primary.main',
              }
            }}
          >
            <Tab label="📋 Employee Directory" />
            <Tab label="🏢 Department Analytics" />
            <Tab label="📅 Live Attendance" />
            <Tab label="📊 HR Insights" />
          </Tabs>
        </Box>

        {/* Enhanced Employee Directory Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 4 }}>
            {/* Search and Filter Bar */}
            <Box sx={{ 
              mb: 4, 
              display: 'flex', 
              gap: 3, 
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <TextField
                placeholder="Search employees by name, position, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="medium"
                sx={{ 
                  flexGrow: 1, 
                  minWidth: 300,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
              <ButtonGroup variant="outlined" sx={{ borderRadius: 3 }}>
                <Button startIcon={<FilterIcon />} sx={{ textTransform: 'none', px: 3 }}>
                  Filters
                </Button>
                <Button sx={{ textTransform: 'none', px: 3 }}>
                  Sort
                </Button>
              </ButtonGroup>
            </Box>

            {/* Enhanced Employee Cards Grid */}
            <Grid container spacing={3}>
              {filteredEmployees.map((employee, index) => (
                <Grid item xs={12} sm={6} lg={4} xl={3} key={employee._id}>
                  <Fade in timeout={200 + index * 50}>
                    <Card sx={{ 
                      borderRadius: 3, 
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': { 
                        transform: 'translateY(-8px)', 
                        boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
                        '& .employee-actions': {
                          opacity: 1,
                          transform: 'translateY(0)'
                        }
                      },
                      overflow: 'hidden',
                      background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 1)})`
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        {/* Employee Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                          <Avatar sx={{ 
                            width: 56, 
                            height: 56,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`
                          }}>
                            {employee.name.charAt(0)}
                          </Avatar>
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography 
                              variant="h6" 
                              noWrap
                              sx={{ 
                                fontWeight: 700, 
                                color: 'text.primary'
                              }}
                            >
                              {employee.name}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              noWrap
                              sx={{ 
                                fontWeight: 500
                              }}
                            >
                              {employee.position}
                            </Typography>
                          </Box>
                          <Chip 
                            label={employee.status} 
                            color={getStatusColor(employee.status) as any}
                            size="small"
                            sx={{ 
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                        
                        {/* Employee Details */}
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <BusinessIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {employee.department}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <EmailIcon sx={{ fontSize: 18, color: 'info.main' }} />
                            <Typography 
                              variant="body2" 
                              noWrap
                              sx={{ 
                                fontSize: '0.85rem',
                                color: 'text.secondary',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {employee.email}
                            </Typography>
                          </Box>
                          {employee.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <PhoneIcon sx={{ fontSize: 18, color: 'success.main' }} />
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {employee.phone}
                              </Typography>
                            </Box>
                          )}
                        </Stack>

                        {/* Action Buttons */}
                        <Box 
                          className="employee-actions"
                          sx={{ 
                            mt: 3, 
                            display: 'flex', 
                            gap: 1,
                            opacity: 0,
                            transform: 'translateY(10px)',
                            transition: 'all 0.3s ease-in-out'
                          }}
                        >
                          <Button 
                            size="small" 
                            variant="contained" 
                            startIcon={<ViewIcon />}
                            sx={{ 
                              flex: 1, 
                              borderRadius: 2, 
                              textTransform: 'none',
                              fontWeight: 600 
                            }}
                          >
                            View
                          </Button>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            startIcon={<EditIcon />}
                            sx={{ 
                              flex: 1, 
                              borderRadius: 2, 
                              textTransform: 'none',
                              fontWeight: 600 
                            }}
                          >
                            Edit
                          </Button>
                          <IconButton size="small" sx={{ borderRadius: 2 }}>
                            <MoreVertIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>

            {/* Empty State */}
            {filteredEmployees.length === 0 && !loading && (
              <Box sx={{ 
                textAlign: 'center', 
                py: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}>
                <Avatar sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  mb: 2
                }}>
                  <PersonIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 600 }}>
                  No employees found
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Try adjusting your search criteria
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Department Analytics Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} lg={8}>
                <Box sx={{ height: 400 }}>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                    📊 Department Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          borderRadius: 8,
                          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill={theme.palette.primary.main}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              
              <Grid item xs={12} lg={4}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                  🏢 Department Overview
                </Typography>
                <Stack spacing={3}>
                  {departments.map((dept, index) => (
                    <Zoom in timeout={200 + index * 100} key={dept._id}>
                      <Card sx={{ 
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                            {dept._id}
                          </Typography>
                          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                            👥 {dept.count} employees
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            💰 Avg: ${dept.avgSalary?.toLocaleString()}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Zoom>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Live Attendance Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={5}>
                <Box sx={{ height: 350 }}>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                    📈 Attendance Overview
                  </Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attendancePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        dataKey="value"
                      >
                        {attendancePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={7}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                  📋 Today's Records
                </Typography>
                <TableContainer component={Paper} sx={{ borderRadius: 3, maxHeight: 400 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Check In</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Check Out</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendance.slice(0, 15).map((record, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {record.employeeName.charAt(0)}
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {record.employeeName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={record.status} 
                              color={getStatusColor(record.status) as any}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {record.checkIn || '--'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {record.checkOut || '--'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* HR Insights Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ 
                  borderRadius: 3, 
                  p: 3,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)}, ${alpha(theme.palette.success.main, 0.1)})`
                }}>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                    📈 Employee Growth
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                        This Quarter
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={75} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          mb: 2,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4
                          }
                        }} 
                      />
                      <Typography variant="body2" color="text.secondary">
                        15 new hires • Target: 20
                      </Typography>
                    </Box>
                    <Typography variant="h3" color="success.main" sx={{ fontWeight: 800 }}>
                      +12%
                    </Typography>
                  </Box>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card sx={{ 
                  borderRadius: 3, 
                  p: 3,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)}, ${alpha(theme.palette.info.main, 0.1)})`
                }}>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                    🎯 Retention Rate
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                        This Year
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={94} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          mb: 2,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4
                          }
                        }} 
                      />
                      <Typography variant="body2" color="text.secondary">
                        Above industry average (85%)
                      </Typography>
                    </Box>
                    <Typography variant="h3" color="info.main" sx={{ fontWeight: 800 }}>
                      94%
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>

      {loading && (
        <Box sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          bgcolor: alpha(theme.palette.background.default, 0.8), 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
              Loading Employee Data...
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default IntegratedEmployeeManagement;
