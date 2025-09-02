import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
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
  Paper,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Alert,
  Fab,
  CircularProgress,
  Stack,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import ProfessionalAddEmployeeDialog from '../hr/ProfessionalAddEmployeeDialog';
import EditEmployeeDialog from '../hr/EditEmployeeDialog';

interface Employee {
  _id: string;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
    address?: string;
  };
  email: string;
  jobDetails: {
    department: string;
    designation: string;
    employmentType: string;
    salary: {
      basic: number;
      allowances?: number;
      currency?: string;
    };
    workLocation?: string;
  };
  role: string;
  joiningDate: string;
  status: 'active' | 'inactive';
  avatar?: string;
  employeeId: string;
}

const HREmployeeManagement: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [addingEmployee, setAddingEmployee] = useState(false);

  // Statistics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const departments = [...new Set(employees.map(emp => emp.jobDetails?.department).filter(Boolean))].length;
  const avgSalary = employees.length > 0 
    ? Math.round(employees.reduce((sum, emp) => {
        const salary = emp.jobDetails?.salary?.basic || 0;
        const allowances = emp.jobDetails?.salary?.allowances || 0;
        return sum + salary + allowances;
      }, 0) / employees.length)
    : 0;

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/employees', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result); // Debug log
        
        if (result.success && result.data && result.data.employees) {
          // Ensure employeeId is always a string
          setEmployees(result.data.employees.map((emp: any) => ({
            ...emp,
            employeeId: emp.employeeId ?? '',
          })));
        } else {
          console.error('Unexpected API response structure:', result);
          setEmployees([]);
        }
      } else {
        console.error('API request failed:', response.status, response.statusText);
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (employeeData: any) => {
    setAddingEmployee(true);
    try {
      console.log('Adding employee with data:', employeeData); // Debug log
      
      showInfo('Adding Employee', 'Creating new employee account...');
      
      const response = await fetch('http://localhost:5001/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          employeeId: employeeData.jobDetails.employeeId,
          email: employeeData.personalInfo.email,
          password: employeeData.systemAccess.password,
          role: employeeData.systemAccess.role,
          profile: {
            firstName: employeeData.personalInfo.firstName,
            lastName: employeeData.personalInfo.lastName,
            phone: employeeData.personalInfo.phone,
            dateOfBirth: employeeData.personalInfo.dateOfBirth?.format('YYYY-MM-DD'),
            address: employeeData.personalInfo.address,
          },
          jobDetails: {
            department: employeeData.jobDetails.department,
            designation: employeeData.jobDetails.designation,
            employmentType: employeeData.jobDetails.employmentType,
            joiningDate: employeeData.jobDetails.joiningDate?.format('YYYY-MM-DD'),
            workLocation: employeeData.jobDetails.workLocation,
            reportingManager: employeeData.jobDetails.reportingManager,
            salary: {
              basic: employeeData.jobDetails.salary,
              allowances: 0,
              currency: 'INR'
            }
          },
          emergencyContact: employeeData.personalInfo.emergencyContact,
          status: 'active'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Add employee response:', result); // Debug log
        
        if (result.success && result.data && result.data.employee) {
          setEmployees(prev => [...prev, result.data.employee]);
          setAddDialogOpen(false);
          showSuccess(
            'Employee Added Successfully!', 
            `${employeeData.personalInfo.firstName} ${employeeData.personalInfo.lastName} has been added to the system.`
          );
        }
      } else {
        const errorResult = await response.json();
        console.error('Failed to add employee:', errorResult);
        showError('Failed to Add Employee', errorResult.message || 'Unknown error occurred');
        throw new Error(errorResult.message || 'Failed to add employee');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      showError('Add Employee Error', 'Failed to add employee. Please try again.');
    } finally {
      setAddingEmployee(false);
    }
  };

  const handleActionClick = (event: React.MouseEvent<HTMLElement>, employee: Employee) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedEmployee(employee);
  };

  const handleActionClose = () => {
    setActionMenuAnchor(null);
    setSelectedEmployee(null);
  };

  const handleEditEmployee = () => {
    if (selectedEmployee) {
      setEditDialogOpen(true);
    }
    handleActionClose();
  };

  const handleSendEmail = async () => {
    if (selectedEmployee) {
      try {
        showInfo('Sending Email', 'Password reset email is being sent...');
        
        const response = await fetch('http://localhost:5001/api/auth/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: selectedEmployee.email }),
        });

        if (response.ok) {
          showSuccess(
            'Email Sent Successfully!', 
            `Password reset email has been sent to ${selectedEmployee.profile?.firstName} ${selectedEmployee.profile?.lastName} at ${selectedEmployee.email}`
          );
        } else {
          const errorData = await response.json();
          showError('Failed to Send Email', errorData.message || 'Unknown error occurred');
        }
      } catch (error) {
        console.error('Error sending email:', error);
        showError('Email Error', 'Failed to send email. Please check your connection and try again.');
      }
    }
    handleActionClose();
  };

  const handleDeleteEmployee = async () => {
    if (selectedEmployee) {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete ${selectedEmployee.profile?.firstName} ${selectedEmployee.profile?.lastName}? This action cannot be undone.`
      );
      
      if (confirmDelete) {
        try {
          showInfo('Deleting Employee', 'Employee is being removed from the system...');
          
          const response = await fetch(`http://localhost:5001/api/employees/${selectedEmployee._id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });

          if (response.ok) {
            // Remove employee from local state
            setEmployees(prev => prev.filter(emp => emp._id !== selectedEmployee._id));
            showSuccess(
              'Employee Deleted Successfully!', 
              `${selectedEmployee.profile?.firstName} ${selectedEmployee.profile?.lastName} has been removed from the system.`
            );
          } else {
            const errorData = await response.json();
            showError('Delete Failed', errorData.message || 'Failed to delete employee');
          }
        } catch (error) {
          console.error('Error deleting employee:', error);
          showError('Delete Error', 'Failed to delete employee. Please try again.');
        }
      }
    }
    handleActionClose();
  };

  const handleEmployeeUpdated = (updatedEmployee: Employee) => {
    setEmployees(prev => 
      prev.map(emp => emp._id === updatedEmployee._id ? updatedEmployee : emp)
    );
    setEditDialogOpen(false);
    showSuccess(
      'Employee Updated!', 
      `${updatedEmployee.profile?.firstName} ${updatedEmployee.profile?.lastName}'s information has been updated successfully.`
    );
  };

  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.profile?.firstName || ''} ${employee.profile?.lastName || ''}`;
    const department = employee.jobDetails?.department || '';
    const designation = employee.jobDetails?.designation || '';
    
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           department.toLowerCase().includes(searchTerm.toLowerCase()) ||
           designation.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getDepartmentColor = (department: string) => {
    const colors = {
      'Engineering': '#2196F3',
      'Human Resources': '#4CAF50',
      'Finance': '#FF9800',
      'Marketing': '#E91E63',
      'Sales': '#9C27B0',
      'Operations': '#00BCD4',
    };
    return colors[department as keyof typeof colors] || '#757575';
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card 
      elevation={0}
      sx={{ 
        border: `1px solid ${alpha(color, 0.2)}`,
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${alpha(color, 0.3)}`,
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Box sx={{ 
            p: 2, 
            borderRadius: 2, 
            background: alpha(color, 0.1),
            color 
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
          Employee Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your organization's workforce efficiently
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Employees"
            value={totalEmployees}
            icon={<PeopleIcon fontSize="large" />}
            color="#2196F3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Employees"
            value={activeEmployees}
            icon={<PersonAddIcon fontSize="large" />}
            color="#4CAF50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Departments"
            value={departments}
            icon={<BusinessIcon fontSize="large" />}
            color="#FF9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Salary"
            value={`₹${avgSalary.toLocaleString('en-IN')}`}
            icon={<TrendingUpIcon fontSize="large" />}
            color="#9C27B0"
          />
        </Grid>
      </Grid>

      {/* Actions Bar */}
      <Card elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
          >
            <TextField
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
            
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                sx={{ textTransform: 'none' }}
              >
                Filter
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                sx={{ textTransform: 'none' }}
              >
                Export
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddDialogOpen(true)}
                sx={{
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  }
                }}
              >
                Add Employee
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Designation</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Salary</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow 
                    key={employee._id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: alpha(theme.palette.primary.main, 0.02) 
                      } 
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={employee.avatar}
                          sx={{ 
                            width: 40, 
                            height: 40,
                            background: `linear-gradient(135deg, ${getDepartmentColor(employee.jobDetails?.department || '')} 0%, ${alpha(getDepartmentColor(employee.jobDetails?.department || ''), 0.7)} 100%)`
                          }}
                        >
                          {(employee.profile?.firstName?.[0] || '?')}{(employee.profile?.lastName?.[0] || '')}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {employee.profile?.firstName || 'N/A'} {employee.profile?.lastName || ''}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID: {employee.employeeId || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={employee.jobDetails?.department || 'N/A'}
                        size="small"
                        sx={{
                          backgroundColor: alpha(getDepartmentColor(employee.jobDetails?.department || ''), 0.1),
                          color: getDepartmentColor(employee.jobDetails?.department || ''),
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WorkIcon fontSize="small" color="action" />
                        <Typography variant="body2">{employee.jobDetails?.designation || 'N/A'}</Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2">{employee.email}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">{employee.profile?.phone || 'N/A'}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        ₹{((employee.jobDetails?.salary?.basic || 0) + (employee.jobDetails?.salary?.allowances || 0)).toLocaleString('en-IN')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        per annum
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={employee.status}
                        size="small"
                        color={employee.status === 'active' ? 'success' : 'default'}
                        variant={employee.status === 'active' ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleActionClick(e, employee)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredEmployees.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No employees found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? 'Try adjusting your search criteria' : 'Start by adding your first employee'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionClose}
      >
        <MenuItem onClick={handleEditEmployee}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Employee
        </MenuItem>
        <MenuItem onClick={handleSendEmail}>
          <EmailIcon fontSize="small" sx={{ mr: 1 }} />
          Send Password Reset Email
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteEmployee} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Employee
        </MenuItem>
      </Menu>

      {/* Add Employee Dialog */}
      <ProfessionalAddEmployeeDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSubmit={handleAddEmployee}
        loading={addingEmployee}
      />

      {/* Edit Employee Dialog */}
      <EditEmployeeDialog
        open={editDialogOpen}
        employee={selectedEmployee}
        onClose={() => setEditDialogOpen(false)}
        onUpdate={handleEmployeeUpdated}
      />

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="add employee"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' },
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
        onClick={() => setAddDialogOpen(true)}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default HREmployeeManagement;
