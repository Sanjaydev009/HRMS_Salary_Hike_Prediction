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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  Skeleton,
  Alert,
  Fade,
  useTheme,
  alpha,
  Container,
  InputAdornment,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  FormControlLabel,
  ButtonGroup,
  Badge,
  Fab,
  useMediaQuery,
  Slide,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  AccountCircle as AccountCircleIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import api from '../../services/api';

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  salary: number;
  joinDate: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  avatar?: string;
  skills?: string[];
  location?: string;
  manager?: string;
  experience?: number;
  rating?: number;
}

const EmployeeDirectoryModern: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // Menu states
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Mock data
  const mockEmployees: Employee[] = [
    {
      _id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      phone: '+1 (555) 123-4567',
      department: 'Engineering',
      position: 'Senior Software Engineer',
      salary: 95000,
      joinDate: '2022-03-15',
      status: 'Active',
      skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
      location: 'New York, NY',
      manager: 'John Smith',
      experience: 5,
      rating: 4.8,
    },
    {
      _id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      phone: '+1 (555) 234-5678',
      department: 'Sales',
      position: 'Sales Manager',
      salary: 75000,
      joinDate: '2021-08-20',
      status: 'Active',
      skills: ['Sales', 'CRM', 'Team Leadership'],
      location: 'San Francisco, CA',
      manager: 'Lisa Wilson',
      experience: 7,
      rating: 4.6,
    },
    {
      _id: '3',
      name: 'Emily Davis',
      email: 'emily.davis@company.com',
      phone: '+1 (555) 345-6789',
      department: 'Marketing',
      position: 'Marketing Specialist',
      salary: 68000,
      joinDate: '2023-01-10',
      status: 'Active',
      skills: ['Digital Marketing', 'SEO', 'Content Strategy'],
      location: 'Austin, TX',
      manager: 'Robert Brown',
      experience: 3,
      rating: 4.4,
    },
    {
      _id: '4',
      name: 'David Wilson',
      email: 'david.wilson@company.com',
      phone: '+1 (555) 456-7890',
      department: 'HR',
      position: 'HR Coordinator',
      salary: 72000,
      joinDate: '2022-11-05',
      status: 'On Leave',
      skills: ['Recruitment', 'Employee Relations', 'HRIS'],
      location: 'Chicago, IL',
      manager: 'Jennifer Lee',
      experience: 4,
      rating: 4.2,
    },
    {
      _id: '5',
      name: 'Anna Rodriguez',
      email: 'anna.rodriguez@company.com',
      phone: '+1 (555) 567-8901',
      department: 'Finance',
      position: 'Financial Analyst',
      salary: 78000,
      joinDate: '2021-06-12',
      status: 'Active',
      skills: ['Financial Analysis', 'Excel', 'SQL', 'PowerBI'],
      location: 'Miami, FL',
      manager: 'Thomas Anderson',
      experience: 6,
      rating: 4.7,
    },
  ];

  // Fetch employees data
  const fetchEmployees = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await api.get('/employees');
      const employeesData = response.data.employees || response.data;
      setEmployees(employeesData);
      setFilteredEmployees(employeesData);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      setError(error.response?.data?.message || 'Failed to load employees');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Filter and search logic
  useEffect(() => {
    let filtered = employees.filter(employee => {
      const matchesSearch = 
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = !departmentFilter || employee.department === departmentFilter;
      const matchesStatus = !statusFilter || employee.status === statusFilter;
      const matchesFavorites = !showOnlyFavorites || favorites.has(employee._id);
      
      return matchesSearch && matchesDepartment && matchesStatus && matchesFavorites;
    });

    // Sort logic
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof Employee];
      let bValue = b[sortBy as keyof Employee];
      
      // Handle undefined values
      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredEmployees(filtered);
  }, [employees, searchTerm, departmentFilter, statusFilter, sortBy, sortOrder, showOnlyFavorites, favorites]);

  const toggleFavorite = (employeeId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(employeeId)) {
      newFavorites.delete(employeeId);
    } else {
      newFavorites.add(employeeId);
    }
    setFavorites(newFavorites);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'error';
      case 'On Leave': return 'warning';
      default: return 'default';
    }
  };

  const departments = [...new Set(employees.map(emp => emp.department))];

  if (loading) {
    return (
      <Container maxWidth={false} sx={{ py: { xs: 2, sm: 3 } }}>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={viewMode === 'grid' ? 4 : 12} key={index}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Skeleton variant="circular" width={60} height={60} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Skeleton variant="text" width="70%" height={24} />
                      <Skeleton variant="text" width="50%" height={20} />
                      <Skeleton variant="text" width="60%" height={20} />
                    </Box>
                  </Stack>
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
              Employee Directory
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {filteredEmployees.length} of {employees.length} employees
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
              Add Employee
            </Button>
            
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                size={isSmallScreen ? "small" : "medium"}
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              >
                Export
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                size={isSmallScreen ? "small" : "medium"}
                onClick={fetchEmployees}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>
        </Stack>

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
          <Stack spacing={{ xs: 2, sm: 3 }}>
            {/* Search Bar */}
            <TextField
              fullWidth
              placeholder="Search employees by name, email, department, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.background.default, 0.7),
                }
              }}
              variant="outlined"
            />

            {/* Filters Row */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 2, sm: 3 }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              {/* Department Filter */}
              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                <InputLabel>Department</InputLabel>
                <Select
                  value={departmentFilter}
                  label="Department"
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Status Filter */}
              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="On Leave">On Leave</MenuItem>
                </Select>
              </FormControl>

              {/* Sort By */}
              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="department">Department</MenuItem>
                  <MenuItem value="joinDate">Join Date</MenuItem>
                  <MenuItem value="salary">Salary</MenuItem>
                </Select>
              </FormControl>

              {/* View Controls */}
              <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 'auto' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showOnlyFavorites}
                      onChange={(e) => setShowOnlyFavorites(e.target.checked)}
                      size="small"
                    />
                  }
                  label={<Typography variant="caption">Favorites</Typography>}
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                />

                <ButtonGroup size="small" variant="outlined">
                  <Button
                    onClick={() => setViewMode('grid')}
                    variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                  >
                    <GridViewIcon />
                  </Button>
                  <Button
                    onClick={() => setViewMode('list')}
                    variant={viewMode === 'list' ? 'contained' : 'outlined'}
                  >
                    <ListViewIcon />
                  </Button>
                </ButtonGroup>

                <IconButton
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  color="primary"
                >
                  <SortIcon sx={{ 
                    transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.3s ease'
                  }} />
                </IconButton>
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        {/* Results Summary */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Showing {filteredEmployees.length} result{filteredEmployees.length !== 1 ? 's' : ''}
            </Typography>
            {(searchTerm || departmentFilter || statusFilter || showOnlyFavorites) && (
              <Button
                size="small"
                onClick={() => {
                  setSearchTerm('');
                  setDepartmentFilter('');
                  setStatusFilter('');
                  setShowOnlyFavorites(false);
                }}
                startIcon={<CloseIcon />}
              >
                Clear Filters
              </Button>
            )}
          </Stack>
        </Box>

        {/* Employee Grid/List */}
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {filteredEmployees.map((employee) => (
            <Fade key={employee._id} in timeout={300}>
              <Grid item xs={12} sm={viewMode === 'list' ? 12 : 6} md={viewMode === 'list' ? 12 : 4} lg={viewMode === 'list' ? 12 : 3}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Stack spacing={2}>
                      {/* Header */}
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
                          <Avatar 
                            sx={{ 
                              width: { xs: 50, sm: 60 }, 
                              height: { xs: 50, sm: 60 },
                              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                            }}
                          >
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography 
                              variant={isSmallScreen ? "subtitle1" : "h6"} 
                              fontWeight={600}
                              noWrap
                            >
                              {employee.name}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              noWrap
                            >
                              {employee.position}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              noWrap
                            >
                              {employee.department}
                            </Typography>
                          </Box>
                        </Stack>
                        
                        <Stack direction="row" spacing={1} alignItems="center">
                          <IconButton
                            size="small"
                            onClick={() => toggleFavorite(employee._id)}
                            color={favorites.has(employee._id) ? 'warning' : 'default'}
                          >
                            {favorites.has(employee._id) ? <StarIcon /> : <StarBorderIcon />}
                          </IconButton>
                          <IconButton size="small">
                            <MoreVertIcon />
                          </IconButton>
                        </Stack>
                      </Stack>

                      {/* Status and Rating */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Chip 
                          label={employee.status}
                          color={getStatusColor(employee.status) as any}
                          size="small"
                          variant="filled"
                        />
                        {employee.rating && (
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <StarIcon sx={{ fontSize: 16, color: theme.palette.warning.main }} />
                            <Typography variant="caption" fontWeight={600}>
                              {employee.rating}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>

                      {/* Contact Info */}
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {employee.email}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {employee.phone}
                          </Typography>
                        </Stack>
                        {employee.location && (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {employee.location}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>

                      {/* Skills */}
                      {employee.skills && employee.skills.length > 0 && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                            Skills:
                          </Typography>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                            {employee.skills.slice(0, 3).map(skill => (
                              <Chip
                                key={skill}
                                label={skill}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                            ))}
                            {employee.skills.length > 3 && (
                              <Chip
                                label={`+${employee.skills.length - 3}`}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                            )}
                          </Stack>
                        </Box>
                      )}

                      {/* Actions */}
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PersonIcon />}
                          sx={{ flex: 1 }}
                        >
                          View Profile
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<EmailIcon />}
                          sx={{ 
                            flex: 1,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.secondary.main, 0.8)})`,
                          }}
                        >
                          Contact
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Fade>
          ))}
        </Grid>

        {/* Empty State */}
        {filteredEmployees.length === 0 && !loading && (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 8,
              borderRadius: 2,
              background: alpha(theme.palette.background.paper, 0.7),
            }}
          >
            <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No employees found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search criteria or filters
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setSearchTerm('');
                setDepartmentFilter('');
                setStatusFilter('');
                setShowOnlyFavorites(false);
              }}
            >
              Clear All Filters
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
      </Container>
    </Box>
  );
};

export default EmployeeDirectoryModern;
