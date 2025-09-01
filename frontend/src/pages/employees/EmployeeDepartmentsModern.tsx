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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  useMediaQuery,
  CardActions,
  CardHeader,
  Badge,
  Fab,
  Menu,
  ListItemIcon,
} from '@mui/material';
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Star as StarIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  AccountTree as AccountTreeIcon,
  Visibility as VisibilityIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  SupervisorAccount as SupervisorAccountIcon,
  WorkOutline as WorkOutlineIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
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
} from 'recharts';
import api from '../../services/api';

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  avatar?: string;
  isManager: boolean;
  joinDate: string;
  performance: number;
}

interface Department {
  _id: string;
  name: string;
  description: string;
  manager: Employee;
  employees: Employee[];
  totalEmployees: number;
  budget: number;
  currentExpense: number;
  performance: number;
  growth: number;
  projects: number;
  avgSalary: number;
  established: string;
  location: string;
  color: string;
}

const EmployeeDepartmentsModern: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#a8edea', '#fed6e3'];

  // Mock data
  const mockDepartments: Department[] = [
    {
      _id: '1',
      name: 'Engineering',
      description: 'Software development and technical innovation',
      manager: {
        _id: 'emp1',
        name: 'John Smith',
        email: 'john.smith@company.com',
        phone: '+1 (555) 123-4567',
        position: 'Engineering Director',
        isManager: true,
        joinDate: '2020-01-15',
        performance: 94,
      },
      employees: [
        {
          _id: 'emp2',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@company.com',
          phone: '+1 (555) 234-5678',
          position: 'Senior Software Engineer',
          isManager: false,
          joinDate: '2022-03-10',
          performance: 92,
        },
        {
          _id: 'emp3',
          name: 'Michael Chen',
          email: 'michael.chen@company.com',
          phone: '+1 (555) 345-6789',
          position: 'Frontend Developer',
          isManager: false,
          joinDate: '2023-01-15',
          performance: 88,
        },
      ],
      totalEmployees: 125,
      budget: 15000000,
      currentExpense: 12500000,
      performance: 91,
      growth: 8.5,
      projects: 23,
      avgSalary: 95000,
      established: '2015',
      location: 'Building A, Floor 3-5',
      color: '#667eea',
    },
    {
      _id: '2',
      name: 'Sales',
      description: 'Revenue generation and client relationships',
      manager: {
        _id: 'emp4',
        name: 'Lisa Wilson',
        email: 'lisa.wilson@company.com',
        phone: '+1 (555) 456-7890',
        position: 'Sales Director',
        isManager: true,
        joinDate: '2019-06-20',
        performance: 96,
      },
      employees: [
        {
          _id: 'emp5',
          name: 'David Brown',
          email: 'david.brown@company.com',
          phone: '+1 (555) 567-8901',
          position: 'Senior Sales Manager',
          isManager: false,
          joinDate: '2021-09-05',
          performance: 94,
        },
      ],
      totalEmployees: 85,
      budget: 8500000,
      currentExpense: 7200000,
      performance: 94,
      growth: 12.3,
      projects: 15,
      avgSalary: 75000,
      established: '2016',
      location: 'Building B, Floor 2',
      color: '#764ba2',
    },
    {
      _id: '3',
      name: 'Marketing',
      description: 'Brand management and digital marketing',
      manager: {
        _id: 'emp6',
        name: 'Emily Davis',
        email: 'emily.davis@company.com',
        phone: '+1 (555) 678-9012',
        position: 'Marketing Director',
        isManager: true,
        joinDate: '2020-11-10',
        performance: 89,
      },
      employees: [],
      totalEmployees: 45,
      budget: 5200000,
      currentExpense: 4800000,
      performance: 87,
      growth: 6.8,
      projects: 12,
      avgSalary: 68000,
      established: '2017',
      location: 'Building A, Floor 2',
      color: '#f093fb',
    },
    {
      _id: '4',
      name: 'Human Resources',
      description: 'People operations and organizational development',
      manager: {
        _id: 'emp7',
        name: 'Jennifer Lee',
        email: 'jennifer.lee@company.com',
        phone: '+1 (555) 789-0123',
        position: 'HR Director',
        isManager: true,
        joinDate: '2018-04-25',
        performance: 93,
      },
      employees: [],
      totalEmployees: 25,
      budget: 3500000,
      currentExpense: 3200000,
      performance: 90,
      growth: 4.2,
      projects: 8,
      avgSalary: 72000,
      established: '2015',
      location: 'Building B, Floor 1',
      color: '#f5576c',
    },
    {
      _id: '5',
      name: 'Finance',
      description: 'Financial planning and analysis',
      manager: {
        _id: 'emp8',
        name: 'Robert Anderson',
        email: 'robert.anderson@company.com',
        phone: '+1 (555) 890-1234',
        position: 'Finance Director',
        isManager: true,
        joinDate: '2019-02-14',
        performance: 95,
      },
      employees: [],
      totalEmployees: 30,
      budget: 4200000,
      currentExpense: 3900000,
      performance: 92,
      growth: 3.7,
      projects: 6,
      avgSalary: 78000,
      established: '2015',
      location: 'Building A, Floor 1',
      color: '#4facfe',
    },
  ];

  const fetchDepartments = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await api.get('/dashboard/analytics');
      const departmentStats = response.data.analytics?.departmentStats || [];
      
      // Transform department stats to department format
      const transformedDepartments = departmentStats.map((dept: any, index: number) => ({
        _id: dept._id || `dept-${index}`,
        name: dept._id,
        description: `${dept._id} department handling organizational operations`,
        manager: {
          name: `${dept._id} Manager`,
          email: `manager.${dept._id.toLowerCase()}@company.com`,
          avatar: `https://i.pravatar.cc/150?img=${index + 1}`
        },
        employees: dept.count,
        avgSalary: dept.avgSalary,
        budget: dept.avgSalary * dept.count * 1.2,
        performance: Math.round(75 + Math.random() * 20),
        growth: Math.round(dept.newHires / dept.count * 100) || 5,
        headcount: dept.count,
        openPositions: dept.newHires || 0,
        color: ['#3f51b5', '#2196f3', '#00bcd4', '#4caf50', '#ff9800', '#f44336'][index % 6]
      }));
      
      setDepartments(transformedDepartments);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching departments:', error);
      setError(error.response?.data?.message || 'Failed to load departments');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.manager.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpanded = (deptId: string) => {
    const newExpanded = new Set(expandedDepts);
    if (newExpanded.has(deptId)) {
      newExpanded.delete(deptId);
    } else {
      newExpanded.add(deptId);
    }
    setExpandedDepts(newExpanded);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, deptId: string) => {
    setMenuAnchor(event.currentTarget);
    setSelectedDeptId(deptId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedDeptId(null);
  };

  const totalEmployees = departments.reduce((sum, dept) => sum + dept.totalEmployees, 0);
  const totalBudget = departments.reduce((sum, dept) => sum + dept.budget, 0);
  const totalExpense = departments.reduce((sum, dept) => sum + dept.currentExpense, 0);
  const avgPerformance = departments.reduce((sum, dept) => sum + dept.performance, 0) / departments.length;

  if (loading) {
    return (
      <Container maxWidth={false} sx={{ py: { xs: 2, sm: 3 } }}>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
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
              Departments
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Organizational structure and team management
            </Typography>
          </Box>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              size={isSmallScreen ? "small" : "medium"}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                }
              }}
            >
              Add Department
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchDepartments}
              size={isSmallScreen ? "small" : "medium"}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>

        {/* Overview Cards */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          <Grid item xs={6} sm={3}>
            <Card 
              elevation={0}
              sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
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
                    bgcolor: theme.palette.primary.main,
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 }
                  }}>
                    <BusinessIcon />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant={isSmallScreen ? "h5" : "h4"}
                      fontWeight={700}
                      color="primary"
                    >
                      {departments.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      Departments
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
                    <PeopleIcon />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant={isSmallScreen ? "h5" : "h4"}
                      fontWeight={700}
                      color="success.main"
                    >
                      {totalEmployees}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      Total Employees
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
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant={isSmallScreen ? "h5" : "h4"}
                      fontWeight={700}
                      color="warning.main"
                    >
                      ${(totalBudget / 1000000).toFixed(1)}M
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      Total Budget
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
                    <AnalyticsIcon />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant={isSmallScreen ? "h5" : "h4"}
                      fontWeight={700}
                      color="info.main"
                    >
                      {avgPerformance.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      Avg Performance
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filters */}
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
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Search departments, managers, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                sx: {
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.background.default, 0.7),
                }
              }}
              variant="outlined"
              size="small"
            />
            
            {searchTerm && (
              <Button
                size="small"
                onClick={() => setSearchTerm('')}
                startIcon={<CloseIcon />}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Clear
              </Button>
            )}
          </Stack>
        </Paper>

        {/* Department Overview Chart */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          <Grid item xs={12} lg={8}>
            <Card 
              elevation={0}
              sx={{ 
                height: { xs: 350, sm: 400 },
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
                <Typography variant={isSmallScreen ? "h6" : "h5"} fontWeight={600} sx={{ mb: 2 }}>
                  Department Performance
                </Typography>
                
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={departments}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: 8,
                        boxShadow: theme.shadows[8]
                      }}
                    />
                    <Bar dataKey="performance" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card 
              elevation={0}
              sx={{ 
                height: { xs: 350, sm: 400 },
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
                <Typography variant={isSmallScreen ? "h6" : "h5"} fontWeight={600} sx={{ mb: 2 }}>
                  Employee Distribution
                </Typography>
                
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={departments.map((dept, index) => ({
                        name: dept.name,
                        value: dept.totalEmployees,
                        color: COLORS[index % COLORS.length]
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={isSmallScreen ? 70 : 90}
                      dataKey="value"
                    >
                      {departments.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: 8,
                        boxShadow: theme.shadows[8]
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Department Cards */}
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {filteredDepartments.map((department) => (
            <Grid item xs={12} md={6} lg={4} key={department._id}>
              <Fade in timeout={300}>
                <Card 
                  elevation={0}
                  sx={{ 
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: theme.shadows[12],
                      borderColor: alpha(department.color, 0.5),
                    }
                  }}
                >
                  <CardHeader
                    avatar={
                      <Avatar 
                        sx={{ 
                          bgcolor: department.color,
                          width: { xs: 50, sm: 60 },
                          height: { xs: 50, sm: 60 }
                        }}
                      >
                        <BusinessIcon />
                      </Avatar>
                    }
                    action={
                      <IconButton 
                        onClick={(e) => handleMenuOpen(e, department._id)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    }
                    title={
                      <Typography variant="h6" fontWeight={600}>
                        {department.name}
                      </Typography>
                    }
                    subheader={
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {department.description}
                      </Typography>
                    }
                    sx={{ pb: 1 }}
                  />

                  <CardContent sx={{ pt: 0 }}>
                    <Stack spacing={2}>
                      {/* Manager Info */}
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {department.manager.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {department.manager.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {department.manager.position}
                          </Typography>
                        </Box>
                        <Chip 
                          label="Manager" 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      </Stack>

                      {/* Key Metrics */}
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box textAlign="center">
                            <Typography variant="h5" fontWeight={700} color="primary">
                              {department.totalEmployees}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Employees
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center">
                            <Typography variant="h5" fontWeight={700} color="success.main">
                              {department.performance}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Performance
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {/* Budget Progress */}
                      <Box>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography variant="body2">Budget Utilization</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {((department.currentExpense / department.budget) * 100).toFixed(1)}%
                          </Typography>
                        </Stack>
                        <LinearProgress 
                          variant="determinate" 
                          value={(department.currentExpense / department.budget) * 100}
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: alpha(department.color, 0.2),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              bgcolor: department.color
                            }
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          ${(department.currentExpense / 1000000).toFixed(1)}M of ${(department.budget / 1000000).toFixed(1)}M
                        </Typography>
                      </Box>

                      {/* Additional Info */}
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">Projects</Typography>
                          <Typography variant="caption" fontWeight={600}>{department.projects}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">Avg Salary</Typography>
                          <Typography variant="caption" fontWeight={600}>
                            ${department.avgSalary.toLocaleString()}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">Growth</Typography>
                          <Typography 
                            variant="caption" 
                            fontWeight={600}
                            color={department.growth > 0 ? 'success.main' : 'error.main'}
                          >
                            {department.growth > 0 ? '+' : ''}{department.growth}%
                          </Typography>
                        </Stack>
                      </Stack>

                      {/* Employee List Toggle */}
                      {department.employees.length > 0 && (
                        <Button
                          onClick={() => toggleExpanded(department._id)}
                          endIcon={expandedDepts.has(department._id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          size="small"
                          variant="outlined"
                          fullWidth
                        >
                          {expandedDepts.has(department._id) ? 'Hide' : 'Show'} Team Members ({department.employees.length})
                        </Button>
                      )}

                      {/* Employee List */}
                      <Collapse in={expandedDepts.has(department._id)} timeout="auto" unmountOnExit>
                        <List dense>
                          {department.employees.map((employee) => (
                            <ListItem key={employee._id} divider>
                              <ListItemAvatar>
                                <Avatar sx={{ width: 32, height: 32 }}>
                                  {employee.name.split(' ').map(n => n[0]).join('')}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography variant="body2" fontWeight={600}>
                                    {employee.name}
                                  </Typography>
                                }
                                secondary={
                                  <Typography variant="caption" color="text.secondary">
                                    {employee.position}
                                  </Typography>
                                }
                              />
                              <ListItemSecondaryAction>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <StarIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                                  <Typography variant="caption" fontWeight={600}>
                                    {employee.performance}
                                  </Typography>
                                </Stack>
                              </ListItemSecondaryAction>
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                    </Stack>
                  </CardContent>

                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => {
                        setSelectedDepartment(department);
                        setDialogOpen(true);
                      }}
                      sx={{ flex: 1 }}
                    >
                      View Details
                    </Button>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      variant="outlined"
                      sx={{ flex: 1 }}
                    >
                      Edit
                    </Button>
                  </CardActions>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Empty State */}
        {filteredDepartments.length === 0 && !loading && (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 8,
              borderRadius: 2,
              background: alpha(theme.palette.background.paper, 0.7),
            }}
          >
            <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No departments found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search criteria
            </Typography>
            <Button
              variant="contained"
              onClick={() => setSearchTerm('')}
            >
              Clear Search
            </Button>
          </Box>
        )}

        {/* Floating Action Button for Mobile */}
        {isMobile && (
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            <AddIcon />
          </Fab>
        )}

        {/* Department Details Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
          fullScreen={isSmallScreen}
        >
          {selectedDepartment && (
            <>
              <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: selectedDepartment.color }}>
                    <BusinessIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {selectedDepartment.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedDepartment.description}
                    </Typography>
                  </Box>
                </Stack>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom>Manager</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar>
                        {selectedDepartment.manager.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {selectedDepartment.manager.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedDepartment.manager.position}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedDepartment.manager.email}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom>Key Metrics</Typography>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Total Employees</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedDepartment.totalEmployees}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Performance</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedDepartment.performance}%
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Projects</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedDepartment.projects}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Growth Rate</Typography>
                        <Typography 
                          variant="body2" 
                          fontWeight={600}
                          color={selectedDepartment.growth > 0 ? 'success.main' : 'error.main'}
                        >
                          {selectedDepartment.growth > 0 ? '+' : ''}{selectedDepartment.growth}%
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDialogOpen(false)}>Close</Button>
                <Button variant="contained" startIcon={<EditIcon />}>
                  Edit Department
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Action Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <VisibilityIcon />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <EditIcon />
            </ListItemIcon>
            <ListItemText>Edit Department</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <AnalyticsIcon />
            </ListItemIcon>
            <ListItemText>View Analytics</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText>Delete Department</ListItemText>
          </MenuItem>
        </Menu>
      </Container>
    </Box>
  );
};

export default EmployeeDepartmentsModern;
