import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Fab,
  Tooltip,
  CircularProgress,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  useTheme,
  alpha,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  Check as CheckIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  ContactPhone as ContactPhoneIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon,
  PersonAdd as PersonAddIcon,
  ReviewsOutlined as ReviewIcon
} from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

// Types
interface Employee {
  _id: string;
  employeeId: string;
  email: string;
  role: 'employee' | 'hr' | 'admin';
  status: 'active' | 'inactive' | 'terminated';
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
    address?: any;
    profilePicture?: string;
  };
  jobDetails: {
    department: string;
    designation: string;
    joiningDate: string;
    employmentType?: string;
    workLocation?: string;
    salary?: {
      basic: number;
      allowances?: number;
      currency: string;
    };
    reportingManager?: any;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

const departments = [
  'Engineering',
  'Human Resources',
  'Sales',
  'Marketing',
  'Finance',
  'Operations',
  'Customer Support',
  'Legal',
  'IT',
  'Research & Development'
];

const positions = [
  'Software Engineer',
  'Senior Software Engineer',
  'Team Lead',
  'Project Manager',
  'Product Manager',
  'HR Manager',
  'HR Executive',
  'Sales Manager',
  'Sales Executive',
  'Marketing Manager',
  'Financial Analyst',
  'Operations Manager',
  'System Administrator',
  'Data Analyst',
  'UI/UX Designer'
];

const ProfessionalEmployeeManagement: React.FC = () => {
  const theme = useTheme();
  const { showNotification } = useNotification();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  console.log('Auth Status:', { user, isAuthenticated, authLoading, token: localStorage.getItem('token') });
  
  // State Management
  const [employees, setEmployees] = useState<Employee[]>([]);
  console.log('Current employees state:', employees, 'Length:', employees.length);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Multi-step form state
  const [activeStep, setActiveStep] = useState(0);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const steps = [
    {
      label: 'Basic Information',
      description: 'Personal details and contact information',
      icon: <PersonIcon />
    },
    {
      label: 'Work Information', 
      description: 'Job details, department, and role',
      icon: <WorkIcon />
    },
    {
      label: 'Additional Details',
      description: 'Address and emergency contact',
      icon: <HomeIcon />
    },
    {
      label: 'Review & Save',
      description: 'Review all information and save',
      icon: <ReviewIcon />
    }
  ];
  const [formData, setFormData] = useState<Partial<Employee>>({
    profile: {
      firstName: '',
      lastName: '',
      phone: '',
      address: ''
    },
    email: '',
    jobDetails: {
      department: '',
      designation: '',
      joiningDate: '',
      employmentType: 'full-time',
      workLocation: 'Office',
      salary: {
        basic: 0,
        allowances: 0,
        currency: 'INR'
      }
    },
    role: 'employee',
    status: 'active',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  // Real-time data fetching
  const fetchEmployees = useCallback(async () => {
    try {
      console.log('Fetching employees...');
      console.log('Token:', localStorage.getItem('token'));
      console.log('Auth headers:', {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      });
      
      // Request all users (employees, HR, admin) with higher limit and no pagination
      const response = await api.get('/employees?limit=100&page=1&includeAllRoles=true');
      console.log('API Response:', response.data);
      console.log('Request URL:', '/employees?limit=100&page=1&includeAllRoles=true');
      
      if (response.data.success && response.data.data?.employees) {
        console.log('Found employees in response.data.data.employees:', response.data.data.employees);
        setEmployees(response.data.data.employees);
      } else if (Array.isArray(response.data)) {
        console.log('Found employees as array in response.data:', response.data);
        setEmployees(response.data);
      } else {
        console.log('No employees found, setting empty array');
        setEmployees([]);
      }
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        showNotification({ 
          type: 'error', 
          title: 'Authentication Error', 
          message: 'Please log in again to access employee data' 
        });
      } else {
        showNotification({ 
          type: 'error', 
          title: 'Error fetching employee data',
          message: error.response?.data?.message || 'Something went wrong'
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showNotification]);

  // Validation functions
  const validateStep = (step: number): boolean => {
    const errors: {[key: string]: string} = {};
    
    switch (step) {
      case 0: // Basic Information
        if (!formData.profile?.firstName?.trim()) {
          errors.firstName = 'First name is required';
        }
        if (!formData.profile?.lastName?.trim()) {
          errors.lastName = 'Last name is required';
        }
        if (!formData.email?.trim()) {
          errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          errors.email = 'Email format is invalid';
        }
        if (!formData.profile?.phone?.trim()) {
          errors.phone = 'Phone number is required';
        }
        break;
        
      case 1: // Work Information
        if (!formData.jobDetails?.department) {
          errors.department = 'Department is required';
        }
        if (!formData.jobDetails?.designation) {
          errors.designation = 'Position is required';
        }
        if (!formData.jobDetails?.joiningDate) {
          errors.joiningDate = 'Join date is required';
        }
        break;
        
      case 2: // Additional Details
        // Optional validations for emergency contact
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step navigation
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepClick = (step: number) => {
    // Allow going back to previous steps, but validate current step before going forward
    if (step < activeStep || validateStep(activeStep)) {
      setActiveStep(step);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchEmployees();
    const interval = setInterval(fetchEmployees, 30000);
    return () => clearInterval(interval);
  }, [fetchEmployees]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(2)) { // Validate all previous steps
      return;
    }
    
    setIsSubmitting(true);
    try {
      const submitData: any = {
        email: formData.email,
        profile: {
          firstName: formData.profile?.firstName,
          lastName: formData.profile?.lastName,
          phone: formData.profile?.phone,
          address: formData.profile?.address
        },
        jobDetails: {
          department: formData.jobDetails?.department,
          designation: formData.jobDetails?.designation,
          joiningDate: formData.jobDetails?.joiningDate || new Date().toISOString(),
          employmentType: formData.jobDetails?.employmentType || 'full-time',
          workLocation: formData.jobDetails?.workLocation || 'Office',
          salary: {
            basic: formData.jobDetails?.salary?.basic || 0,
            allowances: formData.jobDetails?.salary?.allowances || 0,
            currency: formData.jobDetails?.salary?.currency || 'INR'
          }
        },
        role: formData.role || 'employee',
        status: formData.status || 'active',
        emergencyContact: formData.emergencyContact
      };

      // Add employeeId only for new employees
      if (dialogMode === 'add') {
        submitData.employeeId = `EMP${Date.now()}`;
      }

      if (dialogMode === 'add') {
        const response = await api.post('/employees', submitData);
        if (response.data.success) {
          setEmployees(prev => [...prev, response.data.data.employee]);
          showNotification({ type: 'success', title: 'Employee added successfully' });
        }
      } else if (dialogMode === 'edit' && selectedEmployee) {
        const response = await api.put(`/employees/${selectedEmployee._id}`, submitData);
        if (response.data.success) {
          setEmployees(prev => prev.map(emp => emp._id === selectedEmployee._id ? response.data.data.employee : emp));
          showNotification({ type: 'success', title: 'Employee updated successfully' });
        }
      }
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving employee:', error);
      showNotification({ 
        type: 'error', 
        title: 'Error saving employee', 
        message: error.response?.data?.message || 'Something went wrong'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete employee
  const handleDelete = async (employeeId: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/employees/${employeeId}`);
        setEmployees(prev => prev.filter(emp => emp._id !== employeeId));
        showNotification({ type: 'success', title: 'Employee deleted successfully' });
      } catch (error: any) {
        console.error('Error deleting employee:', error);
        showNotification({ type: 'error', title: 'Error deleting employee' });
      }
    }
  };

  // Dialog handlers
  const handleOpenDialog = (mode: 'add' | 'edit' | 'view', employee?: Employee) => {
    setDialogMode(mode);
    setActiveStep(0); // Reset to first step
    setFormErrors({}); // Clear errors
    setIsSubmitting(false);
    
    if (employee) {
      setSelectedEmployee(employee);
      setFormData({
        profile: {
          firstName: employee.profile?.firstName || '',
          lastName: employee.profile?.lastName || '',
          phone: employee.profile?.phone || '',
          address: employee.profile?.address || ''
        },
        email: employee.email,
        jobDetails: {
          department: employee.jobDetails?.department || '',
          designation: employee.jobDetails?.designation || '',
          joiningDate: employee.jobDetails?.joiningDate ? employee.jobDetails.joiningDate.split('T')[0] : '',
          employmentType: employee.jobDetails?.employmentType || 'full-time',
          workLocation: employee.jobDetails?.workLocation || 'Office',
          salary: {
            basic: employee.jobDetails?.salary?.basic || 0,
            allowances: employee.jobDetails?.salary?.allowances || 0,
            currency: employee.jobDetails?.salary?.currency || 'INR'
          }
        },
        role: employee.role,
        status: employee.status,
        emergencyContact: employee.emergencyContact || {
          name: '',
          phone: '',
          relationship: ''
        }
      });
    } else {
      setSelectedEmployee(null);
      setFormData({
        profile: {
          firstName: '',
          lastName: '',
          phone: '',
          address: ''
        },
        email: '',
        jobDetails: {
          department: '',
          designation: '',
          joiningDate: '',
          employmentType: 'full-time',
          workLocation: 'Office',
          salary: {
            basic: 0,
            allowances: 0,
            currency: 'INR'
          }
        },
        role: 'employee',
        status: 'active',
        emergencyContact: {
          name: '',
          phone: '',
          relationship: ''
        }
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEmployee(null);
    setActiveStep(0);
    setFormErrors({});
    setIsSubmitting(false);
    setFormData({});
  };

  // Step content components
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.profile?.firstName || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  profile: { ...formData.profile, firstName: e.target.value } as any
                })}
                disabled={dialogMode === 'view'}
                required
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.profile?.lastName || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  profile: { ...formData.profile, lastName: e.target.value } as any
                })}
                disabled={dialogMode === 'view'}
                required
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={dialogMode === 'view'}
                required
                error={!!formErrors.email}
                helperText={formErrors.email}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.profile?.phone || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  profile: { ...formData.profile, phone: e.target.value } as any
                })}
                disabled={dialogMode === 'view'}
                required
                error={!!formErrors.phone}
                helperText={formErrors.phone}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    }
                  }
                }}
              />
            </Grid>
          </Grid>
        );
        
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!formErrors.department}>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.jobDetails?.department || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    jobDetails: { ...formData.jobDetails, department: e.target.value } as any
                  })}
                  disabled={dialogMode === 'view'}
                  label="Department"
                  sx={{
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    }
                  }}
                >
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
                {formErrors.department && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                    {formErrors.department}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!formErrors.designation}>
                <InputLabel>Position</InputLabel>
                <Select
                  value={formData.jobDetails?.designation || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    jobDetails: { ...formData.jobDetails, designation: e.target.value } as any
                  })}
                  disabled={dialogMode === 'view'}
                  label="Position"
                  sx={{
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    }
                  }}
                >
                  {positions.map(pos => (
                    <MenuItem key={pos} value={pos}>{pos}</MenuItem>
                  ))}
                </Select>
                {formErrors.designation && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                    {formErrors.designation}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Basic Salary"
                type="number"
                value={formData.jobDetails?.salary?.basic || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  jobDetails: { 
                    ...formData.jobDetails, 
                    salary: { ...formData.jobDetails?.salary, basic: Number(e.target.value) } as any
                  } as any
                })}
                disabled={dialogMode === 'view'}
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Join Date"
                type="date"
                value={formData.jobDetails?.joiningDate ? formData.jobDetails.joiningDate.split('T')[0] : ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  jobDetails: { ...formData.jobDetails, joiningDate: e.target.value } as any
                })}
                disabled={dialogMode === 'view'}
                required
                error={!!formErrors.joiningDate}
                helperText={formErrors.joiningDate}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role || 'employee'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  disabled={dialogMode === 'view'}
                  label="Role"
                  sx={{
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    }
                  }}
                >
                  <MenuItem value="employee">Employee</MenuItem>
                  <MenuItem value="hr">HR</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  disabled={dialogMode === 'view'}
                  label="Status"
                  sx={{
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    }
                  }}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="terminated">Terminated</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
        
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={3}
                value={formData.profile?.address || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  profile: { ...formData.profile, address: e.target.value } as any
                })}
                disabled={dialogMode === 'view'}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.error.main }}>
                🚨 Emergency Contact
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Contact Name"
                value={formData.emergencyContact?.name || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  emergencyContact: { ...formData.emergencyContact, name: e.target.value } as any
                })}
                disabled={dialogMode === 'view'}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={formData.emergencyContact?.phone || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  emergencyContact: { ...formData.emergencyContact, phone: e.target.value } as any
                })}
                disabled={dialogMode === 'view'}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Relationship"
                value={formData.emergencyContact?.relationship || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  emergencyContact: { ...formData.emergencyContact, relationship: e.target.value } as any
                })}
                disabled={dialogMode === 'view'}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    }
                  }
                }}
              />
            </Grid>
          </Grid>
        );
        
      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: theme.palette.primary.main }}>
              📋 Review Employee Information
            </Typography>
            
            <Grid container spacing={3}>
              {/* Basic Information Review */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, backgroundColor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
                    Basic Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><PersonIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Full Name" 
                        secondary={`${formData.profile?.firstName || ''} ${formData.profile?.lastName || ''}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><EmailIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Email" 
                        secondary={formData.email || 'Not provided'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><PhoneIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Phone" 
                        secondary={formData.profile?.phone || 'Not provided'}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              
              {/* Work Information Review */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, backgroundColor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.info.main }}>
                    Work Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><WorkIcon color="info" /></ListItemIcon>
                      <ListItemText 
                        primary="Department" 
                        secondary={formData.jobDetails?.department || 'Not selected'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><WorkIcon color="info" /></ListItemIcon>
                      <ListItemText 
                        primary="Position" 
                        secondary={formData.jobDetails?.designation || 'Not selected'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><WorkIcon color="info" /></ListItemIcon>
                      <ListItemText 
                        primary="Salary" 
                        secondary={formData.jobDetails?.salary?.basic ? `₹${formData.jobDetails.salary.basic}` : 'Not specified'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><WorkIcon color="info" /></ListItemIcon>
                      <ListItemText 
                        primary="Join Date" 
                        secondary={formData.jobDetails?.joiningDate || 'Not specified'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><WorkIcon color="info" /></ListItemIcon>
                      <ListItemText 
                        primary="Role & Status" 
                        secondary={`${formData.role || 'Employee'} - ${formData.status || 'Active'}`}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              
              {/* Additional Information Review */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, backgroundColor: alpha(theme.palette.success.main, 0.05), borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.success.main }}>
                    Additional Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><HomeIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Address" 
                        secondary={formData.profile?.address || 'Not provided'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><PhoneIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Emergency Contact" 
                        secondary={
                          formData.emergencyContact?.name 
                            ? `${formData.emergencyContact.name} (${formData.emergencyContact.relationship}) - ${formData.emergencyContact.phone}`
                            : 'Not provided'
                        }
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
        
      default:
        return null;
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchEmployees();
  };

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.profile?.firstName || ''} ${employee.profile?.lastName || ''}`;
    const matchesSearch = (
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesDepartment = !filterDepartment || employee.jobDetails?.department === filterDepartment;
    const matchesStatus = !filterStatus || employee.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'terminated': return 'error';
      default: return 'default';
    }
  };

  // Statistics
  const stats = {
    total: employees.length,
    active: employees.filter(emp => emp.status === 'active').length,
    inactive: employees.filter(emp => emp.status === 'inactive').length,
    terminated: employees.filter(emp => emp.status === 'terminated').length,
    departments: [...new Set(employees.map(emp => emp.jobDetails?.department).filter(Boolean))].length
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading...</Typography>
      </Box>
    );
  }

  // Show authentication error if not authenticated
  if (!isAuthenticated) {
    const handleTestLogin = async () => {
      try {
        const response = await api.post('/auth/login', {
          email: 'sanju.admin@gmail.com',
          password: 'admin123'
        });
        
        console.log('Login response:', response.data);
        
        if (response.data.success && response.data.data?.token) {
          localStorage.setItem('token', response.data.data.token);
          showNotification({ type: 'success', title: 'Login successful! Refreshing page...' });
          setTimeout(() => window.location.reload(), 1000);
        }
      } catch (error: any) {
        console.error('Login error:', error);
        showNotification({ 
          type: 'error', 
          title: 'Login failed', 
          message: error.response?.data?.message || 'Login failed' 
        });
      }
    };

    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">Authentication Required</Typography>
          <Typography>You need to be logged in to access employee management.</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Token in localStorage: {localStorage.getItem('token') ? 'Present' : 'Missing'}
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              onClick={() => window.location.href = '/login'}
            >
              Go to Login
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleTestLogin}
              color="secondary"
            >
              Quick Login (Admin)
            </Button>
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Debug Info */}
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          User: {user?.profile?.firstName} {user?.profile?.lastName} ({user?.role}) | 
          Employees loaded: {employees.length} | 
          Loading: {loading ? 'Yes' : 'No'}
        </Typography>
      </Alert>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Employee Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage all users in the system ({employees.length} total)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Refresh Employee Data">
              <IconButton 
                onClick={handleRefresh} 
                disabled={refreshing}
                sx={{ 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  }
                }}
              >
                {refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('add')}
              sx={{ 
                borderRadius: 3,
                px: 4,
                py: 1.5,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Add New Employee
            </Button>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`, color: 'white' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Employees
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`, color: 'white' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {stats.active}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Active
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`, color: 'white' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {stats.inactive}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Inactive
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`, color: 'white' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {stats.terminated}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Terminated
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`, color: 'white' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {stats.departments}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Departments
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filters */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  )
                }}
                sx={{ borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  label="Department"
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="terminated">Terminated</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setFilterDepartment('');
                  setFilterStatus('');
                }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Employee Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                  Employee
                </TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                  Contact
                </TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                  Department
                </TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                  Position
                </TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                  Join Date
                </TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((employee) => (
                  <TableRow 
                    key={employee._id} 
                    hover
                    sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          {(employee.profile?.firstName?.charAt(0) || '?')}{(employee.profile?.lastName?.charAt(0) || '?')}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {employee.profile?.firstName || 'N/A'} {employee.profile?.lastName || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {employee.employeeId || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <EmailIcon fontSize="small" color="action" />
                          {employee.email || 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PhoneIcon fontSize="small" color="action" />
                          {employee.profile?.phone || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={employee.jobDetails?.department || 'N/A'} 
                        size="small" 
                        variant="outlined"
                        sx={{ borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{employee.jobDetails?.designation || 'N/A'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                        color={getStatusColor(employee.status) as any}
                        size="small"
                        sx={{ borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {employee.jobDetails?.joiningDate ? new Date(employee.jobDetails.joiningDate).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenDialog('view', employee)}
                            sx={{ color: theme.palette.info.main }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Employee">
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenDialog('edit', employee)}
                            sx={{ color: theme.palette.warning.main }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Employee">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDelete(employee._id)}
                            sx={{ color: theme.palette.error.main }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredEmployees.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Multi-Step Employee Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 3,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            minHeight: '80vh'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: 'white',
            py: 3,
            px: 4,
            borderRadius: '12px 12px 0 0'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                {steps[activeStep]?.icon}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {dialogMode === 'add' ? 'Add New Employee' : 
                   dialogMode === 'edit' ? 'Edit Employee' : 'Employee Details'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Step {activeStep + 1} of {steps.length}: {steps[activeStep]?.description}
                </Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={handleCloseDialog}
              sx={{ 
                color: 'white', 
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.1)' 
                } 
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, backgroundColor: '#fafafa' }}>
          <Box sx={{ display: 'flex', height: '70vh' }}>
            {/* Left Sidebar - Stepper */}
            <Box sx={{ 
              width: 320,
              backgroundColor: 'white',
              borderRight: `1px solid ${theme.palette.divider}`,
              p: 3
            }}>
              {/* Profile Preview */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Avatar 
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    mx: 'auto', 
                    mb: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    fontSize: '1.5rem',
                    fontWeight: 600
                  }}
                >
                  {formData.profile?.firstName?.charAt(0) || 'N'}{formData.profile?.lastName?.charAt(0) || 'E'}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {formData.profile?.firstName || 'New'} {formData.profile?.lastName || 'Employee'}
                </Typography>
                <Chip 
                  label={formData.jobDetails?.department || 'No Department'} 
                  color="primary" 
                  size="small"
                  sx={{ borderRadius: 2 }}
                />
              </Box>

              {/* Vertical Stepper */}
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel 
                      onClick={() => handleStepClick(index)}
                      sx={{ 
                        cursor: dialogMode === 'view' ? 'default' : 'pointer',
                        '& .MuiStepLabel-label': {
                          fontWeight: index === activeStep ? 600 : 400,
                          color: index === activeStep ? theme.palette.primary.main : 'inherit'
                        }
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {step.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {step.description}
                        </Typography>
                      </Box>
                    </StepLabel>
                    <StepContent>
                      <Box sx={{ mt: 1, mb: 2 }}>
                        {index === activeStep && (
                          <Typography variant="body2" color="text.secondary">
                            {index === 0 && "Enter basic personal information and contact details."}
                            {index === 1 && "Provide work-related information and job details."}
                            {index === 2 && "Add address and emergency contact information."}
                            {index === 3 && "Review all information before saving."}
                          </Typography>
                        )}
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              {/* Progress Indicator */}
              <Box sx={{ mt: 4, p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.primary.main }}>
                  Progress: {Math.round(((activeStep + 1) / steps.length) * 100)}%
                </Typography>
                <Box sx={{ 
                  width: '100%', 
                  height: 8, 
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  borderRadius: 1,
                  overflow: 'hidden'
                }}>
                  <Box sx={{ 
                    width: `${((activeStep + 1) / steps.length) * 100}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    transition: 'width 0.3s ease'
                  }} />
                </Box>
              </Box>
            </Box>

            {/* Right Content - Form */}
            <Box sx={{ flex: 1, p: 4, overflowY: 'auto' }}>
              <Paper sx={{ 
                p: 4, 
                borderRadius: 3, 
                background: 'white',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                minHeight: '500px'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                    {steps[activeStep]?.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                      {steps[activeStep]?.label}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {steps[activeStep]?.description}
                    </Typography>
                  </Box>
                </Box>
                
                {/* Step Content */}
                <Box sx={{ mt: 3 }}>
                  {renderStepContent(activeStep)}
                </Box>
              </Paper>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions 
          sx={{ 
            p: 4, 
            backgroundColor: '#f8fafc',
            borderTop: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Step {activeStep + 1} of {steps.length}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              onClick={handleCloseDialog} 
              variant="outlined"
              size="large"
              sx={{ 
                borderRadius: 2,
                px: 4,
                borderColor: theme.palette.grey[400],
                color: theme.palette.text.primary,
                '&:hover': {
                  borderColor: theme.palette.grey[600],
                  backgroundColor: alpha(theme.palette.grey[400], 0.1)
                }
              }}
            >
              Cancel
            </Button>
            
            {dialogMode !== 'view' && (
              <>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                  size="large"
                  startIcon={<BackIcon />}
                  sx={{ 
                    borderRadius: 2,
                    px: 4,
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      borderColor: theme.palette.primary.dark,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1)
                    }
                  }}
                >
                  Back
                </Button>
                
                {activeStep === steps.length - 1 ? (
                  <Button 
                    onClick={handleSubmit} 
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    sx={{ 
                      borderRadius: 2,
                      px: 4,
                      background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
                        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                      }
                    }}
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
                  >
                    {isSubmitting ? 'Saving...' : (dialogMode === 'add' ? 'Create Employee' : 'Update Employee')}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNext}
                    variant="contained"
                    size="large"
                    sx={{ 
                      borderRadius: 2,
                      px: 4,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                      }
                    }}
                    endIcon={<NextIcon />}
                  >
                    Next
                  </Button>
                )}
              </>
            )}
          </Box>
        </DialogActions>
      </Dialog>

      {/* Floating Refresh Button */}
      <Fab
        color="primary"
        size="medium"
        onClick={handleRefresh}
        disabled={refreshing}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 24,
          zIndex: 1000
        }}
      >
        {refreshing ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
      </Fab>
    </Box>
  );
};

export default ProfessionalEmployeeManagement;