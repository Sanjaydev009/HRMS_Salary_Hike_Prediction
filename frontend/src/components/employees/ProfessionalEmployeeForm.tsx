import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Avatar,
  Card,
  CardContent,
  Divider,
  Chip,
  Alert,
  LinearProgress,
  IconButton,
  Stack,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  alpha,
  useTheme,
  Fade,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Work,
  Payment,
  Security,
  Close,
  PhotoCamera,
  ExpandMore,
  CheckCircle,
  Warning,
  Assignment,
  School,
  ContactPhone,
  LocationOn,
  Email,
  Phone,
  Business,
  CalendarToday,
  AccountBalance,
  Shield,
  VerifiedUser,
  Upload,
  Send,
  Preview,
  Add,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

interface Employee {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    middleName?: string;
    email: string;
    phone: string;
    alternatePhone?: string;
    dateOfBirth: Dayjs | null;
    gender: string;
    maritalStatus: string;
    nationality: string;
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
      address?: string;
    };
    profilePicture?: string;
  };
  identityDocuments: {
    passport?: { number: string; expiryDate: Dayjs | null; };
    nationalId?: { number: string; expiryDate: Dayjs | null; };
    drivingLicense?: { number: string; expiryDate: Dayjs | null; };
    socialSecurity?: string;
  };
  education: {
    degree: string;
    field: string;
    institution: string;
    graduationYear: number;
    gpa?: string;
    certifications: string[];
  };
  workExperience: {
    previousCompany?: string;
    previousRole?: string;
    experienceYears: number;
    lastSalary?: number;
    reasonForLeaving?: string;
    references: Array<{
      name: string;
      company: string;
      position: string;
      phone: string;
      email: string;
    }>;
  };
  jobDetails: {
    employeeId: string;
    department: string;
    position: string;
    jobTitle: string;
    workLocation: string;
    employmentType: string;
    startDate: Dayjs | null;
    probationPeriod: number;
    reportingManager: string;
    workSchedule: string;
    workMode: string; // Remote, Hybrid, On-site
    team?: string;
  };
  compensation: {
    baseSalary: number;
    currency: string;
    payFrequency: string;
    allowances: Array<{ type: string; amount: number; }>;
    benefits: string[];
    bonusEligible: boolean;
    salaryReviewDate: Dayjs | null;
  };
  systemAccess: {
    role: string;
    permissions: string[];
    systemsAccess: string[];
    equipmentNeeded: string[];
    accessCardRequired: boolean;
    parkingRequired: boolean;
  };
  onboardingTasks: Array<{
    id: string;
    title: string;
    description: string;
    assignedTo: string;
    dueDate: Dayjs | null;
    status: 'pending' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
  }>;
  status: string;
  createdAt: Dayjs;
  createdBy: string;
}

interface ProfessionalEmployeeFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  employee?: Employee | null;
  mode: 'add' | 'edit' | 'view';
  currentUserRole: string;
}

const steps = [
  { 
    label: 'Personal Information', 
    icon: <Person />,
    description: 'Basic personal details and contact information'
  },
  { 
    label: 'Identity & Documents', 
    icon: <VerifiedUser />,
    description: 'Identity verification and document upload'
  },
  { 
    label: 'Education & Experience', 
    icon: <School />,
    description: 'Educational background and work history'
  },
  { 
    label: 'Job Assignment', 
    icon: <Work />,
    description: 'Position details and work arrangements'
  },
  { 
    label: 'Compensation & Benefits', 
    icon: <Payment />,
    description: 'Salary, benefits, and financial details'
  },
  { 
    label: 'System Access & Security', 
    icon: <Security />,
    description: 'User roles, permissions, and access setup'
  },
  { 
    label: 'Onboarding Plan', 
    icon: <Assignment />,
    description: 'Tasks and timeline for new employee integration'
  },
  { 
    label: 'Review & Submit', 
    icon: <Preview />,
    description: 'Final review and confirmation'
  },
];

