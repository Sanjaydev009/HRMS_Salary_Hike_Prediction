import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  Add,
  Edit,
  Visibility,
  Delete,
} from '@mui/icons-material';
import EmployeeForm from '../../components/employees/EmployeeForm';
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


// Use type reference for local use if needed
// type EmployeeReference = Employee;

const EmployeeList: React.FC = () => {
  // Mock data for demonstration
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company.com',
        phone: '+1-555-0123',
        dateOfBirth: dayjs('1990-01-15'),
        address: '123 Main St, New York, NY 10001',
        emergencyContact: {
          name: 'Jane Doe',
          phone: '+1-555-0124',
          relationship: 'Spouse',
        },
      },
      jobDetails: {
        employeeId: 'EMP001',
        department: 'Engineering',
        position: 'Senior',
        jobTitle: 'Software Developer',
        workLocation: 'Office',
        employmentType: 'Full-time',
        startDate: dayjs('2023-01-15'),
        reportingManager: 'Mike Johnson',
        workSchedule: 'Mon-Fri 9AM-5PM',
      },
      compensation: {
        baseSalary: 85000,
        currency: 'USD',
        payFrequency: 'Monthly',
        benefits: ['Health Insurance', '401k'],
      },
      role: 'employee',
      status: 'Active',
    },
    {
      id: '2',
      personalInfo: {
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@company.com',
        phone: '+1-555-0125',
        dateOfBirth: dayjs('1988-11-20'),
        address: '456 Oak Ave, Los Angeles, CA 90210',
        emergencyContact: {
          name: 'Robert Wilson',
          phone: '+1-555-0126',
          relationship: 'Brother',
        },
      },
      jobDetails: {
        employeeId: 'EMP002',
        department: 'Marketing',
        position: 'Manager',
        jobTitle: 'Marketing Manager',
        workLocation: 'Office',
        employmentType: 'Full-time',
        startDate: dayjs('2022-11-20'),
        reportingManager: 'Director Marketing',
        workSchedule: 'Mon-Fri 9AM-5PM',
      },
      compensation: {
        baseSalary: 95000,
        currency: 'USD',
        payFrequency: 'Monthly',
        benefits: ['Health Insurance', '401k', 'Stock Options'],
      },
      role: 'manager',
      status: 'Active',
    },
    {
      id: '3',
      personalInfo: {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@company.com',
        phone: '+1-555-0127',
        dateOfBirth: dayjs('1985-03-10'),
        address: '789 Pine St, Chicago, IL 60601',
        emergencyContact: {
          name: 'Lisa Johnson',
          phone: '+1-555-0128',
          relationship: 'Wife',
        },
      },
      jobDetails: {
        employeeId: 'EMP003',
        department: 'HR',
        position: 'Manager',
        jobTitle: 'HR Specialist',
        workLocation: 'Office',
        employmentType: 'Full-time',
        startDate: dayjs('2023-03-10'),
        reportingManager: 'HR Director',
        workSchedule: 'Mon-Fri 9AM-5PM',
      },
      compensation: {
        baseSalary: 78000,
        currency: 'USD',
        payFrequency: 'Monthly',
        benefits: ['Health Insurance', '401k'],
      },
      role: 'hr',
      status: 'Active',
    },
    {
      id: '4',
      personalInfo: {
        firstName: 'Emily',
        lastName: 'Brown',
        email: 'emily.brown@company.com',
        phone: '+1-555-0129',
        dateOfBirth: dayjs('1992-08-05'),
        address: '321 Elm St, Miami, FL 33101',
        emergencyContact: {
          name: 'David Brown',
          phone: '+1-555-0130',
          relationship: 'Father',
        },
      },
      jobDetails: {
        employeeId: 'EMP004',
        department: 'Finance',
        position: 'Mid-level',
        jobTitle: 'Financial Analyst',
        workLocation: 'Remote',
        employmentType: 'Full-time',
        startDate: dayjs('2022-08-05'),
        reportingManager: 'Finance Manager',
        workSchedule: 'Mon-Fri 9AM-5PM',
      },
      compensation: {
        baseSalary: 72000,
        currency: 'USD',
        payFrequency: 'Monthly',
        benefits: ['Health Insurance'],
      },
      role: 'employee',
      status: 'Inactive',
    },
  ]);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  
  // Mock current user role - in real app this would come from auth context
  const currentUserRole = 'hr'; // 'hr', 'admin', 'manager', 'employee'

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setFormMode('add');
    setFormOpen(true);
  };

  const handleViewEmployee = (id: string) => {
    const employee = employees.find(emp => emp.id === id);
    if (employee) {
      setSelectedEmployee(employee);
      setFormMode('view');
      setFormOpen(true);
    }
  };

  const handleEditEmployee = (id: string) => {
    const employee = employees.find(emp => emp.id === id);
    if (employee) {
      setSelectedEmployee(employee);
      setFormMode('edit');
      setFormOpen(true);
    }
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployeeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      setEmployees(prev => prev.filter(emp => emp.id !== employeeToDelete));
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleSaveEmployee = (employee: Employee) => {
    if (formMode === 'add') {
      const newEmployee = {
        ...employee,
        id: `emp_${Date.now()}`,
      };
      setEmployees(prev => [...prev, newEmployee]);
    } else if (formMode === 'edit' && selectedEmployee) {
      setEmployees(prev => 
        prev.map(emp => emp.id === selectedEmployee.id ? { ...employee, id: selectedEmployee.id } : emp)
      );
    }
    setFormOpen(false);
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'success' : 'default';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Employee Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddEmployee}
        >
          Add Employee
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary" gutterBottom>
        Manage all employees in your organization. HR can manage all employees while employees can view and update their own details.
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Job Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>
                        {employee.personalInfo.firstName.charAt(0).toUpperCase()}
                        {employee.personalInfo.lastName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {employee.personalInfo.firstName} {employee.personalInfo.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {employee.personalInfo.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{employee.jobDetails.department}</TableCell>
                  <TableCell>{employee.jobDetails.jobTitle}</TableCell>
                  <TableCell>
                    <Chip
                      label={employee.status}
                      color={getStatusColor(employee.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {employee.jobDetails.startDate?.format('YYYY-MM-DD') || 'N/A'}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewEmployee(employee.id)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleEditEmployee(employee.id)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteEmployee(employee.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Showing {employees.length} employees
        </Typography>
      </Box>

      {/* Employee Form Dialog */}
      <EmployeeForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveEmployee}
        employee={selectedEmployee}
        mode={formMode}
        currentUserRole={currentUserRole}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Employee Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this employee? This action cannot be undone.
            All employee data, including performance history and records, will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete Employee
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeList;
