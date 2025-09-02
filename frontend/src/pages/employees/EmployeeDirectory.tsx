import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Skeleton,
  Alert,
  Stack,
  Button,
  Tooltip,
  Badge,
  Zoom,
  Fade,
  useTheme,
  alpha,
  ButtonGroup,
  useMediaQuery,
  Container,
} from '@mui/material';
import {
  Search as SearchIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  PersonAdd as PersonAddIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import api from '../../services/api';

interface Employee {
  _id: string;
  employeeId: string;
  profile: {
    firstName: string;
    lastName: string;
    profilePicture?: string;
    phone?: string;
  };
  email: string;
  jobDetails: {
    designation: string;
    department: string;
    joiningDate: string;
    workLocation?: string;
  };
  status: string;
}

const EmployeeDirectory: React.FC = () => {
  const theme = useTheme();
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State management
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(isMobile ? 'list' : 'grid');
  const [departments, setDepartments] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch employees data
  const fetchEmployees = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (departmentFilter) params.append('department', departmentFilter);
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await api.get(`/employees?${params.toString()}`);
      
      if (response.data.success) {
        setEmployees(response.data.data.employees);
        
        // Extract unique departments
        const uniqueDepartments = [...new Set(
          response.data.data.employees.map((emp: Employee) => emp.jobDetails.department)
        )].filter(Boolean) as string[];
        setDepartments(uniqueDepartments);
        
        console.log('Employee directory loaded:', {
          total: response.data.data.employees.length,
          departments: uniqueDepartments.length
        });
      } else {
        setError('Failed to load employee directory');
      }
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      setError(error.response?.data?.message || 'Failed to load employee directory');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchTerm, departmentFilter, statusFilter]);

  // Initial load
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Manual refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchEmployees();
  };

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = !searchTerm || 
      employee.profile.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.profile.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.jobDetails.designation.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Generate employee avatar
  const getEmployeeAvatar = (employee: Employee) => {
    if (employee.profile.profilePicture) {
      return employee.profile.profilePicture;
    }
    return `${employee.profile.firstName.charAt(0)}${employee.profile.lastName.charAt(0)}`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'onLeave': return 'warning';
      default: return 'default';
    }
  };

  // Employee Card Component
  const EmployeeCard: React.FC<{ employee: Employee; index: number }> = ({ employee, index }) => (
    <Zoom in timeout={300 + index * 100}>
      <Card 
        sx={{ 
          height: '100%',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
          },
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            {/* Header with Avatar and Status */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: employee.status === 'active' ? 'success.main' : 'error.main',
                      border: '2px solid white',
                    }}
                  />
                }
              >
                <Avatar
                  sx={{ 
                    width: 56, 
                    height: 56,
                    bgcolor: 'primary.main',
                    fontSize: '1.2rem',
                    fontWeight: 600
                  }}
                  src={employee.profile.profilePicture}
                >
                  {getEmployeeAvatar(employee)}
                </Avatar>
              </Badge>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {employee.profile.firstName} {employee.profile.lastName}
                </Typography>
                <Chip 
                  label={employee.status}
                  color={getStatusColor(employee.status) as any}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Stack>

            {/* Employee Details */}
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {employee.jobDetails.designation}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {employee.jobDetails.department}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Joined {new Date(employee.jobDetails.joiningDate).toLocaleDateString()}
                </Typography>
              </Box>
            </Stack>

            {/* Contact Actions */}
            <Stack direction="row" spacing={1} justifyContent="center">
              <Tooltip title="Send Email">
                <IconButton 
                  size="small" 
                  color="primary"
                  onClick={() => window.open(`mailto:${employee.email}`)}
                >
                  <EmailIcon />
                </IconButton>
              </Tooltip>
              
              {employee.profile.phone && (
                <Tooltip title="Call">
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => window.open(`tel:${employee.profile.phone}`)}
                  >
                    <PhoneIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>

            {/* Employee ID */}
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ textAlign: 'center', fontFamily: 'monospace' }}
            >
              ID: {employee.employeeId}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Zoom>
  );

  // Employee List Item Component
  const EmployeeListItem: React.FC<{ employee: Employee }> = ({ employee }) => (
    <Fade in>
      <Paper sx={{ mb: 1 }}>
        <ListItem>
          <ListItemAvatar>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: employee.status === 'active' ? 'success.main' : 'error.main',
                    border: '2px solid white',
                  }}
                />
              }
            >
              <Avatar src={employee.profile.profilePicture}>
                {getEmployeeAvatar(employee)}
              </Avatar>
            </Badge>
          </ListItemAvatar>
          
          <ListItemText
            primary={
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {employee.profile.firstName} {employee.profile.lastName}
                </Typography>
                <Chip 
                  label={employee.status}
                  color={getStatusColor(employee.status) as any}
                  size="small"
                  variant="outlined"
                />
              </Stack>
            }
            secondary={
              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                  {employee.jobDetails.designation} • {employee.jobDetails.department}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {employee.email} • ID: {employee.employeeId}
                </Typography>
              </Stack>
            }
          />
          
          <ListItemSecondaryAction>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Send Email">
                <IconButton 
                  size="small" 
                  onClick={() => window.open(`mailto:${employee.email}`)}
                >
                  <EmailIcon />
                </IconButton>
              </Tooltip>
              
              {employee.profile.phone && (
                <Tooltip title="Call">
                  <IconButton 
                    size="small"
                    onClick={() => window.open(`tel:${employee.profile.phone}`)}
                  >
                    <PhoneIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </ListItemSecondaryAction>
        </ListItem>
      </Paper>
    </Fade>
  );

  if (loading && !refreshing) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>Employee Directory</Typography>
        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Skeleton variant="circular" width={56} height={56} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Skeleton variant="text" width="60%" height={28} />
                        <Skeleton variant="text" width="40%" height={20} />
                      </Box>
                    </Stack>
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="70%" />
                    <Skeleton variant="text" width="60%" />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Stack 
        direction={isSmallScreen ? "column" : "row"} 
        justifyContent="space-between" 
        alignItems={isSmallScreen ? "stretch" : "center"} 
        spacing={isSmallScreen ? 2 : 0}
        sx={{ mb: { xs: 3, sm: 4 } }}
      >
        <Box>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            fontWeight={700} 
            gutterBottom
            sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
          >
            Employee Directory
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.875rem', sm: '1rem' },
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Browse and search through all employees in the organization
          </Typography>
        </Box>
        
        <Stack 
          direction={isSmallScreen ? "column" : "row"} 
          spacing={isSmallScreen ? 1 : 2}
          sx={{ width: isSmallScreen ? '100%' : 'auto' }}
        >
          <Button
            variant="outlined"
            size={isSmallScreen ? "small" : "medium"}
            startIcon={refreshing ? null : <RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
            fullWidth={isSmallScreen}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          
          <Button
            variant="outlined"
            size={isSmallScreen ? "small" : "medium"}
            startIcon={<DownloadIcon />}
            fullWidth={isSmallScreen}
            onClick={() => {
              // Export employee list
              const csvContent = employees.map(emp => 
                `${emp.profile.firstName} ${emp.profile.lastName},${emp.email},${emp.jobDetails.designation},${emp.jobDetails.department}`
              ).join('\n');
              const blob = new Blob([`Name,Email,Designation,Department\n${csvContent}`], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'employee-directory.csv';
              a.click();
            }}
          >
            Export
          </Button>
        </Stack>
      </Stack>

      {/* Stats */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        <Grid item xs={6} sm={6} md={3}>
          <Card elevation={1}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography 
                variant={isSmallScreen ? "h4" : "h3"} 
                color="primary" 
                fontWeight={700}
                sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
              >
                {filteredEmployees.length}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Total Employees
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={6} md={3}>
          <Card elevation={1}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography 
                variant={isSmallScreen ? "h4" : "h3"} 
                color="success.main" 
                fontWeight={700}
                sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
              >
                {filteredEmployees.filter(emp => emp.status === 'active').length}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Active Employees
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h3" color="info.main" fontWeight={700}>
                {departments.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Departments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h3" color="warning.main" fontWeight={700}>
                {filteredEmployees.filter(emp => {
                  const joinDate = new Date(emp.jobDetails.joiningDate);
                  const currentDate = new Date();
                  const diffTime = Math.abs(currentDate.getTime() - joinDate.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays <= 90;
                }).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                New Hires (90 days)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search employees"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="Name, email, ID, or designation..."
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={departmentFilter}
                label="Department"
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <MenuItem value="">All Departments</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="onLeave">On Leave</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <ButtonGroup variant="outlined" fullWidth>
              <Button
                onClick={() => setViewMode('grid')}
                variant={viewMode === 'grid' ? 'contained' : 'outlined'}
              >
                <ViewModuleIcon />
              </Button>
              <Button
                onClick={() => setViewMode('list')}
                variant={viewMode === 'list' ? 'contained' : 'outlined'}
              >
                <ViewListIcon />
              </Button>
            </ButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Employee List */}
      {viewMode === 'grid' ? (
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {filteredEmployees.map((employee, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={isTablet ? 6 : 4} 
              lg={3} 
              xl={2.4}
              key={employee._id}
            >
              <EmployeeCard employee={employee} index={index} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <List sx={{ 
          '& .MuiListItem-root': {
            borderRadius: 1,
            mb: 1,
            border: `1px solid ${theme.palette.divider}`,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.02)
            }
          }
        }}>
          {filteredEmployees.map((employee) => (
            <EmployeeListItem key={employee._id} employee={employee} />
          ))}
        </List>
      )}

      {/* No Results */}
      {filteredEmployees.length === 0 && !loading && (
        <Paper sx={{ 
          p: { xs: 4, sm: 6 }, 
          textAlign: 'center',
          mt: 2
        }}>
          <PersonAddIcon sx={{ 
            fontSize: { xs: 48, sm: 64 }, 
            color: 'text.secondary', 
            mb: 2 
          }} />
          <Typography 
            variant={isSmallScreen ? "subtitle1" : "h6"} 
            gutterBottom
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
          >
            No employees found
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '0.875rem' } }}
          >
            Try adjusting your search criteria or filters
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default EmployeeDirectory;
