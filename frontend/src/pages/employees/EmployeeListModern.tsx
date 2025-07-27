import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Tooltip,
  TextField,
  InputAdornment,
  Grid,
  TablePagination,
  useTheme,
  useMediaQuery,
  Stack,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  Skeleton,
  Alert,
  Fade,
  Zoom,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';

// Employee interface definition
interface Employee {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: dayjs.Dayjs | null;
    address: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  jobDetails: {
    employeeId: string;
    department: string;
    position: string;
    jobTitle: string;
    workLocation: string;
    employmentType: string;
    startDate: dayjs.Dayjs | null;
    reportingManager: string;
    workSchedule: string;
  };
  compensation: {
    baseSalary: number;
    currency: string;
    payFrequency: string;
    benefits: string[];
  };
  role: string;
  status: string;
}

const EmployeeList: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [employeeFormOpen, setEmployeeFormOpen] = useState(false);
  const [editEmployeeFormOpen, setEditEmployeeFormOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedEmployeeForMenu, setSelectedEmployeeForMenu] = useState<Employee | null>(null);
  
  // Filter states
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('');

  // Fetch employees data from API
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        
        // Replace with actual API endpoint
        const response = await fetch('/api/employees', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch employees: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Transform API data to match our interface - backend returns data.employees
        const backendEmployees = data.data?.employees || data.employees || [];
        const transformedEmployees = backendEmployees.map((emp: any) => ({
          id: emp._id || emp.id,
          personalInfo: {
            firstName: emp.profile?.firstName || emp.personalInfo?.firstName || '',
            lastName: emp.profile?.lastName || emp.personalInfo?.lastName || '',
            email: emp.email || emp.personalInfo?.email || '',
            phone: emp.profile?.phone || emp.personalInfo?.phone || '',
            dateOfBirth: emp.profile?.dateOfBirth ? dayjs(emp.profile.dateOfBirth) : (emp.personalInfo?.dateOfBirth ? dayjs(emp.personalInfo.dateOfBirth) : null),
            address: emp.profile?.address?.street || emp.personalInfo?.address || '',
            emergencyContact: {
              name: emp.emergencyContact?.name || emp.personalInfo?.emergencyContact?.name || '',
              phone: emp.emergencyContact?.phone || emp.personalInfo?.emergencyContact?.phone || '',
              relationship: emp.emergencyContact?.relationship || emp.personalInfo?.emergencyContact?.relationship || '',
            },
          },
          jobDetails: {
            employeeId: emp.employeeId || emp.jobDetails?.employeeId || '',
            department: emp.jobDetails?.department || '',
            position: emp.jobDetails?.designation || emp.jobDetails?.position || '',
            jobTitle: emp.jobDetails?.designation || emp.jobDetails?.jobTitle || '',
            workLocation: emp.jobDetails?.workLocation || 'Office',
            employmentType: emp.jobDetails?.employmentType || 'full-time',
            startDate: emp.jobDetails?.joiningDate ? dayjs(emp.jobDetails.joiningDate) : (emp.jobDetails?.startDate ? dayjs(emp.jobDetails.startDate) : null),
            reportingManager: emp.jobDetails?.reportingManager || '',
            workSchedule: emp.jobDetails?.workSchedule || 'Mon-Fri 9AM-5PM',
          },
          compensation: {
            baseSalary: emp.jobDetails?.salary?.basic || 0,
            currency: emp.jobDetails?.salary?.currency || 'USD',
            payFrequency: 'Monthly',
            benefits: [],
          },
          role: emp.role || 'employee',
          status: emp.status || 'Active',
        }));

        setEmployees(transformedEmployees);
        setFilteredEmployees(transformedEmployees);
        
      } catch (err) {
        console.error('Error fetching employees:', err);
        
        // Fallback: Show empty state instead of hardcoded data
        setEmployees([]);
        setFilteredEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  // Filter employees based on search term and filters
  useEffect(() => {
    let filtered = employees.filter((employee) => {
      const matchesSearch = Object.values(employee.personalInfo).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      ) || Object.values(employee.jobDetails).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesDepartment = !departmentFilter || employee.jobDetails.department === departmentFilter;
      const matchesStatus = !statusFilter || employee.status === statusFilter;
      const matchesEmploymentType = !employmentTypeFilter || employee.jobDetails.employmentType === employmentTypeFilter;

      return matchesSearch && matchesDepartment && matchesStatus && matchesEmploymentType;
    });
    
    setFilteredEmployees(filtered);
    setPage(0);
  }, [searchTerm, employees, departmentFilter, statusFilter, employmentTypeFilter]);

  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, employee: Employee) => {
    event.stopPropagation();
    setActionMenuAnchor(event.currentTarget);
    setSelectedEmployeeForMenu(employee);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedEmployeeForMenu(null);
  };

  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteDialogOpen(true);
    handleActionMenuClose();
  };

  const confirmDelete = async () => {
    if (!selectedEmployee) return;
    
    try {
      const response = await fetch(`/api/employees/${selectedEmployee.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete employee');
      }

      // Refresh the employee list
      const loadEmployees = async () => {
        try {
          const response = await fetch('/api/employees');
          if (response.ok) {
            const data = await response.json();
            const backendEmployees = data.data?.employees || data.employees || [];
            const transformedEmployees = backendEmployees.map((emp: any) => ({
              id: emp._id || emp.id,
              personalInfo: {
                firstName: emp.profile?.firstName || emp.personalInfo?.firstName || '',
                lastName: emp.profile?.lastName || emp.personalInfo?.lastName || '',
                email: emp.email || emp.personalInfo?.email || '',
                phone: emp.profile?.phone || emp.personalInfo?.phone || '',
                dateOfBirth: emp.profile?.dateOfBirth ? dayjs(emp.profile.dateOfBirth) : (emp.personalInfo?.dateOfBirth ? dayjs(emp.personalInfo.dateOfBirth) : null),
                address: emp.profile?.address?.street || emp.personalInfo?.address || '',
                emergencyContact: {
                  name: emp.emergencyContact?.name || emp.personalInfo?.emergencyContact?.name || '',
                  phone: emp.emergencyContact?.phone || emp.personalInfo?.emergencyContact?.phone || '',
                  relationship: emp.emergencyContact?.relationship || emp.personalInfo?.emergencyContact?.relationship || '',
                },
              },
              jobDetails: {
                employeeId: emp.employeeId || emp.jobDetails?.employeeId || '',
                department: emp.jobDetails?.department || '',
                position: emp.jobDetails?.designation || emp.jobDetails?.position || '',
                jobTitle: emp.jobDetails?.designation || emp.jobDetails?.jobTitle || '',
                workLocation: emp.jobDetails?.workLocation || 'Office',
                employmentType: emp.jobDetails?.employmentType || 'full-time',
                startDate: emp.jobDetails?.joiningDate ? dayjs(emp.jobDetails.joiningDate) : (emp.jobDetails?.startDate ? dayjs(emp.jobDetails.startDate) : null),
                reportingManager: emp.jobDetails?.reportingManager || '',
                workSchedule: emp.jobDetails?.workSchedule || 'Mon-Fri 9AM-5PM',
              },
              compensation: {
                baseSalary: emp.jobDetails?.salary?.basic || 0,
                currency: emp.jobDetails?.salary?.currency || 'USD',
                payFrequency: 'Monthly',
                benefits: [],
              },
              role: emp.role || 'employee',
              status: emp.status || 'Active',
            }));
            setEmployees(transformedEmployees);
            setFilteredEmployees(transformedEmployees);
          }
        } catch (error) {
          console.error('Error loading employees:', error);
        }
      };
      await loadEmployees();

      setDeleteDialogOpen(false);
      setSelectedEmployee(null);
      alert('Employee deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      alert(`Failed to delete employee: ${error.message || 'Please try again.'}`);
    }
  };

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setViewDialogOpen(true);
    handleActionMenuClose();
  };

  const handleEdit = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      setEmployeeToEdit(employee);
      setEditEmployeeFormOpen(true);
    }
    handleActionMenuClose();
  };

  const handleSaveEmployee = async (employeeData: any) => {
    try {
      // Transform frontend Employee format to backend User format
      const backendData = {
        employeeId: employeeData.jobDetails.employeeId,
        email: employeeData.personalInfo.email,
        password: 'defaultPassword123', // Default password - should be changed on first login
        role: employeeData.role || 'employee',
        profile: {
          firstName: employeeData.personalInfo.firstName,
          lastName: employeeData.personalInfo.lastName,
          phone: employeeData.personalInfo.phone,
          dateOfBirth: employeeData.personalInfo.dateOfBirth,
          address: {
            street: employeeData.personalInfo.address || '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          }
        },
        jobDetails: {
          department: employeeData.jobDetails.department,
          designation: employeeData.jobDetails.position || employeeData.jobDetails.jobTitle,
          joiningDate: employeeData.jobDetails.startDate || new Date(),
          employmentType: employeeData.jobDetails.employmentType?.toLowerCase() || 'full-time',
          salary: {
            basic: employeeData.compensation?.baseSalary || 50000,
            allowances: 0,
            currency: employeeData.compensation?.currency || 'USD'
          },
          workLocation: employeeData.jobDetails.workLocation || 'Office'
        },
        emergencyContact: {
          name: employeeData.personalInfo.emergencyContact?.name || '',
          relationship: employeeData.personalInfo.emergencyContact?.relationship || '',
          phone: employeeData.personalInfo.emergencyContact?.phone || '',
          email: ''
        }
      };

      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create employee');
      }

      const newEmployee = await response.json();
      
      // Refresh the employee list by calling the loadEmployees function from useEffect
      const loadEmployees = async () => {
        try {
          const response = await fetch('/api/employees');
          if (response.ok) {
            const data = await response.json();
            const backendEmployees = data.data?.employees || data.employees || [];
            const transformedEmployees = backendEmployees.map((emp: any) => ({
              id: emp._id || emp.id,
              personalInfo: {
                firstName: emp.profile?.firstName || emp.personalInfo?.firstName || '',
                lastName: emp.profile?.lastName || emp.personalInfo?.lastName || '',
                email: emp.email || emp.personalInfo?.email || '',
                phone: emp.profile?.phone || emp.personalInfo?.phone || '',
                dateOfBirth: emp.profile?.dateOfBirth ? dayjs(emp.profile.dateOfBirth) : (emp.personalInfo?.dateOfBirth ? dayjs(emp.personalInfo.dateOfBirth) : null),
                address: emp.profile?.address?.street || emp.personalInfo?.address || '',
                emergencyContact: {
                  name: emp.emergencyContact?.name || emp.personalInfo?.emergencyContact?.name || '',
                  phone: emp.emergencyContact?.phone || emp.personalInfo?.emergencyContact?.phone || '',
                  relationship: emp.emergencyContact?.relationship || emp.personalInfo?.emergencyContact?.relationship || '',
                },
              },
              jobDetails: {
                employeeId: emp.employeeId || emp.jobDetails?.employeeId || '',
                department: emp.jobDetails?.department || '',
                position: emp.jobDetails?.designation || emp.jobDetails?.position || '',
                jobTitle: emp.jobDetails?.designation || emp.jobDetails?.jobTitle || '',
                workLocation: emp.jobDetails?.workLocation || 'Office',
                employmentType: emp.jobDetails?.employmentType || 'full-time',
                startDate: emp.jobDetails?.joiningDate ? dayjs(emp.jobDetails.joiningDate) : (emp.jobDetails?.startDate ? dayjs(emp.jobDetails.startDate) : null),
                reportingManager: emp.jobDetails?.reportingManager || '',
                workSchedule: emp.jobDetails?.workSchedule || 'Mon-Fri 9AM-5PM',
              },
              compensation: {
                baseSalary: emp.jobDetails?.salary?.basic || 0,
                currency: emp.jobDetails?.salary?.currency || 'USD',
                payFrequency: 'Monthly',
                benefits: [],
              },
              role: emp.role || 'employee',
              status: emp.status || 'Active',
            }));
            setEmployees(transformedEmployees);
            setFilteredEmployees(transformedEmployees);
          }
        } catch (error) {
          console.error('Error loading employees:', error);
        } finally {
          setLoading(false);
        }
      };
      await loadEmployees();
      
      // Close the form
      setEmployeeFormOpen(false);
      
      // Show success message
      alert('Employee created successfully!');
    } catch (error: any) {
      console.error('Error creating employee:', error);
      alert(`Failed to create employee: ${error.message || 'Please try again.'}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'terminated':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#0288d1'];
    const index = name.length % colors.length;
    return colors[index];
  };

  const clearFilters = () => {
    setDepartmentFilter('');
    setStatusFilter('');
    setEmploymentTypeFilter('');
    setSearchTerm('');
  };

  const hasActiveFilters = searchTerm || departmentFilter || statusFilter || employmentTypeFilter;

  // Export functionality
  const handleExport = () => {
    // Create CSV content
    const headers = ['Employee ID', 'Name', 'Email', 'Department', 'Position', 'Status', 'Salary', 'Start Date'];
    
    const csvContent = [
      headers.join(','),
      ...filteredEmployees.map(emp => [
        emp.jobDetails.employeeId,
        `"${emp.personalInfo.firstName} ${emp.personalInfo.lastName}"`,
        emp.personalInfo.email,
        emp.jobDetails.department,
        emp.jobDetails.jobTitle,
        emp.status,
        emp.compensation.baseSalary,
        emp.jobDetails.startDate?.format('YYYY-MM-DD') || 'N/A'
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get unique values for filter dropdowns
  const departments = [...new Set(employees.map(emp => emp.jobDetails.department))];
  const statuses = [...new Set(employees.map(emp => emp.status))];
  const employmentTypes = [...new Set(employees.map(emp => emp.jobDetails.employmentType))];

  // Mobile Card View
  const renderMobileCard = (employee: Employee) => (
    <Zoom in key={employee.id} style={{ transitionDelay: '50ms' }}>
      <Card 
        sx={{ 
          mb: 2, 
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 4,
          }
        }}
        onClick={() => handleView(employee)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                sx={{ 
                  bgcolor: getAvatarColor(employee.personalInfo.firstName + employee.personalInfo.lastName),
                  width: 48,
                  height: 48,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                }}
              >
                {getInitials(employee.personalInfo.firstName, employee.personalInfo.lastName)}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                  {employee.personalInfo.firstName} {employee.personalInfo.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {employee.jobDetails.employeeId}
                </Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={(e) => handleActionMenuOpen(e, employee)}
              sx={{ color: 'text.secondary' }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>
          
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2">
                {employee.jobDetails.jobTitle}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2">
                {employee.jobDetails.department}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2">
                {employee.jobDetails.workLocation}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                ${employee.compensation.baseSalary.toLocaleString()}
              </Typography>
            </Box>
          </Stack>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Chip
              label={employee.status}
              color={getStatusColor(employee.status) as any}
              size="small"
              sx={{ textTransform: 'capitalize' }}
            />
            <Typography variant="caption" color="text.secondary">
              Started: {employee.jobDetails.startDate?.format('MMM YYYY') || 'N/A'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  );

  if (loading) {
    return (
      <Box>
        {/* Header Skeleton */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="rectangular" width={150} height={40} sx={{ borderRadius: 1 }} />
        </Box>

        {/* Search and Filter Skeleton */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
              </Grid>
              <Grid item xs={6} md={2}>
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
              </Grid>
              <Grid item xs={6} md={2}>
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
              </Grid>
              <Grid item xs={12} md={2}>
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Content Skeleton */}
        <Card>
          <CardContent>
            {Array.from({ length: 5 }).map((_, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Skeleton variant="circular" width={48} height={48} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </Box>
                </Box>
                <Stack spacing={1}>
                  <Skeleton variant="text" width="80%" height={20} />
                  <Skeleton variant="text" width="70%" height={20} />
                  <Skeleton variant="text" width="60%" height={20} />
                </Stack>
                {index < 4 && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Fade in timeout={500}>
      <Box>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: 3 
        }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
              Employee Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your workforce efficiently with comprehensive employee data
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setEmployeeFormOpen(true)}
            sx={{ 
              height: 'fit-content',
              px: 3,
              py: 1.5,
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            Add Employee
          </Button>
        </Box>

        {/* Search and Filter Section */}
        <Card sx={{ mb: 3, overflow: 'visible' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search employees by name, email, department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.paper',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="medium">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    input={<OutlinedInput label="Department" />}
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="medium">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    input={<OutlinedInput label="Status" />}
                  >
                    <MenuItem value="">All Status</MenuItem>
                    {statuses.map((status) => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Stack direction="row" spacing={1}>
                  <Button 
                    variant="outlined" 
                    startIcon={<DownloadIcon />}
                    onClick={handleExport}
                    sx={{ minWidth: 'auto', px: 2 }}
                  >
                    Export
                  </Button>
                  {hasActiveFilters && (
                    <Button 
                      variant="text" 
                      startIcon={<ClearIcon />}
                      onClick={clearFilters}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      Clear
                    </Button>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Results Summary */}
        {hasActiveFilters && (
          <Alert 
            severity="info" 
            sx={{ mb: 3 }}
            icon={<SearchIcon />}
          >
            Found {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} 
            {searchTerm && ` matching "${searchTerm}"`}
            {(departmentFilter || statusFilter || employmentTypeFilter) && ' with applied filters'}
          </Alert>
        )}

        {/* Content */}
        {isMobile ? (
          // Mobile Card View
          <Box>
            {filteredEmployees
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((employee) => renderMobileCard(employee))}
          </Box>
        ) : (
          // Desktop Table View
          <Card>
            <TableContainer>
              <Table sx={{ minWidth: 750 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Position</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEmployees
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((employee, index) => (
                      <Zoom in key={employee.id} style={{ transitionDelay: `${index * 50}ms` }}>
                        <TableRow 
                          hover 
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            }
                          }}
                          onClick={() => handleView(employee)}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: getAvatarColor(employee.personalInfo.firstName + employee.personalInfo.lastName),
                                  width: 40,
                                  height: 40,
                                  fontSize: '0.9rem',
                                  fontWeight: 600,
                                }}
                              >
                                {getInitials(employee.personalInfo.firstName, employee.personalInfo.lastName)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                  {employee.personalInfo.firstName} {employee.personalInfo.lastName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {employee.personalInfo.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                              {employee.jobDetails.employeeId}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{employee.jobDetails.department}</Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {employee.jobDetails.jobTitle}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {employee.jobDetails.position}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{employee.jobDetails.workLocation}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={employee.status}
                              color={getStatusColor(employee.status) as any}
                              size="small"
                              sx={{ 
                                textTransform: 'capitalize',
                                fontWeight: 500,
                                minWidth: 70,
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                              <Tooltip title="View Details">
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleView(employee);
                                  }}
                                  sx={{ color: 'primary.main' }}
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Employee">
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(employee.id);
                                  }}
                                  sx={{ color: 'info.main' }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="More Actions">
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => handleActionMenuOpen(e, employee)}
                                  sx={{ color: 'text.secondary' }}
                                >
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      </Zoom>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}

        {/* Pagination */}
        <Card sx={{ mt: 2 }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredEmployees.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontSize: '0.875rem',
              }
            }}
          />
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={handleActionMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => selectedEmployeeForMenu && handleView(selectedEmployeeForMenu)}>
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            View Details
          </MenuItem>
          <MenuItem onClick={() => selectedEmployeeForMenu && handleEdit(selectedEmployeeForMenu.id)}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            Edit Employee
          </MenuItem>
          <Divider />
          <MenuItem 
            onClick={() => selectedEmployeeForMenu && handleDelete(selectedEmployeeForMenu)}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            Delete Employee
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={deleteDialogOpen} 
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
              Confirm Deletion
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone.
            </Alert>
            <Typography>
              Are you sure you want to delete employee{' '}
              <strong>
                {selectedEmployee?.personalInfo.firstName} {selectedEmployee?.personalInfo.lastName}
              </strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              All associated data including payroll records and leave history will be permanently removed.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
              Cancel
            </Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              Delete Employee
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Employee Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
            }
          }}
        >
          <DialogTitle sx={{ pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {selectedEmployee && (
                <>
                  <Avatar 
                    sx={{ 
                      bgcolor: getAvatarColor(selectedEmployee.personalInfo.firstName + selectedEmployee.personalInfo.lastName),
                      width: 56,
                      height: 56,
                      fontSize: '1.5rem',
                      fontWeight: 600,
                    }}
                  >
                    {getInitials(selectedEmployee.personalInfo.firstName, selectedEmployee.personalInfo.lastName)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {selectedEmployee.personalInfo.firstName} {selectedEmployee.personalInfo.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedEmployee.jobDetails.jobTitle} • {selectedEmployee.jobDetails.department}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedEmployee && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    <Chip
                      label={selectedEmployee.status}
                      color={getStatusColor(selectedEmployee.status) as any}
                      sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                    />
                    <Chip
                      label={selectedEmployee.jobDetails.employmentType}
                      variant="outlined"
                    />
                    <Chip
                      label={selectedEmployee.jobDetails.workLocation}
                      variant="outlined"
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Personal Information
                    </Typography>
                  </Box>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Employee ID</Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                        {selectedEmployee.jobDetails.employeeId}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{selectedEmployee.personalInfo.email}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Phone</Typography>
                      <Typography variant="body1">{selectedEmployee.personalInfo.phone}</Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <WorkIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Job Details
                    </Typography>
                  </Box>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Department</Typography>
                      <Typography variant="body1">{selectedEmployee.jobDetails.department}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Position</Typography>
                      <Typography variant="body1">{selectedEmployee.jobDetails.jobTitle}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Reporting Manager</Typography>
                      <Typography variant="body1">{selectedEmployee.jobDetails.reportingManager}</Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <TrendingUpIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Compensation
                    </Typography>
                  </Box>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Base Salary</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                        ${selectedEmployee.compensation.baseSalary.toLocaleString()} {selectedEmployee.compensation.currency}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Pay Frequency</Typography>
                      <Typography variant="body1">{selectedEmployee.compensation.payFrequency}</Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CalendarIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Timeline
                    </Typography>
                  </Box>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Start Date</Typography>
                      <Typography variant="body1">
                        {selectedEmployee.jobDetails.startDate?.format('MMMM DD, YYYY') || 'N/A'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Work Schedule</Typography>
                      <Typography variant="body1">{selectedEmployee.jobDetails.workSchedule}</Typography>
                    </Box>
                  </Stack>
                </Grid>

                {selectedEmployee.compensation.benefits.length > 0 && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <BadgeIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Benefits
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {selectedEmployee.compensation.benefits.map((benefit, index) => (
                        <Chip key={index} label={benefit} variant="outlined" size="small" />
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setViewDialogOpen(false)} variant="outlined">
              Close
            </Button>
            <Button 
              onClick={() => selectedEmployee && handleEdit(selectedEmployee.id)} 
              variant="contained"
              startIcon={<EditIcon />}
            >
              Edit Employee
            </Button>
          </DialogActions>
        </Dialog>

        {/* Employee Form Dialog */}
        <Dialog
          open={employeeFormOpen}
          onClose={() => setEmployeeFormOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="employeeId"
                    label="Employee ID"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="email"
                    label="Email"
                    type="email"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="firstName"
                    label="First Name"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="lastName"
                    label="Last Name"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="phone"
                    label="Phone"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="department"
                    label="Department"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="designation"
                    label="Position/Designation"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="workLocation"
                    label="Work Location"
                    fullWidth
                    defaultValue="Office"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="joiningDate"
                    label="Joining Date"
                    type="date"
                    fullWidth
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="basicSalary"
                    label="Basic Salary"
                    type="number"
                    fullWidth
                    required
                    defaultValue={50000}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEmployeeFormOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => {
                const employeeData = {
                  employeeId: (document.getElementById('employeeId') as HTMLInputElement)?.value,
                  email: (document.getElementById('email') as HTMLInputElement)?.value,
                  role: 'employee',
                  profile: {
                    firstName: (document.getElementById('firstName') as HTMLInputElement)?.value,
                    lastName: (document.getElementById('lastName') as HTMLInputElement)?.value,
                    phone: (document.getElementById('phone') as HTMLInputElement)?.value,
                  },
                  jobDetails: {
                    department: (document.getElementById('department') as HTMLInputElement)?.value,
                    designation: (document.getElementById('designation') as HTMLInputElement)?.value,
                    joiningDate: (document.getElementById('joiningDate') as HTMLInputElement)?.value,
                    employmentType: 'full-time',
                    salary: {
                      basic: parseInt((document.getElementById('basicSalary') as HTMLInputElement)?.value || '50000'),
                      allowances: 0,
                      currency: 'USD'
                    },
                    workLocation: (document.getElementById('workLocation') as HTMLInputElement)?.value || 'Office'
                  },
                  emergencyContact: {
                    name: '',
                    relationship: '',
                    phone: ''
                  }
                };
                
                handleSaveEmployee(employeeData);
              }}
              variant="contained"
            >
              Save Employee
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Employee Form Dialog */}
        <Dialog
          open={editEmployeeFormOpen}
          onClose={() => setEditEmployeeFormOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="edit-employeeId"
                    label="Employee ID"
                    fullWidth
                    required
                    defaultValue={employeeToEdit?.jobDetails.employeeId}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="edit-email"
                    label="Email"
                    type="email"
                    fullWidth
                    required
                    defaultValue={employeeToEdit?.personalInfo.email}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="edit-firstName"
                    label="First Name"
                    fullWidth
                    required
                    defaultValue={employeeToEdit?.personalInfo.firstName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="edit-lastName"
                    label="Last Name"
                    fullWidth
                    required
                    defaultValue={employeeToEdit?.personalInfo.lastName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="edit-phone"
                    label="Phone"
                    fullWidth
                    defaultValue={employeeToEdit?.personalInfo.phone}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="edit-department"
                    label="Department"
                    fullWidth
                    required
                    defaultValue={employeeToEdit?.jobDetails.department}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="edit-designation"
                    label="Position/Designation"
                    fullWidth
                    required
                    defaultValue={employeeToEdit?.jobDetails.jobTitle}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="edit-workLocation"
                    label="Work Location"
                    fullWidth
                    defaultValue={employeeToEdit?.jobDetails.workLocation}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="edit-joiningDate"
                    label="Joining Date"
                    type="date"
                    fullWidth
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                    defaultValue={employeeToEdit?.jobDetails.startDate?.format('YYYY-MM-DD')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="edit-basicSalary"
                    label="Basic Salary"
                    type="number"
                    fullWidth
                    required
                    defaultValue={employeeToEdit?.compensation.baseSalary}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditEmployeeFormOpen(false)}>Cancel</Button>
            <Button 
              onClick={async () => {
                if (!employeeToEdit) return;
                
                const employeeData = {
                  email: (document.getElementById('edit-email') as HTMLInputElement)?.value,
                  profile: {
                    firstName: (document.getElementById('edit-firstName') as HTMLInputElement)?.value,
                    lastName: (document.getElementById('edit-lastName') as HTMLInputElement)?.value,
                    phone: (document.getElementById('edit-phone') as HTMLInputElement)?.value,
                  },
                  jobDetails: {
                    department: (document.getElementById('edit-department') as HTMLInputElement)?.value,
                    designation: (document.getElementById('edit-designation') as HTMLInputElement)?.value,
                    joiningDate: (document.getElementById('edit-joiningDate') as HTMLInputElement)?.value,
                    salary: {
                      basic: parseInt((document.getElementById('edit-basicSalary') as HTMLInputElement)?.value || '50000'),
                      allowances: 0,
                      currency: 'USD'
                    },
                    workLocation: (document.getElementById('edit-workLocation') as HTMLInputElement)?.value || 'Office'
                  }
                };
                
                try {
                  const response = await fetch(`/api/employees/${employeeToEdit.id}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(employeeData),
                  });

                  if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to update employee');
                  }

                  // Refresh the employee list
                  const loadEmployees = async () => {
                    try {
                      const response = await fetch('/api/employees');
                      if (response.ok) {
                        const data = await response.json();
                        const backendEmployees = data.data?.employees || data.employees || [];
                        const transformedEmployees = backendEmployees.map((emp: any) => ({
                          id: emp._id || emp.id,
                          personalInfo: {
                            firstName: emp.profile?.firstName || emp.personalInfo?.firstName || '',
                            lastName: emp.profile?.lastName || emp.personalInfo?.lastName || '',
                            email: emp.email || emp.personalInfo?.email || '',
                            phone: emp.profile?.phone || emp.personalInfo?.phone || '',
                            dateOfBirth: emp.profile?.dateOfBirth ? dayjs(emp.profile.dateOfBirth) : (emp.personalInfo?.dateOfBirth ? dayjs(emp.personalInfo.dateOfBirth) : null),
                            address: emp.profile?.address?.street || emp.personalInfo?.address || '',
                            emergencyContact: {
                              name: emp.emergencyContact?.name || emp.personalInfo?.emergencyContact?.name || '',
                              phone: emp.emergencyContact?.phone || emp.personalInfo?.emergencyContact?.phone || '',
                              relationship: emp.emergencyContact?.relationship || emp.personalInfo?.emergencyContact?.relationship || '',
                            },
                          },
                          jobDetails: {
                            employeeId: emp.employeeId || emp.jobDetails?.employeeId || '',
                            department: emp.jobDetails?.department || '',
                            position: emp.jobDetails?.designation || emp.jobDetails?.position || '',
                            jobTitle: emp.jobDetails?.designation || emp.jobDetails?.jobTitle || '',
                            workLocation: emp.jobDetails?.workLocation || 'Office',
                            employmentType: emp.jobDetails?.employmentType || 'full-time',
                            startDate: emp.jobDetails?.joiningDate ? dayjs(emp.jobDetails.joiningDate) : (emp.jobDetails?.startDate ? dayjs(emp.jobDetails.startDate) : null),
                            reportingManager: emp.jobDetails?.reportingManager || '',
                            workSchedule: emp.jobDetails?.workSchedule || 'Mon-Fri 9AM-5PM',
                          },
                          compensation: {
                            baseSalary: emp.jobDetails?.salary?.basic || 0,
                            currency: emp.jobDetails?.salary?.currency || 'USD',
                            payFrequency: 'Monthly',
                            benefits: [],
                          },
                          role: emp.role || 'employee',
                          status: emp.status || 'Active',
                        }));
                        setEmployees(transformedEmployees);
                        setFilteredEmployees(transformedEmployees);
                      }
                    } catch (error) {
                      console.error('Error loading employees:', error);
                    }
                  };
                  await loadEmployees();

                  setEditEmployeeFormOpen(false);
                  setEmployeeToEdit(null);
                  alert('Employee updated successfully!');
                } catch (error: any) {
                  console.error('Error updating employee:', error);
                  alert(`Failed to update employee: ${error.message || 'Please try again.'}`);
                }
              }}
              variant="contained"
            >
              Update Employee
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default EmployeeList;
