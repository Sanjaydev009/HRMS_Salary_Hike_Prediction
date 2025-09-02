import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Avatar,
  IconButton,
  Card,
  CardContent,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Alert,
  InputAdornment,
  Chip,
  Stack,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  PhotoCamera,
  Person,
  Work,
  Payment,
  Security,
  Check,
  Email,
  Phone,
  LocationOn,
  Business,
  CalendarToday,
  Refresh,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

interface NewEmployee {
  // Personal Information
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: Dayjs | null;
    gender: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  // Job Details
  jobDetails: {
    employeeId: string;
    department: string;
    designation: string;
    employmentType: string;
    joiningDate: Dayjs | null;
    workLocation: string;
    reportingManager: string;
    salary: number;
  };
  // System Access
  systemAccess: {
    role: string;
    password: string;
  };
}

interface ProfessionalAddEmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (employee: NewEmployee) => void;
  loading?: boolean;
}

const ProfessionalAddEmployeeDialog: React.FC<ProfessionalAddEmployeeDialogProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Function to generate unique employee ID
  const generateEmployeeId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `EMP${timestamp.toString().slice(-6)}${random.toString().padStart(3, '0')}`;
  };

  // Initialize form data with proper default values
  const initializeFormData = (): NewEmployee => ({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: null,
      gender: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
      },
      emergencyContact: {
        name: '',
        phone: '',
        relationship: '',
      },
    },
    jobDetails: {
      employeeId: generateEmployeeId(),
      department: '',
      designation: '',
      employmentType: 'full-time',
      joiningDate: dayjs(),
      workLocation: '',
      reportingManager: '',
      salary: 0,
    },
    systemAccess: {
      role: 'employee',
      password: '',
    },
  });
  
  const [formData, setFormData] = useState<NewEmployee>(initializeFormData());

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      const newFormData = initializeFormData();
      setFormData(newFormData);
      setActiveStep(0);
      setErrors({});
      console.log('Dialog opened, generated new employee ID:', newFormData.jobDetails.employeeId);
    }
  }, [open]);

  const steps = [
    { label: 'Personal Details', icon: <Person /> },
    { label: 'Job Information', icon: <Work /> },
    { label: 'System Access', icon: <Security /> },
    { label: 'Review & Submit', icon: <Check /> },
  ];

  // Dropdown options
  const departments = [
    'Engineering', 'Human Resources', 'Finance', 'Marketing', 
    'Sales', 'Operations', 'Customer Support', 'Legal', 'IT Support'
  ];

  const designations = [
    'Software Engineer', 'Senior Software Engineer', 'Tech Lead', 'Engineering Manager',
    'HR Executive', 'HR Manager', 'Finance Analyst', 'Accountant', 'Finance Manager',
    'Marketing Executive', 'Digital Marketing Specialist', 'Marketing Manager',
    'Sales Executive', 'Sales Manager', 'Business Development Manager',
    'Operations Executive', 'Operations Manager', 'Customer Support Executive',
    'Legal Counsel', 'IT Support Specialist', 'System Administrator'
  ];

  const employmentTypes = ['full-time', 'part-time', 'contract', 'internship'];
  
  // Function to display employment type in user-friendly format
  const formatEmploymentType = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-');
  };
  
  const workLocations = [
    'Bangalore Office', 'Mumbai Office', 'Delhi Office', 'Chennai Office', 
    'Hyderabad Office', 'Pune Office', 'Remote', 'Hybrid'
  ];

  const relationships = ['Spouse', 'Parent', 'Sibling', 'Friend', 'Other'];
  const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];
  const roles = ['employee', 'hr', 'admin'];
  
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh', 'Puducherry'
  ];

  const handleInputChange = (section: keyof NewEmployee, field: string, value: any) => {
    console.log(`Updating ${section}.${field}:`, value); // Debug log
    
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    
    // Clear error when user starts typing
    if (errors[`${section}.${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`${section}.${field}`]: '',
      }));
    }
  };

  const handleNestedInputChange = (section: keyof NewEmployee, parentField: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parentField]: {
          ...(prev[section] as any)[parentField],
          [field]: value,
        },
      },
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Personal Details
        if (!formData.personalInfo.firstName) newErrors['personalInfo.firstName'] = 'First name is required';
        if (!formData.personalInfo.lastName) newErrors['personalInfo.lastName'] = 'Last name is required';
        if (!formData.personalInfo.email) newErrors['personalInfo.email'] = 'Email is required';
        if (!formData.personalInfo.phone) newErrors['personalInfo.phone'] = 'Phone is required';
        if (!formData.personalInfo.dateOfBirth) newErrors['personalInfo.dateOfBirth'] = 'Date of birth is required';
        break;
      case 1: // Job Information
        if (!formData.jobDetails.department) newErrors['jobDetails.department'] = 'Department is required';
        if (!formData.jobDetails.designation) newErrors['jobDetails.designation'] = 'Designation is required';
        if (!formData.jobDetails.workLocation) newErrors['jobDetails.workLocation'] = 'Work location is required';
        if (!formData.jobDetails.salary || formData.jobDetails.salary <= 0) newErrors['jobDetails.salary'] = 'Valid salary is required';
        break;
      case 2: // System Access
        if (!formData.systemAccess.password) newErrors['systemAccess.password'] = 'Password is required';
        if (formData.systemAccess.password.length < 6) newErrors['systemAccess.password'] = 'Password must be at least 6 characters';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    if (validateStep(activeStep)) {
      console.log('Submitting form data:', formData); // Debug log
      onSubmit(formData);
    } else {
      console.log('Form validation failed:', errors); // Debug log
    }
  };

  const handleClose = () => {
    setFormData(initializeFormData());
    setActiveStep(0);
    setErrors({});
    onClose();
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    handleInputChange('systemAccess', 'password', password);
  };

  const renderPersonalDetails = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person color="primary" />
          Personal Information
        </Typography>
        <Divider sx={{ mb: 3 }} />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="First Name"
          value={formData.personalInfo.firstName}
          onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
          error={!!errors['personalInfo.firstName']}
          helperText={errors['personalInfo.firstName']}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Person /></InputAdornment>
          }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Last Name"
          value={formData.personalInfo.lastName}
          onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
          error={!!errors['personalInfo.lastName']}
          helperText={errors['personalInfo.lastName']}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={formData.personalInfo.email}
          onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
          error={!!errors['personalInfo.email']}
          helperText={errors['personalInfo.email']}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Email /></InputAdornment>
          }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Phone Number"
          value={formData.personalInfo.phone}
          onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
          error={!!errors['personalInfo.phone']}
          helperText={errors['personalInfo.phone']}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Phone /></InputAdornment>
          }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date of Birth"
            value={formData.personalInfo.dateOfBirth}
            onChange={(date) => handleInputChange('personalInfo', 'dateOfBirth', date)}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                error={!!errors['personalInfo.dateOfBirth']}
                helperText={errors['personalInfo.dateOfBirth']}
              />
            )}
          />
        </LocalizationProvider>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Gender</InputLabel>
          <Select
            value={formData.personalInfo.gender}
            label="Gender"
            onChange={(e) => handleInputChange('personalInfo', 'gender', e.target.value)}
          >
            {genders.map((gender) => (
              <MenuItem key={gender} value={gender}>{gender}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          Address Information
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Street Address"
          value={formData.personalInfo.address.street}
          onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'street', e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>
          }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="City"
          value={formData.personalInfo.address.city}
          onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'city', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>State</InputLabel>
          <Select
            value={formData.personalInfo.address.state}
            label="State"
            onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'state', e.target.value)}
          >
            {indianStates.map((state) => (
              <MenuItem key={state} value={state}>{state}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          Emergency Contact
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Emergency Contact Name"
          value={formData.personalInfo.emergencyContact.name}
          onChange={(e) => handleNestedInputChange('personalInfo', 'emergencyContact', 'name', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Emergency Contact Phone"
          value={formData.personalInfo.emergencyContact.phone}
          onChange={(e) => handleNestedInputChange('personalInfo', 'emergencyContact', 'phone', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Relationship</InputLabel>
          <Select
            value={formData.personalInfo.emergencyContact.relationship}
            label="Relationship"
            onChange={(e) => handleNestedInputChange('personalInfo', 'emergencyContact', 'relationship', e.target.value)}
          >
            {relationships.map((relationship) => (
              <MenuItem key={relationship} value={relationship}>{relationship}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

  const renderJobDetails = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Work color="primary" />
          Job Information
        </Typography>
        <Divider sx={{ mb: 3 }} />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Employee ID"
          value={formData.jobDetails.employeeId}
          InputProps={{
            readOnly: true,
            startAdornment: <InputAdornment position="start"><Business /></InputAdornment>,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  onClick={() => {
                    const newId = generateEmployeeId();
                    handleInputChange('jobDetails', 'employeeId', newId);
                    console.log('Generated new employee ID:', newId);
                  }}
                  size="small"
                  title="Generate new ID"
                >
                  <Refresh />
                </IconButton>
              </InputAdornment>
            )
          }}
          helperText="Auto-generated unique ID (click refresh to generate new)"
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors['jobDetails.department']}>
          <InputLabel>Department</InputLabel>
          <Select
            value={formData.jobDetails.department}
            label="Department"
            onChange={(e) => handleInputChange('jobDetails', 'department', e.target.value)}
          >
            {departments.map((dept) => (
              <MenuItem key={dept} value={dept}>{dept}</MenuItem>
            ))}
          </Select>
          {errors['jobDetails.department'] && (
            <Typography variant="caption" color="error" sx={{ ml: 2 }}>
              {errors['jobDetails.department']}
            </Typography>
          )}
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors['jobDetails.designation']}>
          <InputLabel>Designation</InputLabel>
          <Select
            value={formData.jobDetails.designation}
            label="Designation"
            onChange={(e) => handleInputChange('jobDetails', 'designation', e.target.value)}
          >
            {designations.map((designation) => (
              <MenuItem key={designation} value={designation}>{designation}</MenuItem>
            ))}
          </Select>
          {errors['jobDetails.designation'] && (
            <Typography variant="caption" color="error" sx={{ ml: 2 }}>
              {errors['jobDetails.designation']}
            </Typography>
          )}
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Employment Type</InputLabel>
          <Select
            value={formData.jobDetails.employmentType}
            label="Employment Type"
            onChange={(e) => handleInputChange('jobDetails', 'employmentType', e.target.value)}
          >
            {employmentTypes.map((type) => (
              <MenuItem key={type} value={type}>{formatEmploymentType(type)}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Joining Date"
            value={formData.jobDetails.joiningDate}
            onChange={(date) => handleInputChange('jobDetails', 'joiningDate', date)}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <InputAdornment position="start"><CalendarToday /></InputAdornment>
                }}
              />
            )}
          />
        </LocalizationProvider>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors['jobDetails.workLocation']}>
          <InputLabel>Work Location</InputLabel>
          <Select
            value={formData.jobDetails.workLocation}
            label="Work Location"
            onChange={(e) => handleInputChange('jobDetails', 'workLocation', e.target.value)}
          >
            {workLocations.map((location) => (
              <MenuItem key={location} value={location}>{location}</MenuItem>
            ))}
          </Select>
          {errors['jobDetails.workLocation'] && (
            <Typography variant="caption" color="error" sx={{ ml: 2 }}>
              {errors['jobDetails.workLocation']}
            </Typography>
          )}
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Reporting Manager (Optional)"
          value={formData.jobDetails.reportingManager}
          onChange={(e) => handleInputChange('jobDetails', 'reportingManager', e.target.value)}
          placeholder="Enter manager's name (will be linked later)"
          helperText="Leave empty if no direct manager"
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Annual Salary (₹)"
          type="number"
          value={formData.jobDetails.salary}
          onChange={(e) => handleInputChange('jobDetails', 'salary', parseInt(e.target.value) || 0)}
          error={!!errors['jobDetails.salary']}
          helperText={errors['jobDetails.salary']}
          InputProps={{
            startAdornment: <InputAdornment position="start">₹</InputAdornment>
          }}
        />
      </Grid>
    </Grid>
  );

  const renderSystemAccess = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security color="primary" />
          System Access & Security
        </Typography>
        <Divider sx={{ mb: 3 }} />
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>System Role</InputLabel>
          <Select
            value={formData.systemAccess.role}
            label="System Role"
            onChange={(e) => handleInputChange('systemAccess', 'role', e.target.value)}
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
        <TextField
          fullWidth
          label="Temporary Password"
          type="password"
          value={formData.systemAccess.password}
          onChange={(e) => handleInputChange('systemAccess', 'password', e.target.value)}
          error={!!errors['systemAccess.password']}
          helperText={errors['systemAccess.password'] || 'Employee will be required to change this on first login'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  size="small"
                  onClick={generatePassword}
                  sx={{ textTransform: 'none' }}
                >
                  Generate
                </Button>
              </InputAdornment>
            )
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <Alert severity="info">
          <Typography variant="body2">
            • The employee will receive login credentials via email<br />
            • They must change the password on first login<br />
            • System access will be activated on the joining date
          </Typography>
        </Alert>
      </Grid>
    </Grid>
  );

  const renderReview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Review Employee Information
        </Typography>
        <Divider sx={{ mb: 3 }} />
      </Grid>

      {/* Personal Info Summary */}
      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom color="primary">
              Personal Information
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>Name:</strong> {formData.personalInfo.firstName} {formData.personalInfo.lastName}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {formData.personalInfo.email}
              </Typography>
              <Typography variant="body2">
                <strong>Phone:</strong> {formData.personalInfo.phone}
              </Typography>
              <Typography variant="body2">
                <strong>Emergency Contact:</strong> {formData.personalInfo.emergencyContact.name} ({formData.personalInfo.emergencyContact.relationship})
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Job Info Summary */}
      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom color="primary">
              Job Information
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>Employee ID:</strong> {formData.jobDetails.employeeId}
              </Typography>
              <Typography variant="body2">
                <strong>Department:</strong> {formData.jobDetails.department}
              </Typography>
              <Typography variant="body2">
                <strong>Designation:</strong> {formData.jobDetails.designation}
              </Typography>
              <Typography variant="body2">
                <strong>Employment Type:</strong> {formatEmploymentType(formData.jobDetails.employmentType)}
              </Typography>
              <Typography variant="body2">
                <strong>Location:</strong> {formData.jobDetails.workLocation}
              </Typography>
              <Typography variant="body2">
                <strong>Salary:</strong> ₹{formData.jobDetails.salary.toLocaleString('en-IN')}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Alert severity="success">
          <Typography variant="body2">
            All information looks good! Click "Add Employee" to create the employee record.
          </Typography>
        </Alert>
      </Grid>
    </Grid>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderPersonalDetails();
      case 1:
        return renderJobDetails();
      case 2:
        return renderSystemAccess();
      case 3:
        return renderReview();
      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle sx={{ 
        pb: 2, 
        pr: 6,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <Typography variant="h5" component="div">
          Add New Employee
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
          Create a comprehensive employee profile with all necessary information
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ px: 3, py: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel icon={step.icon}>
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent sx={{ px: 3, pb: 0 }}>
        <Box sx={{ mt: 2 }}>
          {renderStepContent()}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          color="inherit"
        >
          Cancel
        </Button>
        
        <Box sx={{ flex: 1 }} />
        
        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
        )}
        
        {activeStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            variant="contained"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              minWidth: 120,
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Add Employee'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProfessionalAddEmployeeDialog;
