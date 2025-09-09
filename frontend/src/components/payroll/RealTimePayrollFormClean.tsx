import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

// Utility function to format currency in INR
const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface Employee {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  basicSalary: number;
}

interface PayrollFormData {
  employeeId: string;
  payPeriod: {
    month: number;
    year: number;
  };
  basicSalary: number;
  allowances: {
    housing: number;
    transport: number;
    medical: number;
    other: number;
  };
  deductions: {
    tax: number;
    insurance: number;
    providentFund: number;
    other: number;
  };
  overtime: {
    hours: number;
    rate: number;
  };
  attendance: {
    workingDays: number;
    presentDays: number;
    halfDays: number;
    lateArrivals: number;
    earlyDepartures: number;
  };
}

interface PayrollFormProps {
  open: boolean;
  onClose: () => void;
  onSave?: (payrollData: any) => void;
  employeeId?: string;
}

const RealTimePayrollForm: React.FC<PayrollFormProps> = ({
  open,
  onClose,
  onSave,
  employeeId
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [fetchingAttendance, setFetchingAttendance] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<PayrollFormData>({
    employeeId: employeeId || '',
    payPeriod: {
      month: dayjs().month() + 1,
      year: dayjs().year()
    },
    basicSalary: 0,
    allowances: {
      housing: 0,
      transport: 0,
      medical: 0,
      other: 0
    },
    deductions: {
      tax: 0,
      insurance: 0,
      providentFund: 0,
      other: 0
    },
    overtime: {
      hours: 0,
      rate: 0
    },
    attendance: {
      workingDays: 22,
      presentDays: 22,
      halfDays: 0,
      lateArrivals: 0,
      earlyDepartures: 0
    }
  });

  // Fetch employees for dropdown
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employees', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }

      const data = await response.json();
      if (data.success && data.data && Array.isArray(data.data.employees)) {
        const employeeList = data.data.employees.map((emp: any) => ({
          _id: emp._id,
          employeeId: emp.employeeId,
          firstName: emp.profile?.firstName || '',
          lastName: emp.profile?.lastName || '',
          department: emp.jobDetails?.department || '',
          position: emp.jobDetails?.position || '',
          basicSalary: emp.jobDetails?.salary?.basic || 0
        }));
        setEmployees(employeeList);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  // Fetch real-time attendance data from database
  const fetchAttendanceData = async (employeeId: string, month: number, year: number) => {
    if (!employeeId || !month || !year) return;
    
    try {
      setFetchingAttendance(true);
      setError('');
      
      const response = await fetch(`/api/payroll/attendance/${employeeId}?month=${month}&year=${year}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch attendance data');
      }

      const data = await response.json();
      if (data.success && data.data) {
        const attendance = data.data.attendance;
        setAttendanceData(data.data);
        
        // Auto-populate attendance fields with real data from database
        setFormData(prev => ({
          ...prev,
          attendance: {
            workingDays: attendance.workingDays,
            presentDays: attendance.presentDays,
            halfDays: attendance.halfDays,
            lateArrivals: attendance.lateArrivals,
            earlyDepartures: attendance.earlyDepartures
          },
          overtime: {
            ...prev.overtime,
            hours: attendance.overtimeHours || 0
          }
        }));
        
        console.log('✅ Real-time attendance data loaded:', attendance);
      } else {
        throw new Error(data.message || 'Invalid attendance data received');
      }
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError(`Failed to load attendance data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setAttendanceData(null);
    } finally {
      setFetchingAttendance(false);
    }
  };

  // Calculate totals with attendance-based pro-ration
  const calculateTotals = () => {
    const attendanceRatio = formData.attendance.workingDays > 0 
      ? formData.attendance.presentDays / formData.attendance.workingDays 
      : 1;
    
    const proRatedBasicSalary = formData.basicSalary * attendanceRatio;
    const overtimePay = formData.overtime.hours * formData.overtime.rate;
    const totalAllowances = Object.values(formData.allowances).reduce((sum, val) => sum + val, 0);
    const totalDeductions = Object.values(formData.deductions).reduce((sum, val) => sum + val, 0);
    const grossSalary = proRatedBasicSalary + totalAllowances + overtimePay;
    const netSalary = grossSalary - totalDeductions;

    return {
      proRatedBasicSalary,
      attendanceRatio,
      overtimePay,
      totalAllowances,
      totalDeductions,
      grossSalary,
      netSalary
    };
  };

  // Save payroll data
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/payroll', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payroll record');
      }

      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        if (onSave) {
          onSave(data.data);
        }
        
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to save payroll');
      }
    } catch (err) {
      console.error('Error saving payroll:', err);
      setError(err instanceof Error ? err.message : 'Failed to save payroll');
    } finally {
      setSaving(false);
    }
  };

  // Load employees when dialog opens
  useEffect(() => {
    if (open) {
      fetchEmployees();
    }
  }, [open]);

  // Auto-fetch attendance data when employee or pay period changes
  useEffect(() => {
    if (open && formData.employeeId && formData.payPeriod.month && formData.payPeriod.year) {
      fetchAttendanceData(formData.employeeId, formData.payPeriod.month, formData.payPeriod.year);
    }
  }, [open, formData.employeeId, formData.payPeriod.month, formData.payPeriod.year]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        employeeId: employeeId || '',
        payPeriod: {
          month: dayjs().month() + 1,
          year: dayjs().year()
        },
        basicSalary: 0,
        allowances: {
          housing: 0,
          transport: 0,
          medical: 0,
          other: 0
        },
        deductions: {
          tax: 0,
          insurance: 0,
          providentFund: 0,
          other: 0
        },
        overtime: {
          hours: 0,
          rate: 0
        },
        attendance: {
          workingDays: 22,
          presentDays: 22,
          halfDays: 0,
          lateArrivals: 0,
          earlyDepartures: 0
        }
      });
      setError(null);
      setSuccess(false);
      setAttendanceData(null);
    }
  }, [open, employeeId]);

  // Auto-update basic salary when employee is selected
  useEffect(() => {
    if (formData.employeeId) {
      const selectedEmployee = employees.find(emp => emp._id === formData.employeeId);
      if (selectedEmployee && selectedEmployee.basicSalary > 0) {
        setFormData(prev => ({
          ...prev,
          basicSalary: selectedEmployee.basicSalary
        }));
      }
    }
  }, [formData.employeeId, employees]);

  const totals = calculateTotals();
  const selectedEmployee = employees.find(emp => emp._id === formData.employeeId);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            Create Payroll Record (Real-time Attendance)
          </Typography>
          {fetchingAttendance && (
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={16} />
              <Typography variant="caption" color="primary">
                Loading attendance...
              </Typography>
            </Box>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Payroll record created successfully!
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Employee Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Employee</InputLabel>
                <Select
                  value={formData.employeeId}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    employeeId: e.target.value
                  }))}
                  label="Employee"
                >
                  {employees.map((emp) => (
                    <MenuItem key={emp._id} value={emp._id}>
                      {emp.employeeId} - {emp.firstName} {emp.lastName} ({emp.department})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Pay Period */}
            <Grid item xs={12} md={3}>
              <TextField
                label="Month"
                type="number"
                value={formData.payPeriod.month}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  payPeriod: { ...prev.payPeriod, month: Number(e.target.value) }
                }))}
                inputProps={{ min: 1, max: 12 }}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="Year"
                type="number"
                value={formData.payPeriod.year}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  payPeriod: { ...prev.payPeriod, year: Number(e.target.value) }
                }))}
                inputProps={{ min: 2020, max: 2030 }}
                fullWidth
              />
            </Grid>

            {/* Real-time Attendance Display */}
            {attendanceData && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
                  <Typography variant="subtitle1" color="success.dark" gutterBottom>
                    📊 Real-time Attendance Data (from Database)
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6} sm={3}>
                      <Chip 
                        label={`Working Days: ${attendanceData.attendance.workingDays}`}
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Chip 
                        label={`Present: ${attendanceData.attendance.presentDays}`}
                        size="small" 
                        color="success" 
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Chip 
                        label={`Half Days: ${attendanceData.attendance.halfDays}`}
                        size="small" 
                        color="warning" 
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Chip 
                        label={`Attendance: ${attendanceData.attendance.attendancePercentage}%`}
                        size="small" 
                        color={attendanceData.attendance.attendancePercentage >= 90 ? 'success' : 
                               attendanceData.attendance.attendancePercentage >= 75 ? 'warning' : 'error'} 
                        variant="outlined"
                      />
                    </Grid>
                    {attendanceData.attendance.overtimeHours > 0 && (
                      <Grid item xs={6} sm={3}>
                        <Chip 
                          label={`Overtime: ${attendanceData.attendance.overtimeHours}h`}
                          size="small" 
                          color="info" 
                          variant="outlined"
                        />
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>
            )}

            {/* Basic Salary */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Basic Salary"
                type="number"
                value={formData.basicSalary}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  basicSalary: Number(e.target.value)
                }))}
                fullWidth
                helperText={`Pro-rated: ${formatINR(totals.proRatedBasicSalary)} (${Math.round(totals.attendanceRatio * 100)}% attendance)`}
              />
            </Grid>

            {/* Allowances */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'success.50' }}>
                <Typography variant="subtitle1" gutterBottom color="success.dark">
                  Allowances
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <TextField
                      label="Housing"
                      type="number"
                      value={formData.allowances.housing}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        allowances: { ...prev.allowances, housing: Number(e.target.value) }
                      }))}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField
                      label="Transport"
                      type="number"
                      value={formData.allowances.transport}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        allowances: { ...prev.allowances, transport: Number(e.target.value) }
                      }))}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField
                      label="Medical"
                      type="number"
                      value={formData.allowances.medical}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        allowances: { ...prev.allowances, medical: Number(e.target.value) }
                      }))}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField
                      label="Other"
                      type="number"
                      value={formData.allowances.other}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        allowances: { ...prev.allowances, other: Number(e.target.value) }
                      }))}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Deductions */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'error.50' }}>
                <Typography variant="subtitle1" gutterBottom color="error.dark">
                  Deductions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <TextField
                      label="Tax"
                      type="number"
                      value={formData.deductions.tax}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        deductions: { ...prev.deductions, tax: Number(e.target.value) }
                      }))}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField
                      label="Insurance"
                      type="number"
                      value={formData.deductions.insurance}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        deductions: { ...prev.deductions, insurance: Number(e.target.value) }
                      }))}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField
                      label="Provident Fund"
                      type="number"
                      value={formData.deductions.providentFund}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        deductions: { ...prev.deductions, providentFund: Number(e.target.value) }
                      }))}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField
                      label="Other"
                      type="number"
                      value={formData.deductions.other}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        deductions: { ...prev.deductions, other: Number(e.target.value) }
                      }))}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Overtime */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'warning.50' }}>
                <Typography variant="subtitle1" gutterBottom color="warning.dark">
                  Overtime
                  {attendanceData && attendanceData.attendance.overtimeHours > 0 && (
                    <Chip 
                      label={`Auto-detected: ${attendanceData.attendance.overtimeHours}h`}
                      size="small" 
                      color="info" 
                      sx={{ ml: 1 }}
                    />
                  )}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Overtime Hours"
                      type="number"
                      value={formData.overtime.hours}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        overtime: { ...prev.overtime, hours: Number(e.target.value) }
                      }))}
                      fullWidth
                      size="small"
                      InputProps={{
                        readOnly: !!attendanceData && attendanceData.attendance.overtimeHours > 0,
                      }}
                      helperText={attendanceData && attendanceData.attendance.overtimeHours > 0 ? 
                        "Auto-populated from attendance records" : ""}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Overtime Rate (per hour)"
                      type="number"
                      value={formData.overtime.rate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        overtime: { ...prev.overtime, rate: Number(e.target.value) }
                      }))}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Summary */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                <Typography variant="subtitle1" gutterBottom color="primary.dark">
                  Salary Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Pro-rated Basic Salary
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {formatINR(totals.proRatedBasicSalary)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({Math.round(totals.attendanceRatio * 100)}% attendance)
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Total Allowances
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {formatINR(totals.totalAllowances)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Total Deductions
                    </Typography>
                    <Typography variant="h6" color="error.main">
                      {formatINR(totals.totalDeductions)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Net Salary
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      {formatINR(totals.netSalary)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained" 
          disabled={saving || !formData.employeeId || !formData.basicSalary}
          startIcon={saving ? <CircularProgress size={20} /> : null}
        >
          {saving ? 'Creating...' : 'Run Payroll'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RealTimePayrollForm;
