import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Avatar,
  Box,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

interface Employee {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: Dayjs | null;
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
    startDate: Dayjs | null;
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

interface EmployeeFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  employee?: Employee | null;
  mode: 'add' | 'edit' | 'view';
  currentUserRole: string;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  open,
  onClose,
  onSave,
  employee,
  mode,
  currentUserRole
}) => {
  const [formData, setFormData] = useState<Employee>({
    id: '',
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: null,
      address: '',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: '',
      },
    },
    jobDetails: {
      employeeId: '',
      department: '',
      position: '',
      jobTitle: '',
      workLocation: '',
      employmentType: 'Full-time',
      startDate: null,
      reportingManager: '',
      workSchedule: 'Mon-Fri 9AM-5PM',
    },
    compensation: {
      baseSalary: 0,
      currency: 'USD',
      payFrequency: 'Monthly',
      benefits: [],
    },
    role: 'employee',
    status: 'Active',
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    } else {
      // Reset form for new employee
      setFormData({
        id: '',
        personalInfo: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          dateOfBirth: null,
          address: '',
          emergencyContact: {
            name: '',
            phone: '',
            relationship: '',
          },
        },
        jobDetails: {
          employeeId: `EMP${Date.now()}`,
          department: '',
          position: '',
          jobTitle: '',
          workLocation: 'Office',
          employmentType: 'Full-time',
          startDate: dayjs(),
          reportingManager: '',
          workSchedule: 'Mon-Fri 9AM-5PM',
        },
        compensation: {
          baseSalary: 0,
          currency: 'USD',
          payFrequency: 'Monthly',
          benefits: [],
        },
        role: 'employee',
        status: 'Active',
      });
    }
  }, [employee, open]);

  const validateForm = () => {
    const newErrors: any = {};

    // Personal Info validation
    if (!formData.personalInfo.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.personalInfo.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.personalInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.personalInfo.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.personalInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    // Job Details validation
    if (!formData.jobDetails.department.trim()) {
      newErrors.department = 'Department is required';
    }
    if (!formData.jobDetails.position.trim()) {
      newErrors.position = 'Position is required';
    }
    if (!formData.jobDetails.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }

    // Compensation validation (HR/Admin only)
    if ((currentUserRole === 'hr' || currentUserRole === 'admin') && formData.compensation.baseSalary <= 0) {
      newErrors.baseSalary = 'Base salary must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const updatePersonalInfo = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  };

  const updateJobDetails = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      jobDetails: {
        ...prev.jobDetails,
        [field]: value,
      },
    }));
  };

  const updateCompensation = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      compensation: {
        ...prev.compensation,
        [field]: value,
      },
    }));
  };

  const updateEmergencyContact = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        emergencyContact: {
          ...prev.personalInfo.emergencyContact,
          [field]: value,
        },
      },
    }));
  };

  const isReadOnly = mode === 'view' || (currentUserRole === 'employee' && employee?.id !== 'current_user_id');

  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Support'];
  const positions = ['Junior', 'Mid-level', 'Senior', 'Lead', 'Manager', 'Director', 'VP', 'C-Level'];
  const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Intern'];
  const roles = ['employee', 'manager', 'hr', 'admin'];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {formData.personalInfo.firstName.charAt(0)}
              {formData.personalInfo.lastName.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {mode === 'add' ? 'Add New Employee' : mode === 'edit' ? 'Edit Employee' : 'Employee Details'}
              </Typography>
              {formData.jobDetails.employeeId && (
                <Typography variant="caption" color="text.secondary">
                  ID: {formData.jobDetails.employeeId}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Personal Information Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Personal Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.personalInfo.firstName}
                onChange={(e) => updatePersonalInfo('firstName', e.target.value)}
                error={!!errors.firstName}
                helperText={errors.firstName}
                disabled={isReadOnly}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.personalInfo.lastName}
                onChange={(e) => updatePersonalInfo('lastName', e.target.value)}
                error={!!errors.lastName}
                helperText={errors.lastName}
                disabled={isReadOnly}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.personalInfo.email}
                onChange={(e) => updatePersonalInfo('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                disabled={isReadOnly}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.personalInfo.phone}
                onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone}
                disabled={isReadOnly}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Date of Birth"
                value={formData.personalInfo.dateOfBirth}
                onChange={(value) => updatePersonalInfo('dateOfBirth', value)}
                disabled={isReadOnly}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={formData.personalInfo.address}
                onChange={(e) => updatePersonalInfo('address', e.target.value)}
                disabled={isReadOnly}
              />
            </Grid>

            {/* Emergency Contact */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Emergency Contact
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Contact Name"
                value={formData.personalInfo.emergencyContact.name}
                onChange={(e) => updateEmergencyContact('name', e.target.value)}
                disabled={isReadOnly}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={formData.personalInfo.emergencyContact.phone}
                onChange={(e) => updateEmergencyContact('phone', e.target.value)}
                disabled={isReadOnly}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Relationship"
                value={formData.personalInfo.emergencyContact.relationship}
                onChange={(e) => updateEmergencyContact('relationship', e.target.value)}
                disabled={isReadOnly}
              />
            </Grid>

            {/* Job Details Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 3, mb: 2, color: 'primary.main' }}>
                Job Details
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.department}>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.jobDetails.department}
                  label="Department"
                  onChange={(e) => updateJobDetails('department', e.target.value)}
                  disabled={isReadOnly}
                  required
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
                {errors.department && <FormHelperText>{errors.department}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.position}>
                <InputLabel>Position Level</InputLabel>
                <Select
                  value={formData.jobDetails.position}
                  label="Position Level"
                  onChange={(e) => updateJobDetails('position', e.target.value)}
                  disabled={isReadOnly}
                  required
                >
                  {positions.map((pos) => (
                    <MenuItem key={pos} value={pos}>
                      {pos}
                    </MenuItem>
                  ))}
                </Select>
                {errors.position && <FormHelperText>{errors.position}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Job Title"
                value={formData.jobDetails.jobTitle}
                onChange={(e) => updateJobDetails('jobTitle', e.target.value)}
                error={!!errors.jobTitle}
                helperText={errors.jobTitle}
                disabled={isReadOnly}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Employment Type</InputLabel>
                <Select
                  value={formData.jobDetails.employmentType}
                  label="Employment Type"
                  onChange={(e) => updateJobDetails('employmentType', e.target.value)}
                  disabled={isReadOnly}
                >
                  {employmentTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Start Date"
                value={formData.jobDetails.startDate}
                onChange={(value) => updateJobDetails('startDate', value)}
                disabled={isReadOnly}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Reporting Manager"
                value={formData.jobDetails.reportingManager}
                onChange={(e) => updateJobDetails('reportingManager', e.target.value)}
                disabled={isReadOnly}
              />
            </Grid>

            {/* Role and Status (HR/Admin only) */}
            {(currentUserRole === 'hr' || currentUserRole === 'admin') && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 3, mb: 2, color: 'primary.main' }}>
                    System Access
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={formData.role}
                      label="Role"
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      disabled={isReadOnly}
                    >
                      {roles.map((role) => (
                        <MenuItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      label="Status"
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      disabled={isReadOnly}
                    >
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                      <MenuItem value="On Leave">On Leave</MenuItem>
                      <MenuItem value="Terminated">Terminated</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Compensation Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 3, mb: 2, color: 'primary.main' }}>
                    Compensation
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Base Salary"
                    type="number"
                    value={formData.compensation.baseSalary}
                    onChange={(e) => updateCompensation('baseSalary', Number(e.target.value))}
                    error={!!errors.baseSalary}
                    helperText={errors.baseSalary}
                    disabled={isReadOnly}
                    InputProps={{
                      startAdornment: formData.compensation.currency === 'USD' ? '$' : '₹',
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Pay Frequency</InputLabel>
                    <Select
                      value={formData.compensation.payFrequency}
                      label="Pay Frequency"
                      onChange={(e) => updateCompensation('payFrequency', e.target.value)}
                      disabled={isReadOnly}
                    >
                      <MenuItem value="Monthly">Monthly</MenuItem>
                      <MenuItem value="Bi-weekly">Bi-weekly</MenuItem>
                      <MenuItem value="Weekly">Weekly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          {!isReadOnly && (
            <Button 
              onClick={handleSave} 
              variant="contained" 
              color="primary"
            >
              {mode === 'add' ? 'Add Employee' : 'Save Changes'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default EmployeeForm;
