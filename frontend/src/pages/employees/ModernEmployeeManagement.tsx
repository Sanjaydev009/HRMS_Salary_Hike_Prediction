import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { RootState } from '../../store/store';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Stack,
  Fab,
  Zoom,
  useTheme,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  FormControl,
  InputLabel,
  Select,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Visibility,
  Delete,
  Email,
  Business,
  LocationOn,
  CalendarToday,
  People,
  Download,
  Upload,
  Refresh,
  ViewModule,
  ViewList,
  PersonAdd,
  CheckCircle,
  Warning,
  Schedule,
} from '@mui/icons-material';
import ProfessionalEmployeeForm from '../../components/employees/ProfessionalEmployeeForm';
import { employeeAPI } from '../../services/api';
import dayjs from 'dayjs';

// Import Employee type from the ProfessionalEmployeeForm
type Employee = React.ComponentProps<typeof ProfessionalEmployeeForm>['employee'] & {
  id: string;
  status: string;
  onboardingProgress?: number;
  lastActive?: dayjs.Dayjs;
  createdAt?: dayjs.Dayjs;
  createdBy?: string;
};

const ModernEmployeeManagement: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // State management
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  
  // Dialog states
  const [employeeFormOpen, setEmployeeFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuEmployee, setMenuEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle route-based form opening
  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/employees/new') {
      // Open add employee form
      setSelectedEmployee(null);
      setFormMode('add');
      setEmployeeFormOpen(true);
    } else if (path.startsWith('/employees/edit/')) {
      // Open edit employee form
      const employeeId = params.id;
      if (employeeId && employees.length > 0) {
        const employee = employees.find(emp => emp.id === employeeId);
        if (employee) {
          setSelectedEmployee(employee);
          setFormMode('edit');
          setEmployeeFormOpen(true);
        }
      }
    }
  }, [location.pathname, params.id, employees]);

  // Transform backend User data to frontend Employee format
  const transformUserToEmployee = (user: any): Employee => {
    return {
      id: user._id || user.id,
      personalInfo: {
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        middleName: user.profile?.middleName || '',
        email: user.email,
        phone: user.profile?.phone || '',
        alternatePhone: user.profile?.alternatePhone || '',
        dateOfBirth: user.profile?.dateOfBirth ? dayjs(user.profile.dateOfBirth) : dayjs(),
        gender: user.profile?.gender || '',
        maritalStatus: user.profile?.maritalStatus || '',
        nationality: user.profile?.nationality || '',
        address: {
          street: user.profile?.address?.street || '',
          city: user.profile?.address?.city || '',
          state: user.profile?.address?.state || '',
          zipCode: user.profile?.address?.zipCode || '',
          country: user.profile?.address?.country || ''
        },
        emergencyContact: {
          name: user.emergencyContact?.name || '',
          relationship: user.emergencyContact?.relationship || '',
          phone: user.emergencyContact?.phone || '',
          address: user.emergencyContact?.address || ''
        },
        profilePicture: user.profile?.profilePicture || '',
      },
      identityDocuments: {
        passport: user.identityDocuments?.passport ? {
          number: user.identityDocuments.passport.number || '',
          expiryDate: user.identityDocuments.passport.expiryDate ? dayjs(user.identityDocuments.passport.expiryDate) : null
        } : undefined,
        nationalId: user.identityDocuments?.nationalId ? {
          number: user.identityDocuments.nationalId.number || '',
          expiryDate: user.identityDocuments.nationalId.expiryDate ? dayjs(user.identityDocuments.nationalId.expiryDate) : null
        } : undefined,
        drivingLicense: user.identityDocuments?.driversLicense ? {
          number: user.identityDocuments.driversLicense.number || '',
          expiryDate: user.identityDocuments.driversLicense.expiryDate ? dayjs(user.identityDocuments.driversLicense.expiryDate) : null
        } : undefined,
        socialSecurity: user.identityDocuments?.socialSecurity || undefined
      },
      education: user.education ? {
        degree: user.education.degree || '',
        field: user.education.field || '',
        institution: user.education.institution || '',
        graduationYear: user.education.graduationYear || new Date().getFullYear(),
        gpa: user.education.gpa || '',
        certifications: user.education.certifications || []
      } : {
        degree: '',
        field: '',
        institution: '',
        graduationYear: new Date().getFullYear(),
        gpa: '',
        certifications: []
      },
      workExperience: user.workExperience ? {
        previousCompany: user.workExperience.previousCompany,
        previousRole: user.workExperience.previousRole,
        experienceYears: user.workExperience.experienceYears || 0,
        lastSalary: user.workExperience.lastSalary,
        reasonForLeaving: user.workExperience.reasonForLeaving,
        references: user.workExperience.references || []
      } : {
        previousCompany: '',
        previousRole: '',
        experienceYears: 0,
        lastSalary: 0,
        reasonForLeaving: '',
        references: []
      },
      jobDetails: {
        employeeId: user.employeeId,
        department: user.jobDetails?.department || '',
        position: user.jobDetails?.position || '',
        jobTitle: user.jobDetails?.designation || user.jobDetails?.jobTitle || '',
        startDate: user.jobDetails?.joiningDate ? dayjs(user.jobDetails.joiningDate) : dayjs(),
        employmentType: user.jobDetails?.employmentType || 'Full-time',
        workMode: user.jobDetails?.workMode || 'On-site',
        reportingManager: user.jobDetails?.reportingManager || '',
        workLocation: user.jobDetails?.workLocation || '',
        workSchedule: user.jobDetails?.workSchedule || '9 AM - 5 PM',
        probationPeriod: user.jobDetails?.probationPeriod || 6
      },
      compensation: {
        baseSalary: user.jobDetails?.salary?.basic || 0,
        currency: user.jobDetails?.salary?.currency || 'INR',
        payFrequency: 'Monthly',
        allowances: user.jobDetails?.salary?.allowances ? 
          Object.entries(user.jobDetails.salary.allowances).map(([type, amount]) => ({ type, amount: amount as number })) : [],
        benefits: user.jobDetails?.benefits || [],
        bonusEligible: false,
        salaryReviewDate: null
      },
      systemAccess: {
        role: user.role,
        permissions: ['read_profile', 'edit_profile'],
        systemsAccess: [],
        equipmentNeeded: [],
        accessCardRequired: false,
        parkingRequired: false
      },
      onboardingTasks: user.onboardingTasks?.map((task: any) => ({
        id: task.id || task._id || '',
        title: task.title || task.task || '',
        description: task.description || task.notes || '',
        assignedTo: task.assignedTo || '',
        dueDate: task.dueDate ? dayjs(task.dueDate) : null,
        status: task.status || task.completed ? 'completed' : 'pending',
        priority: task.priority || 'medium'
      })) || [],
      status: user.status === 'active' ? 'Active' : user.status === 'inactive' ? 'Inactive' : user.status === 'terminated' ? 'Terminated' : 'Active',
      onboardingProgress: user.onboardingProgress || 100,
      lastActive: user.lastActive ? dayjs(user.lastActive) : dayjs(),
      createdAt: user.createdAt ? dayjs(user.createdAt) : dayjs(),
      createdBy: user.createdBy || ''
    };
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeeAPI.getAll();
      
      if (response.success && response.data?.employees) {
        const transformedEmployees = response.data.employees.map(transformUserToEmployee);
        setEmployees(transformedEmployees);
      } else {
        console.error('Failed to fetch employees:', response.message || 'Unknown error');
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = () => {
    navigate('/employees/new');
  };

  const handleEditEmployee = (employee: Employee) => {
    navigate(`/employees/edit/${employee.id}`);
    setAnchorEl(null);
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormMode('view');
    setEmployeeFormOpen(true);
    setAnchorEl(null);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
    setAnchorEl(null);
  };

  const confirmDeleteEmployee = async () => {
    if (employeeToDelete) {
      try {
        setLoading(true);
        const response = await employeeAPI.delete(employeeToDelete.id);
        
        if (response.success) {
          setEmployees(prev => prev.filter(emp => emp.id !== employeeToDelete.id));
        } else {
          console.error('Failed to delete employee:', response.message);
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
      } finally {
        setLoading(false);
        setDeleteDialogOpen(false);
        setEmployeeToDelete(null);
      }
    }
  };

  const handleSaveEmployee = async (employeeData: any) => {
    try {
      setLoading(true);
      
      if (formMode === 'add') {
        // Transform frontend data to backend format
        const backendData = {
          employeeId: employeeData.jobDetails?.employeeId,
          email: employeeData.personalInfo?.email,
          role: 'employee',
          profile: {
            firstName: employeeData.personalInfo?.firstName,
            lastName: employeeData.personalInfo?.lastName,
            middleName: employeeData.personalInfo?.middleName,
            phone: employeeData.personalInfo?.phone,
            dateOfBirth: employeeData.personalInfo?.dateOfBirth?.toISOString(),
            gender: employeeData.personalInfo?.gender,
            maritalStatus: employeeData.personalInfo?.maritalStatus,
            nationality: employeeData.personalInfo?.nationality,
            address: employeeData.personalInfo?.address,
            profilePicture: employeeData.personalInfo?.profilePicture
          },
          jobDetails: {
            department: employeeData.jobDetails?.department,
            designation: employeeData.jobDetails?.jobTitle,
            position: employeeData.jobDetails?.position,
            joiningDate: employeeData.jobDetails?.startDate?.toISOString(),
            employmentType: employeeData.jobDetails?.employmentType,
            workMode: employeeData.jobDetails?.workMode,
            workLocation: employeeData.jobDetails?.workLocation,
            workSchedule: employeeData.jobDetails?.workSchedule,
            probationPeriod: employeeData.jobDetails?.probationPeriod,
            salary: {
              basic: employeeData.compensation?.baseSalary,
              currency: employeeData.compensation?.currency
            },
            benefits: employeeData.compensation?.benefits
          },
          emergencyContact: employeeData.personalInfo?.emergencyContact,
          status: 'active'
        };
        
        const response = await employeeAPI.create(backendData as any);
        
        if (response.success) {
          // Refresh the employee list to get the latest data
          await fetchEmployees();
        } else {
          console.error('Failed to create employee:', response.message);
        }
      } else if (formMode === 'edit' && selectedEmployee) {
        // Transform frontend data to backend format for update
        const backendUpdateData = {
          profile: {
            firstName: employeeData.personalInfo?.firstName,
            lastName: employeeData.personalInfo?.lastName,
            middleName: employeeData.personalInfo?.middleName,
            phone: employeeData.personalInfo?.phone,
            dateOfBirth: employeeData.personalInfo?.dateOfBirth?.toISOString(),
            gender: employeeData.personalInfo?.gender,
            maritalStatus: employeeData.personalInfo?.maritalStatus,
            nationality: employeeData.personalInfo?.nationality,
            address: employeeData.personalInfo?.address,
            profilePicture: employeeData.personalInfo?.profilePicture
          },
          jobDetails: {
            department: employeeData.jobDetails?.department,
            designation: employeeData.jobDetails?.jobTitle,
            position: employeeData.jobDetails?.position,
            joiningDate: employeeData.jobDetails?.startDate?.toISOString(),
            employmentType: employeeData.jobDetails?.employmentType,
            workMode: employeeData.jobDetails?.workMode,
            workLocation: employeeData.jobDetails?.workLocation,
            probationPeriod: employeeData.jobDetails?.probationPeriod,
            salary: {
              basic: employeeData.compensation?.baseSalary,
              currency: employeeData.compensation?.currency,
              allowances: employeeData.compensation?.allowances
            },
            benefits: employeeData.compensation?.benefits
          },
          emergencyContact: employeeData.personalInfo?.emergencyContact,
          education: employeeData.education,
          workExperience: employeeData.workExperience,
          identityDocuments: employeeData.identityDocuments,
          onboardingTasks: employeeData.onboardingTasks
        };
        
        const response = await employeeAPI.update(selectedEmployee.id, backendUpdateData as any);
        
        if (response.success) {
          // Refresh the employee list to get the latest data
          await fetchEmployees();
        } else {
          console.error('Failed to update employee:', response.message);
        }
      }
    } catch (error) {
      console.error('Error saving employee:', error);
    } finally {
      setLoading(false);
      setEmployeeFormOpen(false);
      setSelectedEmployee(null);
      // Navigate back to employees list
      navigate('/employees');
    }
  };

  const handleFormClose = () => {
    setEmployeeFormOpen(false);
    setSelectedEmployee(null);
    // Navigate back to employees list when form is closed
    navigate('/employees');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, employee: Employee) => {
    setAnchorEl(event.currentTarget);
    setMenuEmployee(employee);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuEmployee(null);
  };

  // Filter and search logic
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = (
      employee.personalInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.personalInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.jobDetails.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.jobDetails.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesDepartment = !filterDepartment || employee.jobDetails.department === filterDepartment;
    const matchesStatus = !filterStatus || employee.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Pagination
  const paginatedEmployees = filteredEmployees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Statistics
  const stats = {
    total: employees.length,
    active: employees.filter(emp => emp.status === 'Active').length,
    onboarding: employees.filter(emp => (emp.onboardingProgress || 0) < 100).length,
    departments: [...new Set(employees.map(emp => emp.jobDetails.department))].length,
  };

  const departments = [...new Set(employees.map(emp => emp.jobDetails.department))];
  const statuses = [...new Set(employees.map(emp => emp.status))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'default';
      case 'On Leave': return 'warning';
      case 'Terminated': return 'error';
      default: return 'default';
    }
  };

  const getOnboardingStatusIcon = (progress: number) => {
    if (progress === 100) return <CheckCircle color="success" />;
    if (progress > 50) return <Schedule color="warning" />;
    return <Warning color="error" />;
  };

  const renderEmployeeCard = (employee: Employee) => (
    <Card
      key={employee.id}
      sx={{
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: employee.status === 'Active' ? 'success.main' : 'grey.400',
                    border: '2px solid white',
                  }}
                />
              }
            >
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: 'primary.main',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                }}
                src={employee.personalInfo.profilePicture}
              >
                {employee.personalInfo.firstName.charAt(0)}
                {employee.personalInfo.lastName.charAt(0)}
              </Avatar>
            </Badge>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {employee.personalInfo.firstName} {employee.personalInfo.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {employee.jobDetails.jobTitle}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {employee.jobDetails.employeeId}
              </Typography>
            </Box>
          </Stack>
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, employee)}
          >
            <MoreVert />
          </IconButton>
        </Stack>

        {/* Employee Details */}
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Business fontSize="small" color="action" />
            <Typography variant="body2">
              {employee.jobDetails.department}
            </Typography>
            <Chip
              label={employee.jobDetails.position}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Email fontSize="small" color="action" />
            <Typography variant="body2" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {employee.personalInfo.email}
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <LocationOn fontSize="small" color="action" />
            <Typography variant="body2">
              {employee.personalInfo.address.city}, {employee.personalInfo.address.state}
            </Typography>
            <Chip
              label={employee.jobDetails.workMode}
              size="small"
              variant="outlined"
            />
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <CalendarToday fontSize="small" color="action" />
            <Typography variant="body2">
              Started {employee.jobDetails.startDate?.format('MMM YYYY') || 'N/A'}
            </Typography>
          </Stack>
        </Stack>

        {/* Status and Progress */}
        <Box sx={{ mt: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Chip
              label={employee.status}
              color={getStatusColor(employee.status) as any}
              size="small"
            />
            <Stack direction="row" alignItems="center" spacing={0.5}>
              {getOnboardingStatusIcon(employee.onboardingProgress || 0)}
              <Typography variant="caption">
                {employee.onboardingProgress || 0}% Complete
              </Typography>
            </Stack>
          </Stack>
          
          {(employee.onboardingProgress || 0) < 100 && (
            <LinearProgress
              variant="determinate"
              value={employee.onboardingProgress || 0}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              }}
            />
          )}
        </Box>

        {/* Quick Actions */}
        <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
          <Button
            size="small"
            startIcon={<Visibility />}
            onClick={() => handleViewEmployee(employee)}
          >
            View
          </Button>
          {(user?.role === 'hr' || user?.role === 'admin') && (
            <Button
              size="small"
              startIcon={<Edit />}
              onClick={() => handleEditEmployee(employee)}
            >
              Edit
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  const renderEmployeeTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Employee</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>Onboarding</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedEmployees.map((employee) => (
            <TableRow key={employee.id} hover>
              <TableCell>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    src={employee.personalInfo.profilePicture}
                    sx={{ width: 40, height: 40 }}
                  >
                    {employee.personalInfo.firstName.charAt(0)}
                    {employee.personalInfo.lastName.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {employee.personalInfo.firstName} {employee.personalInfo.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {employee.jobDetails.employeeId} • {employee.personalInfo.email}
                    </Typography>
                  </Box>
                </Stack>
              </TableCell>
              <TableCell>{employee.jobDetails.department}</TableCell>
              <TableCell>
                <Stack>
                  <Typography variant="body2">{employee.jobDetails.jobTitle}</Typography>
                  <Chip
                    label={employee.jobDetails.position}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
              </TableCell>
              <TableCell>
                <Chip
                  label={employee.status}
                  color={getStatusColor(employee.status) as any}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {employee.jobDetails.startDate?.format('MMM DD, YYYY') || 'N/A'}
              </TableCell>
              <TableCell>
                <Stack direction="row" alignItems="center" spacing={1}>
                  {getOnboardingStatusIcon(employee.onboardingProgress || 0)}
                  <Typography variant="body2">
                    {employee.onboardingProgress || 0}%
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, employee)}
                >
                  <MoreVert />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[12, 24, 48]}
        component="div"
        count={filteredEmployees.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </TableContainer>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Employee Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your team with professional onboarding and comprehensive employee profiles
            </Typography>
          </Box>
          
          {(user?.role === 'hr' || user?.role === 'admin') && (
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Upload />}
                size="large"
              >
                Import
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                size="large"
              >
                Export
              </Button>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                size="large"
                onClick={handleAddEmployee}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  px: 3,
                }}
              >
                Add Employee
              </Button>
            </Stack>
          )}
        </Stack>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'Total Employees', value: stats.total, icon: <People />, color: 'primary' },
            { label: 'Active', value: stats.active, icon: <CheckCircle />, color: 'success' },
            { label: 'Onboarding', value: stats.onboarding, icon: <Schedule />, color: 'warning' },
            { label: 'Departments', value: stats.departments, icon: <Business />, color: 'info' },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: alpha(
                          (theme.palette[stat.color as keyof typeof theme.palette] as import('@mui/material').PaletteColor).main,
                          0.1
                        ),
                        color: `${stat.color}.main`,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={filterDepartment}
              label="Department"
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="">All Status</MenuItem>
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ flex: 1 }} />

          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchEmployees}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Card View">
              <IconButton
                onClick={() => setViewMode('card')}
                color={viewMode === 'card' ? 'primary' : 'default'}
              >
                <ViewModule />
              </IconButton>
            </Tooltip>
            <Tooltip title="Table View">
              <IconButton
                onClick={() => setViewMode('table')}
                color={viewMode === 'table' ? 'primary' : 'default'}
              >
                <ViewList />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Employee List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <LinearProgress sx={{ width: '50%' }} />
        </Box>
      ) : (
        <>
          {viewMode === 'card' ? (
            <>
              <Grid container spacing={3}>
                {paginatedEmployees.map((employee) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={employee.id}>
                    {renderEmployeeCard(employee)}
                  </Grid>
                ))}
              </Grid>
              
              {filteredEmployees.length > rowsPerPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <TablePagination
                    rowsPerPageOptions={[12, 24, 48]}
                    component="div"
                    count={filteredEmployees.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                  />
                </Box>
              )}
            </>
          ) : (
            renderEmployeeTable()
          )}
        </>
      )}

      {/* Floating Action Button */}
      {(user?.role === 'hr' || user?.role === 'admin') && (
        <Zoom in>
          <Fab
            color="primary"
            onClick={handleAddEmployee}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <Add />
          </Fab>
        </Zoom>
      )}

      {/* Employee Form Dialog */}
      <ProfessionalEmployeeForm
        open={employeeFormOpen}
        onClose={handleFormClose}
        onSave={handleSaveEmployee}
        employee={selectedEmployee}
        mode={formMode}
        currentUserRole={user?.role || 'employee'}
      />

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => menuEmployee && handleViewEmployee(menuEmployee)}>
          <Visibility fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {(user?.role === 'hr' || user?.role === 'admin') && [
          <MenuItem key="edit" onClick={() => menuEmployee && handleEditEmployee(menuEmployee)}>
            <Edit fontSize="small" sx={{ mr: 1 }} />
            Edit Employee
          </MenuItem>,
          <MenuItem key="delete" onClick={() => menuEmployee && handleDeleteEmployee(menuEmployee)}>
            <Delete fontSize="small" sx={{ mr: 1 }} />
            Delete Employee
          </MenuItem>
        ]}
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. All employee data will be permanently removed.
          </Alert>
          <Typography>
            Are you sure you want to delete{' '}
            <strong>
              {employeeToDelete?.personalInfo.firstName} {employeeToDelete?.personalInfo.lastName}
            </strong>
            ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteEmployee} color="error" variant="contained">
            Delete Employee
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModernEmployeeManagement;