const ProfessionalEmployeeForm: React.FC<ProfessionalEmployeeFormProps> = ({
  open,
  onClose,
  onSave,
  employee,
  mode,
  currentUserRole
}) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<Employee>({
    id: '',
    personalInfo: {
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      phone: '',
      alternatePhone: '',
      dateOfBirth: null,
      gender: '',
      maritalStatus: '',
      nationality: 'Indian',
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
        address: '',
      },
      profilePicture: '',
    },
    identityDocuments: {
      passport: { number: '', expiryDate: null },
      nationalId: { number: '', expiryDate: null },
      drivingLicense: { number: '', expiryDate: null },
      socialSecurity: '',
    },
    education: {
      degree: '',
      field: '',
      institution: '',
      graduationYear: new Date().getFullYear(),
      gpa: '',
      certifications: [],
    },
    workExperience: {
      previousCompany: '',
      previousRole: '',
      experienceYears: 0,
      lastSalary: 0,
      reasonForLeaving: '',
      references: [],
    },
    jobDetails: {
      employeeId: `EMP${Date.now()}`,
      department: '',
      position: '',
      jobTitle: '',
      workLocation: '',
      employmentType: 'Full-time',
      startDate: dayjs().add(1, 'week'),
      probationPeriod: 90,
      reportingManager: '',
      workSchedule: 'Mon-Fri 9AM-5PM',
      workMode: 'On-site',
      team: '',
    },
    compensation: {
      baseSalary: 0,
      currency: 'INR',
      payFrequency: 'Monthly',
      allowances: [],
      benefits: [],
      bonusEligible: true,
      salaryReviewDate: dayjs().add(1, 'year'),
    },
    systemAccess: {
      role: 'employee',
      permissions: [],
      systemsAccess: [],
      equipmentNeeded: [],
      accessCardRequired: true,
      parkingRequired: false,
    },
    onboardingTasks: [
      {
        id: '1',
        title: 'Welcome & Orientation',
        description: 'Company introduction and basic orientation',
        assignedTo: 'HR Team',
        dueDate: dayjs().add(1, 'day'),
        status: 'pending',
        priority: 'high',
      },
      {
        id: '2',
        title: 'IT Setup',
        description: 'Laptop, accounts, and system access setup',
        assignedTo: 'IT Department',
        dueDate: dayjs().add(2, 'days'),
        status: 'pending',
        priority: 'high',
      },
      {
        id: '3',
        title: 'Department Introduction',
        description: 'Meet the team and understand department workflow',
        assignedTo: 'Department Manager',
        dueDate: dayjs().add(3, 'days'),
        status: 'pending',
        priority: 'medium',
      },
    ],
    status: 'Draft',
    createdAt: dayjs(),
    createdBy: currentUserRole,
  });

  const [errors, setErrors] = useState<any>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  // Remove uploaded file
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Drag and drop handlers
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    }
  }, [employee, open]);

  const validateStep = (stepIndex: number): boolean => {
    const newErrors: any = {};
    let isValid = true;

    switch (stepIndex) {
      case 0: // Personal Information
        if (!formData.personalInfo.firstName.trim()) {
          newErrors.firstName = 'First name is required';
          isValid = false;
        }
        if (!formData.personalInfo.lastName.trim()) {
          newErrors.lastName = 'Last name is required';
          isValid = false;
        }
        if (!formData.personalInfo.email.trim()) {
          newErrors.email = 'Email is required';
          isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.personalInfo.email)) {
          newErrors.email = 'Email is invalid';
          isValid = false;
        }
        if (!formData.personalInfo.phone.trim()) {
          newErrors.phone = 'Phone number is required';
          isValid = false;
        }
        if (!formData.personalInfo.address.street.trim()) {
          newErrors.street = 'Street address is required';
          isValid = false;
        }
        break;

      case 1: // Identity & Documents
        // Optional but recommended validations
        break;

      case 2: // Education & Experience
        if (!formData.education.degree.trim()) {
          newErrors.degree = 'Degree is required';
          isValid = false;
        }
        if (!formData.education.institution.trim()) {
          newErrors.institution = 'Institution is required';
          isValid = false;
        }
        break;

      case 3: // Job Assignment
        if (!formData.jobDetails.department.trim()) {
          newErrors.department = 'Department is required';
          isValid = false;
        }
        if (!formData.jobDetails.jobTitle.trim()) {
          newErrors.jobTitle = 'Job title is required';
          isValid = false;
        }
        if (!formData.jobDetails.workLocation.trim()) {
          newErrors.workLocation = 'Work location is required';
          isValid = false;
        }
        break;

      case 4: // Compensation
        if ((currentUserRole === 'hr' || currentUserRole === 'admin') && formData.compensation.baseSalary <= 0) {
          newErrors.baseSalary = 'Base salary must be greater than 0';
          isValid = false;
        }
        break;

      case 5: // System Access
        if (!formData.systemAccess.role) {
          newErrors.role = 'Role is required';
          isValid = false;
        }
        break;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setCompletedSteps(prev => new Set([...prev, activeStep]));
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepClick = (step: number) => {
    if (step < activeStep || completedSteps.has(step)) {
      setActiveStep(step);
    }
  };

  const handleSave = async () => {
    if (validateStep(activeStep)) {
      setSaving(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        onSave({ ...formData, status: 'Active' });
        onClose();
      } catch (error) {
        console.error('Error saving employee:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  const updateNestedField = (section: keyof Employee, subSection: string, field: string, value: any) => {
    setFormData(prev => {
      const sectionData = prev[section] as any;
      
      if (subSection) {
        // Handle nested subsection (e.g., personalInfo.address.street)
        return {
          ...prev,
          [section]: {
            ...sectionData,
            [subSection]: {
              ...sectionData[subSection],
              [field]: value,
            },
          },
        };
      } else {
        // Handle direct field update (e.g., personalInfo.firstName)
        return {
          ...prev,
          [section]: {
            ...sectionData,
            [field]: value,
          },
        };
      }
    });
  };

  const addReference = () => {
    setFormData(prev => ({
      ...prev,
      workExperience: {
        ...prev.workExperience,
        references: [
          ...prev.workExperience.references,
          { name: '', company: '', position: '', phone: '', email: '' },
        ],
      },
    }));
  };

  const addOnboardingTask = () => {
    const newTask = {
      id: Date.now().toString(),
      title: '',
      description: '',
      assignedTo: '',
      dueDate: dayjs().add(1, 'week'),
      status: 'pending' as const,
      priority: 'medium' as const,
    };
    setFormData(prev => ({
      ...prev,
      onboardingTasks: [...prev.onboardingTasks, newTask],
    }));
  };

  const isReadOnly = mode === 'view';
  const isLastStep = activeStep === steps.length - 1;
  const isStepCompleted = (step: number) => completedSteps.has(step);

  // Data options
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Support', 'Design', 'Product'];
  const positions = ['Intern', 'Junior', 'Mid-level', 'Senior', 'Lead', 'Manager', 'Director', 'VP', 'C-Level'];
  const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Intern', 'Consultant'];
  const workModes = ['On-site', 'Remote', 'Hybrid'];
  const roles = ['employee', 'manager', 'hr', 'admin'];
  const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];
  const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed', 'Other'];
  const relationshipTypes = ['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other'];
  
  // Additional dropdown options for required fields
  const countries = [
    'India', 'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France',
    'Japan', 'China', 'Brazil', 'Mexico', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Other'
  ];
  
  const educationDegrees = [
    'High School Diploma', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 
    'Doctoral Degree (PhD)', 'Professional Degree (JD, MD)', 'Certificate', 'Other'
  ];
  
  const educationFields = [
    'Computer Science', 'Information Technology', 'Engineering', 'Business Administration', 
    'Marketing', 'Finance', 'Accounting', 'Human Resources', 'Operations Management', 
    'Data Science', 'Design', 'Healthcare', 'Education', 'Law', 'Other'
  ];
  
  const currencies = ['INR', 'USD', 'EUR', 'GBP'];
  const payFrequencies = ['Weekly', 'Bi-weekly', 'Semi-monthly', 'Monthly', 'Annually'];

  const jobTitles = [
    'Software Engineer', 'Senior Software Engineer', 'Lead Software Engineer', 'Principal Software Engineer',
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer',
    'Product Manager', 'Senior Product Manager', 'Project Manager', 'Program Manager',
    'Data Scientist', 'Data Analyst', 'Business Analyst', 'System Analyst',
    'QA Engineer', 'QA Lead', 'Test Engineer', 'Automation Engineer',
    'UI/UX Designer', 'Graphic Designer', 'Technical Writer', 'Scrum Master',
    'Team Lead', 'Technical Lead', 'Engineering Manager', 'Department Head',
    'HR Manager', 'HR Specialist', 'Recruiter', 'Finance Manager',
    'Sales Manager', 'Marketing Manager', 'Customer Success Manager', 'Support Engineer',
    'Security Engineer', 'Database Administrator', 'System Administrator', 'Network Engineer'
  ];

  const workLocations = [
    'Remote', 'On-site', 'Hybrid',
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
    'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
    'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'San Francisco, CA',
    'Charlotte, NC', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Boston, MA',
    'Washington, DC', 'Nashville, TN', 'El Paso, TX', 'Detroit, MI', 'Oklahoma City, OK',
    'Portland, OR', 'Las Vegas, NV', 'Memphis, TN', 'Louisville, KY', 'Baltimore, MD',
    'Milwaukee, WI', 'Albuquerque, NM', 'Tucson, AZ', 'Fresno, CA', 'Mesa, AZ'
  ];

  const teams = [
    'Frontend Team', 'Backend Team', 'Full Stack Team', 'DevOps Team', 'QA Team',
    'Mobile Development Team', 'Data Science Team', 'Machine Learning Team', 'Analytics Team',
    'Product Management Team', 'Project Management Team', 'Design Team', 'UX/UI Team',
    'Marketing Team', 'Sales Team', 'Customer Success Team', 'Support Team',
    'HR Team', 'Finance Team', 'Legal Team', 'Security Team', 'Infrastructure Team',
    'Research & Development Team', 'Innovation Team', 'Platform Team', 'Architecture Team'
  ];

  const states = [
    // US States
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
    // Canadian Provinces
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
    'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
    'Quebec', 'Saskatchewan', 'Yukon',
    // Indian States
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
    'West Bengal', 'Delhi', 'Puducherry'
  ];

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Personal Information
        return (
          <Grid container spacing={3}>
            {/* Profile Picture Section */}
            <Grid item xs={12}>
              <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <IconButton
                        sx={{
                          bgcolor: 'white',
                          color: 'primary.main',
                          '&:hover': { bgcolor: 'grey.100' },
                        }}
                        size="small"
                      >
                        <PhotoCamera fontSize="small" />
                      </IconButton>
                    }
                  >
                    <Avatar
                      sx={{ width: 120, height: 120, mx: 'auto', border: '4px solid white' }}
                      src={formData.personalInfo.profilePicture || ''}
                    >
                      {formData.personalInfo.firstName.charAt(0)}
                      {formData.personalInfo.lastName.charAt(0)}
                    </Avatar>
                  </Badge>
                  <Typography variant="h5" sx={{ mt: 2, fontWeight: 600 }}>
                    {formData.personalInfo.firstName} {formData.personalInfo.lastName}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {formData.personalInfo.email || 'No email provided'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person color="primary" />
                Basic Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name *"
                value={formData.personalInfo.firstName}
                onChange={(e) => updateNestedField('personalInfo', '', 'firstName', e.target.value)}
                error={!!errors.firstName}
                helperText={errors.firstName}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name *"
                value={formData.personalInfo.lastName}
                onChange={(e) => updateNestedField('personalInfo', '', 'lastName', e.target.value)}
                error={!!errors.lastName}
                helperText={errors.lastName}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Middle Name"
                value={formData.personalInfo.middleName}
                onChange={(e) => updateNestedField('personalInfo', '', 'middleName', e.target.value)}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.personalInfo.gender}
                  label="Gender"
                  onChange={(e) => updateNestedField('personalInfo', '', 'gender', e.target.value)}
                  disabled={isReadOnly}
                >
                  {genders.map((gender) => (
                    <MenuItem key={gender} value={gender}>{gender}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Date of Birth"
                value={formData.personalInfo.dateOfBirth}
                onChange={(value) => updateNestedField('personalInfo', '', 'dateOfBirth', value)}
                disabled={isReadOnly}
                maxDate={dayjs().subtract(16, 'year')}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Marital Status</InputLabel>
                <Select
                  value={formData.personalInfo.maritalStatus}
                  label="Marital Status"
                  onChange={(e) => updateNestedField('personalInfo', '', 'maritalStatus', e.target.value)}
                  disabled={isReadOnly}
                >
                  {maritalStatuses.map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 4 }}>
                <ContactPhone color="primary" />
                Contact Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address *"
                type="email"
                value={formData.personalInfo.email}
                onChange={(e) => updateNestedField('personalInfo', '', 'email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                disabled={isReadOnly}
                InputProps={{
                  startAdornment: <Email color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number *"
                value={formData.personalInfo.phone}
                onChange={(e) => updateNestedField('personalInfo', '', 'phone', e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone}
                disabled={isReadOnly}
                InputProps={{
                  startAdornment: <Phone color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Alternate Phone"
                value={formData.personalInfo.alternatePhone}
                onChange={(e) => updateNestedField('personalInfo', '', 'alternatePhone', e.target.value)}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Nationality *</InputLabel>
                <Select
                  value={formData.personalInfo.nationality}
                  label="Nationality *"
                  onChange={(e) => updateNestedField('personalInfo', '', 'nationality', e.target.value)}
                  disabled={isReadOnly}
                  error={!!errors.nationality}
                >
                  {countries.map((country) => (
                    <MenuItem key={country} value={country}>{country}</MenuItem>
                  ))}
                </Select>
                {errors.nationality && (
                  <FormHelperText error>{errors.nationality}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Address Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 4 }}>
                <LocationOn color="primary" />
                Address Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address *"
                value={formData.personalInfo.address.street}
                onChange={(e) => updateNestedField('personalInfo', 'address', 'street', e.target.value)}
                error={!!errors.street}
                helperText={errors.street}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.personalInfo.address.city}
                onChange={(e) => updateNestedField('personalInfo', 'address', 'city', e.target.value)}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>State/Province</InputLabel>
                <Select
                  value={formData.personalInfo.address.state}
                  label="State/Province"
                  onChange={(e) => updateNestedField('personalInfo', 'address', 'state', e.target.value)}
                  disabled={isReadOnly}
                >
                  {states.map((state) => (
                    <MenuItem key={state} value={state}>{state}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ZIP/Postal Code"
                value={formData.personalInfo.address.zipCode}
                onChange={(e) => updateNestedField('personalInfo', 'address', 'zipCode', e.target.value)}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Country *</InputLabel>
                <Select
                  value={formData.personalInfo.address.country}
                  label="Country *"
                  onChange={(e) => updateNestedField('personalInfo', 'address', 'country', e.target.value)}
                  disabled={isReadOnly}
                  error={!!errors.country}
                >
                  {countries.map((country) => (
                    <MenuItem key={country} value={country}>{country}</MenuItem>
                  ))}
                </Select>
                {errors.country && (
                  <FormHelperText error>{errors.country}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Emergency Contact */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 4 }}>
                <Warning color="primary" />
                Emergency Contact
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Name"
                value={formData.personalInfo.emergencyContact.name}
                onChange={(e) => updateNestedField('personalInfo', 'emergencyContact', 'name', e.target.value)}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={formData.personalInfo.emergencyContact.phone}
                onChange={(e) => updateNestedField('personalInfo', 'emergencyContact', 'phone', e.target.value)}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Relationship</InputLabel>
                <Select
                  value={formData.personalInfo.emergencyContact.relationship}
                  label="Relationship"
                  onChange={(e) => updateNestedField('personalInfo', 'emergencyContact', 'relationship', e.target.value)}
                  disabled={isReadOnly}
                >
                  {relationshipTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Address"
                value={formData.personalInfo.emergencyContact.address}
                onChange={(e) => updateNestedField('personalInfo', 'emergencyContact', 'address', e.target.value)}
                disabled={isReadOnly}
              />
            </Grid>
          </Grid>
        );

      case 7: // Review & Submit
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Please review all information before submitting. Once submitted, the employee profile will be created and onboarding process will begin.
            </Alert>

            <Grid container spacing={3}>
              {/* Summary Cards */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Personal Information</Typography>
                    <Stack spacing={1}>
                      <Typography><strong>Name:</strong> {formData.personalInfo.firstName} {formData.personalInfo.lastName}</Typography>
                      <Typography><strong>Email:</strong> {formData.personalInfo.email}</Typography>
                      <Typography><strong>Phone:</strong> {formData.personalInfo.phone}</Typography>
                      <Typography><strong>Address:</strong> {formData.personalInfo.address.street}, {formData.personalInfo.address.city}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Job Assignment</Typography>
                    <Stack spacing={1}>
                      <Typography><strong>Employee ID:</strong> {formData.jobDetails.employeeId}</Typography>
                      <Typography><strong>Department:</strong> {formData.jobDetails.department}</Typography>
                      <Typography><strong>Position:</strong> {formData.jobDetails.jobTitle}</Typography>
                      <Typography><strong>Start Date:</strong> {formData.jobDetails.startDate?.format('MMM DD, YYYY')}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Compensation</Typography>
                    <Stack spacing={1}>
                      <Typography><strong>Base Salary:</strong> {formData.compensation.currency} {formData.compensation.baseSalary.toLocaleString()}</Typography>
                      <Typography><strong>Pay Frequency:</strong> {formData.compensation.payFrequency}</Typography>
                      <Typography><strong>Benefits:</strong> {formData.compensation.benefits.length} selected</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>System Access</Typography>
                    <Stack spacing={1}>
                      <Typography><strong>Role:</strong> {formData.systemAccess.role}</Typography>
                      <Typography><strong>Permissions:</strong> {formData.systemAccess.permissions.length} granted</Typography>
                      <Typography><strong>Access Card:</strong> {formData.systemAccess.accessCardRequired ? 'Required' : 'Not required'}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Onboarding Tasks ({formData.onboardingTasks.length})</Typography>
                    <List dense>
                      {formData.onboardingTasks.map((task, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Assignment color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={task.title}
                            secondary={`Assigned to: ${task.assignedTo} | Due: ${task.dueDate?.format('MMM DD, YYYY')}`}
                          />
                          <Chip
                            label={task.priority}
                            color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'default'}
                            size="small"
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.success.main, 0.1), border: `1px solid ${alpha(theme.palette.success.main, 0.3)}` }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" />
                    Ready to Submit
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    All required information has been provided. The employee profile will be created and the onboarding process will begin automatically upon submission.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      case 1: // Identity & Documents
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Please provide identity documents for verification. All information is securely stored and used only for employment purposes.
              </Alert>
            </Grid>

            {/* Document Upload Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assignment color="primary" />
                Identity Documents
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            {/* Passport */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1">Passport Information</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Passport Number"
                        value={formData.identityDocuments.passport?.number || ''}
                        onChange={(e) => updateNestedField('identityDocuments', 'passport', 'number', e.target.value)}
                        disabled={isReadOnly}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="Expiry Date"
                        value={formData.identityDocuments.passport?.expiryDate}
                        onChange={(value) => updateNestedField('identityDocuments', 'passport', 'expiryDate', value)}
                        disabled={isReadOnly}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* National ID */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1">National ID / SSN</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="National ID Number"
                        value={formData.identityDocuments.nationalId?.number || ''}
                        onChange={(e) => updateNestedField('identityDocuments', 'nationalId', 'number', e.target.value)}
                        disabled={isReadOnly}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Social Security Number"
                        value={formData.identityDocuments.socialSecurity || ''}
                        onChange={(e) => updateNestedField('identityDocuments', '', 'socialSecurity', e.target.value)}
                        disabled={isReadOnly}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Driving License */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1">Driving License</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="License Number"
                        value={formData.identityDocuments.drivingLicense?.number || ''}
                        onChange={(e) => updateNestedField('identityDocuments', 'drivingLicense', 'number', e.target.value)}
                        disabled={isReadOnly}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="Expiry Date"
                        value={formData.identityDocuments.drivingLicense?.expiryDate}
                        onChange={(value) => updateNestedField('identityDocuments', 'drivingLicense', 'expiryDate', value)}
                        disabled={isReadOnly}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Document Upload */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 4 }}>
                <Upload color="primary" />
                Document Upload
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <Card 
                sx={{ border: '2px dashed', borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Upload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Drag & Drop Documents
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Upload passport, ID, license, or other identity documents
                  </Typography>
                  
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id="file-upload-input"
                    disabled={isReadOnly}
                  />
                  
                  <Button 
                    variant="outlined" 
                    startIcon={<Upload />}
                    onClick={() => document.getElementById('file-upload-input')?.click()}
                    disabled={isReadOnly}
                  >
                    Choose Files
                  </Button>
                  
                  {/* Display uploaded files */}
                  {uploadedFiles.length > 0 && (
                    <Box sx={{ mt: 2, textAlign: 'left' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Uploaded Files:
                      </Typography>
                      {uploadedFiles.map((file, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                          <Typography variant="body2">{file.name}</Typography>
                          <Button 
                            size="small" 
                            color="error" 
                            onClick={() => removeFile(index)}
                            disabled={isReadOnly}
                          >
                            Remove
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 2: // Education & Experience
        return (
          <Grid container spacing={3}>
            {/* Education Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <School color="primary" />
                Educational Background
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Highest Degree *</InputLabel>
                <Select
                  value={formData.education.degree}
                  label="Highest Degree *"
                  onChange={(e) => updateNestedField('education', '', 'degree', e.target.value)}
                  error={!!errors.degree}
                  disabled={isReadOnly}
                >
                  {educationDegrees.map((degree) => (
                    <MenuItem key={degree} value={degree}>{degree}</MenuItem>
                  ))}
                </Select>
                {errors.degree && (
                  <FormHelperText error>{errors.degree}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Field of Study</InputLabel>
                <Select
                  value={formData.education.field}
                  label="Field of Study"
                  onChange={(e) => updateNestedField('education', '', 'field', e.target.value)}
                  disabled={isReadOnly}
                >
                  {educationFields.map((field) => (
                    <MenuItem key={field} value={field}>{field}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Institution *"
                value={formData.education.institution}
                onChange={(e) => updateNestedField('education', '', 'institution', e.target.value)}
                error={!!errors.institution}
                helperText={errors.institution}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Graduation Year"
                type="number"
                value={formData.education.graduationYear}
                onChange={(e) => updateNestedField('education', '', 'graduationYear', parseInt(e.target.value))}
                disabled={isReadOnly}
                inputProps={{ min: 1950, max: new Date().getFullYear() + 10 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="GPA (Optional)"
                value={formData.education.gpa}
                onChange={(e) => updateNestedField('education', '', 'gpa', e.target.value)}
                disabled={isReadOnly}
              />
            </Grid>

            {/* Work Experience Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 4 }}>
                <Work color="primary" />
                Work Experience
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Years of Experience"
                type="number"
                value={formData.workExperience.experienceYears}
                onChange={(e) => updateNestedField('workExperience', '', 'experienceYears', parseInt(e.target.value))}
                disabled={isReadOnly}
                inputProps={{ min: 0, max: 50 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Previous Company"
                value={formData.workExperience.previousCompany}
                onChange={(e) => updateNestedField('workExperience', '', 'previousCompany', e.target.value)}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Previous Role"
                value={formData.workExperience.previousRole}
                onChange={(e) => updateNestedField('workExperience', '', 'previousRole', e.target.value)}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Salary (Optional)"
                type="number"
                value={formData.workExperience.lastSalary}
                onChange={(e) => updateNestedField('workExperience', '', 'lastSalary', parseInt(e.target.value))}
                disabled={isReadOnly}
                InputProps={{
                  startAdornment: '$',
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason for Leaving"
                multiline
                rows={2}
                value={formData.workExperience.reasonForLeaving}
                onChange={(e) => updateNestedField('workExperience', '', 'reasonForLeaving', e.target.value)}
                disabled={isReadOnly}
              />
            </Grid>

            {/* References */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3, mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ContactPhone color="primary" />
                  Professional References
                </Typography>
                <Button
                  onClick={addReference}
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  disabled={isReadOnly}
                >
                  Add Reference
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            {formData.workExperience.references.map((reference, index) => (
              <Grid item xs={12} key={index}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Reference {index + 1}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Name"
                        value={reference.name}
                        onChange={(e) => {
                          const newReferences = [...formData.workExperience.references];
                          newReferences[index].name = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            workExperience: { ...prev.workExperience, references: newReferences }
                          }));
                        }}
                        disabled={isReadOnly}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Company"
                        value={reference.company}
                        onChange={(e) => {
                          const newReferences = [...formData.workExperience.references];
                          newReferences[index].company = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            workExperience: { ...prev.workExperience, references: newReferences }
                          }));
                        }}
                        disabled={isReadOnly}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Position"
                        value={reference.position}
                        onChange={(e) => {
                          const newReferences = [...formData.workExperience.references];
                          newReferences[index].position = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            workExperience: { ...prev.workExperience, references: newReferences }
                          }));
                        }}
                        disabled={isReadOnly}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={reference.phone}
                        onChange={(e) => {
                          const newReferences = [...formData.workExperience.references];
                          newReferences[index].phone = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            workExperience: { ...prev.workExperience, references: newReferences }
                          }));
                        }}
                        disabled={isReadOnly}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={reference.email}
                        onChange={(e) => {
                          const newReferences = [...formData.workExperience.references];
                          newReferences[index].email = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            workExperience: { ...prev.workExperience, references: newReferences }
                          }));
                        }}
                        disabled={isReadOnly}
                      />
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 3: // Job Assignment
        return (
          <Grid container spacing={3}>
            {/* Job Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Work color="primary" />
                Position Details
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Employee ID"
                value={formData.jobDetails.employeeId}
                onChange={(e) => updateNestedField('jobDetails', '', 'employeeId', e.target.value)}
                disabled={true}
                helperText="Auto-generated unique identifier"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.department}>
                <InputLabel>Department *</InputLabel>
                <Select
                  value={formData.jobDetails.department}
                  label="Department *"
                  onChange={(e) => updateNestedField('jobDetails', '', 'department', e.target.value)}
                  disabled={isReadOnly}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
                {errors.department && <FormHelperText>{errors.department}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Position Level</InputLabel>
                <Select
                  value={formData.jobDetails.position}
                  label="Position Level"
                  onChange={(e) => updateNestedField('jobDetails', '', 'position', e.target.value)}
                  disabled={isReadOnly}
                >
                  {positions.map((pos) => (
                    <MenuItem key={pos} value={pos}>{pos}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Job Title *</InputLabel>
                <Select
                  value={formData.jobDetails.jobTitle}
                  label="Job Title *"
                  onChange={(e) => updateNestedField('jobDetails', '', 'jobTitle', e.target.value)}
                  error={!!errors.jobTitle}
                  disabled={isReadOnly}
                >
                  {jobTitles.map((title) => (
                    <MenuItem key={title} value={title}>{title}</MenuItem>
                  ))}
                </Select>
                {errors.jobTitle && (
                  <FormHelperText error>{errors.jobTitle}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Team</InputLabel>
                <Select
                  value={formData.jobDetails.team}
                  label="Team"
                  onChange={(e) => updateNestedField('jobDetails', '', 'team', e.target.value)}
                  disabled={isReadOnly}
                >
                  {teams.map((team) => (
                    <MenuItem key={team} value={team}>{team}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Employment Type</InputLabel>
                <Select
                  value={formData.jobDetails.employmentType}
                  label="Employment Type"
                  onChange={(e) => updateNestedField('jobDetails', '', 'employmentType', e.target.value)}
                  disabled={isReadOnly}
                >
                  {employmentTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Work Arrangement */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 4 }}>
                <LocationOn color="primary" />
                Work Arrangement
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Work Location *</InputLabel>
                <Select
                  value={formData.jobDetails.workLocation}
                  label="Work Location *"
                  onChange={(e) => updateNestedField('jobDetails', '', 'workLocation', e.target.value)}
                  error={!!errors.workLocation}
                  disabled={isReadOnly}
                >
                  {workLocations.map((location) => (
                    <MenuItem key={location} value={location}>{location}</MenuItem>
                  ))}
                </Select>
                {errors.workLocation && (
                  <FormHelperText error>{errors.workLocation}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Work Mode</InputLabel>
                <Select
                  value={formData.jobDetails.workMode}
                  label="Work Mode"
                  onChange={(e) => updateNestedField('jobDetails', '', 'workMode', e.target.value)}
                  disabled={isReadOnly}
                >
                  {workModes.map((mode) => (
                    <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Work Schedule"
                value={formData.jobDetails.workSchedule}
                onChange={(e) => updateNestedField('jobDetails', '', 'workSchedule', e.target.value)}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Reporting Manager"
                value={formData.jobDetails.reportingManager}
                onChange={(e) => updateNestedField('jobDetails', '', 'reportingManager', e.target.value)}
                disabled={isReadOnly}
              />
            </Grid>

            {/* Employment Terms */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 4 }}>
                <CalendarToday color="primary" />
                Employment Terms
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Start Date"
                value={formData.jobDetails.startDate}
                onChange={(value) => updateNestedField('jobDetails', '', 'startDate', value)}
                disabled={isReadOnly}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Probation Period (Days)"
                type="number"
                value={formData.jobDetails.probationPeriod}
                onChange={(e) => updateNestedField('jobDetails', '', 'probationPeriod', parseInt(e.target.value))}
                disabled={isReadOnly}
                inputProps={{ min: 0, max: 365 }}
              />
            </Grid>
          </Grid>
        );

      case 4: // Compensation & Benefits
        return (
          <Grid container spacing={3}>
            {/* Salary Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Payment color="primary" />
                Compensation Package
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Base Salary *"
                type="number"
                value={formData.compensation.baseSalary}
                onChange={(e) => updateNestedField('compensation', '', 'baseSalary', parseFloat(e.target.value))}
                error={!!errors.baseSalary}
                helperText={errors.baseSalary}
                disabled={isReadOnly || (currentUserRole !== 'hr' && currentUserRole !== 'admin')}
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
                  onChange={(e) => updateNestedField('compensation', '', 'payFrequency', e.target.value)}
                  disabled={isReadOnly}
                >
                  {payFrequencies.map((frequency) => (
                    <MenuItem key={frequency} value={frequency}>{frequency}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={formData.compensation.currency}
                  label="Currency"
                  onChange={(e) => updateNestedField('compensation', '', 'currency', e.target.value)}
                  disabled={isReadOnly}
                >
                  {currencies.map((currency) => (
                    <MenuItem key={currency} value={currency}>{currency}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Next Salary Review"
                value={formData.compensation.salaryReviewDate}
                onChange={(value) => updateNestedField('compensation', '', 'salaryReviewDate', value)}
                disabled={isReadOnly}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>

            {/* Benefits */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 4 }}>
                <AccountBalance color="primary" />
                Benefits & Perks
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.compensation.bonusEligible}
                    onChange={(e) => updateNestedField('compensation', '', 'bonusEligible', e.target.checked)}
                    disabled={isReadOnly}
                  />
                }
                label="Eligible for Performance Bonus"
              />
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Select Benefits Package
                </Typography>
                <Grid container spacing={1}>
                  {[
                    'Health Insurance',
                    'Dental Insurance',
                    'Vision Insurance',
                    '401(k) Plan',
                    'Life Insurance',
                    'Disability Insurance',
                    'Flexible Spending Account',
                    'Paid Time Off',
                    'Sick Leave',
                    'Maternity/Paternity Leave',
                    'Professional Development',
                    'Gym Membership',
                    'Transportation Allowance',
                    'Meal Vouchers',
                    'Mobile Phone Allowance',
                    'Internet Allowance'
                  ].map((benefit) => (
                    <Grid item xs={12} sm={6} md={4} key={benefit}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.compensation.benefits.includes(benefit)}
                            onChange={(e) => {
                              const benefits = e.target.checked
                                ? [...formData.compensation.benefits, benefit]
                                : formData.compensation.benefits.filter(b => b !== benefit);
                              updateNestedField('compensation', '', 'benefits', benefits);
                            }}
                            disabled={isReadOnly}
                            size="small"
                          />
                        }
                        label={<Typography variant="body2">{benefit}</Typography>}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Grid>
          </Grid>
        );

      case 5: // System Access & Security
        return (
          <Grid container spacing={3}>
            {/* System Role */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security color="primary" />
                System Access & Permissions
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.role}>
                <InputLabel>System Role *</InputLabel>
                <Select
                  value={formData.systemAccess.role}
                  label="System Role *"
                  onChange={(e) => updateNestedField('systemAccess', '', 'role', e.target.value)}
                  disabled={isReadOnly || currentUserRole !== 'admin'}
                >
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
                {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Access Requirements */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 4 }}>
                <Shield color="primary" />
                Physical Access Requirements
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.systemAccess.accessCardRequired}
                    onChange={(e) => updateNestedField('systemAccess', '', 'accessCardRequired', e.target.checked)}
                    disabled={isReadOnly}
                  />
                }
                label="Access Card Required"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.systemAccess.parkingRequired}
                    onChange={(e) => updateNestedField('systemAccess', '', 'parkingRequired', e.target.checked)}
                    disabled={isReadOnly}
                  />
                }
                label="Parking Space Required"
              />
            </Grid>

            {/* Equipment Needed */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 4 }}>
                <Business color="primary" />
                Equipment & Resources
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Select Required Equipment
                </Typography>
                <Grid container spacing={1}>
                  {[
                    'Laptop',
                    'Desktop Computer',
                    'Monitor (External)',
                    'Keyboard & Mouse',
                    'Headset',
                    'Webcam',
                    'Mobile Phone',
                    'Tablet',
                    'Printer Access',
                    'VPN Access',
                    'Software Licenses',
                    'Development Tools'
                  ].map((equipment) => (
                    <Grid item xs={12} sm={6} md={4} key={equipment}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.systemAccess.equipmentNeeded.includes(equipment)}
                            onChange={(e) => {
                              const equipmentList = e.target.checked
                                ? [...formData.systemAccess.equipmentNeeded, equipment]
                                : formData.systemAccess.equipmentNeeded.filter(eq => eq !== equipment);
                              updateNestedField('systemAccess', '', 'equipmentNeeded', equipmentList);
                            }}
                            disabled={isReadOnly}
                            size="small"
                          />
                        }
                        label={<Typography variant="body2">{equipment}</Typography>}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Grid>
          </Grid>
        );

      case 6: // Onboarding Plan
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Assignment color="primary" />
                  Onboarding Timeline & Tasks
                </Typography>
                <Button
                  onClick={addOnboardingTask}
                  variant="outlined"
                  startIcon={<Add />}
                  disabled={isReadOnly}
                >
                  Add Task
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            {formData.onboardingTasks.map((task, index) => (
              <Grid item xs={12} key={task.id}>
                <Card sx={{ p: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Task Title"
                        value={task.title}
                        onChange={(e) => {
                          const newTasks = [...formData.onboardingTasks];
                          newTasks[index].title = e.target.value;
                          setFormData(prev => ({ ...prev, onboardingTasks: newTasks }));
                        }}
                        disabled={isReadOnly}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Assigned To"
                        value={task.assignedTo}
                        onChange={(e) => {
                          const newTasks = [...formData.onboardingTasks];
                          newTasks[index].assignedTo = e.target.value;
                          setFormData(prev => ({ ...prev, onboardingTasks: newTasks }));
                        }}
                        disabled={isReadOnly}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={2}
                        value={task.description}
                        onChange={(e) => {
                          const newTasks = [...formData.onboardingTasks];
                          newTasks[index].description = e.target.value;
                          setFormData(prev => ({ ...prev, onboardingTasks: newTasks }));
                        }}
                        disabled={isReadOnly}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <DatePicker
                        label="Due Date"
                        value={task.dueDate}
                        onChange={(value) => {
                          const newTasks = [...formData.onboardingTasks];
                          newTasks[index].dueDate = value;
                          setFormData(prev => ({ ...prev, onboardingTasks: newTasks }));
                        }}
                        disabled={isReadOnly}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel>Priority</InputLabel>
                        <Select
                          value={task.priority}
                          label="Priority"
                          onChange={(e) => {
                            const newTasks = [...formData.onboardingTasks];
                            newTasks[index].priority = e.target.value as 'low' | 'medium' | 'high';
                            setFormData(prev => ({ ...prev, onboardingTasks: newTasks }));
                          }}
                          disabled={isReadOnly}
                        >
                          <MenuItem value="low">Low</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="high">High</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={task.status}
                          label="Status"
                          onChange={(e) => {
                            const newTasks = [...formData.onboardingTasks];
                            newTasks[index].status = e.target.value as 'pending' | 'in-progress' | 'completed';
                            setFormData(prev => ({ ...prev, onboardingTasks: newTasks }));
                          }}
                          disabled={isReadOnly}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="in-progress">In Progress</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Alert severity="info">
                These tasks will be automatically assigned to the respective teams and will appear in their dashboards once the employee is created.
              </Alert>
            </Grid>
          </Grid>
        );
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            height: '90vh',
            maxHeight: '90vh',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {mode === 'add' ? 'Add New Employee' : mode === 'edit' ? 'Edit Employee' : 'Employee Profile'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Professional employee onboarding process
              </Typography>
            </Box>
            <IconButton
              onClick={onClose}
              sx={{
                color: 'white',
                bgcolor: alpha('#ffffff', 0.1),
                '&:hover': { bgcolor: alpha('#ffffff', 0.2) },
              }}
            >
              <Close />
            </IconButton>
          </Stack>

          {/* Progress */}
          <Box sx={{ mt: 3 }}>
            <LinearProgress
              variant="determinate"
              value={(activeStep / (steps.length - 1)) * 100}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha('#ffffff', 0.2),
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#ffffff',
                  borderRadius: 3,
                },
              }}
            />
            <Typography variant="caption" sx={{ mt: 1, opacity: 0.9 }}>
              Step {activeStep + 1} of {steps.length} • {Math.round((activeStep / (steps.length - 1)) * 100)}% Complete
            </Typography>
          </Box>
        </Box>

        {/* Stepper */}
        <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.label} completed={isStepCompleted(index)}>
                <StepLabel
                  onClick={() => handleStepClick(index)}
                  sx={{
                    cursor: index < activeStep || completedSteps.has(index) ? 'pointer' : 'default',
                    '& .MuiStepLabel-label': {
                      fontSize: '0.8rem',
                      fontWeight: activeStep === index ? 600 : 400,
                    },
                  }}
                  icon={
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: isStepCompleted(index) 
                          ? 'success.main' 
                          : activeStep === index 
                            ? 'primary.main' 
                            : 'grey.300',
                        color: 'white',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {isStepCompleted(index) ? (
                        <CheckCircle fontSize="small" />
                      ) : (
                        React.cloneElement(step.icon, { fontSize: 'small' })
                      )}
                    </Box>
                  }
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Content */}
        <DialogContent sx={{ p: 0, flex: 1, overflow: 'auto' }}>
          <Box sx={{ p: 4 }}>
            <Fade in key={activeStep}>
              <Box>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom fontWeight={600}>
                    {steps[activeStep].label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {steps[activeStep].description}
                  </Typography>
                </Box>
                
                {renderStepContent(activeStep)}
              </Box>
            </Fade>
          </Box>
        </DialogContent>

        {/* Actions */}
        <Box
          sx={{
            p: 3,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'grey.50',
          }}
        >
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<div style={{ transform: 'rotate(180deg)' }}>→</div>}
            >
              Back
            </Button>
            
            <Stack direction="row" spacing={2}>
              <Button onClick={onClose} color="inherit">
                Cancel
              </Button>
              
              {isLastStep ? (
                <Button
                  onClick={handleSave}
                  variant="contained"
                  size="large"
                  startIcon={saving ? <CircularProgress size={20} /> : <Send />}
                  disabled={saving || isReadOnly}
                  sx={{
                    minWidth: 140,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  {saving ? 'Creating...' : 'Create Employee'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  size="large"
                  endIcon={<span>→</span>}
                  sx={{
                    minWidth: 100,
                  }}
                >
                  Next
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ProfessionalEmployeeForm;
