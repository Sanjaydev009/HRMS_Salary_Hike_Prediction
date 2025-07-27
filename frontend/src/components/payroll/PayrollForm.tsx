import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider,
  Chip,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

interface PayrollFormProps {
  open: boolean;
  onClose: () => void;
}

interface Employee {
  id: string;
  name: string;
  department: string;
  baseSalary: number;
}

const PayrollForm: React.FC<PayrollFormProps> = ({
  open,
  onClose,
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [payPeriodStart, setPayPeriodStart] = useState<Dayjs>(dayjs().startOf('month'));
  const [payPeriodEnd, setPayPeriodEnd] = useState<Dayjs>(dayjs().endOf('month'));
  const [department, setDepartment] = useState('All');
  const [processing, setProcessing] = useState(false);

  // Mock employees data
  const employees: Employee[] = [
    { id: '1', name: 'John Doe', department: 'Engineering', baseSalary: 85000 },
    { id: '2', name: 'Sarah Wilson', department: 'Marketing', baseSalary: 95000 },
    { id: '3', name: 'Mike Johnson', department: 'HR', baseSalary: 78000 },
    { id: '4', name: 'Emily Brown', department: 'Finance', baseSalary: 72000 },
  ];

  const departments = ['All', 'Engineering', 'Marketing', 'HR', 'Finance'];

  // Filter employees by department
  const filteredEmployees = department === 'All' 
    ? employees 
    : employees.filter(emp => emp.department === department);

  const handleRunPayroll = async () => {
    setProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In real app, this would call the payroll processing API
    console.log('Running payroll for:', {
      employees: selectedEmployees,
      payPeriod: { start: payPeriodStart, end: payPeriodEnd },
      department,
    });
    
    setProcessing(false);
    onClose();
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
    }
  };

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const selectedEmployeeData = employees.filter(emp => selectedEmployees.includes(emp.id));
  const totalBaseSalary = selectedEmployeeData.reduce((sum, emp) => sum + emp.baseSalary, 0);
  const estimatedGrossPay = totalBaseSalary / 12; // Monthly gross pay

  const resetForm = () => {
    setSelectedEmployees([]);
    setPayPeriodStart(dayjs().startOf('month'));
    setPayPeriodEnd(dayjs().endOf('month'));
    setDepartment('All');
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Run Payroll
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Select employees and pay period to generate payroll. This will calculate salaries, 
              taxes, and deductions for the selected period.
            </Alert>

            <Grid container spacing={3}>
              {/* Pay Period */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Pay Period
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <DatePicker
                      label="Start Date"
                      value={payPeriodStart}
                      onChange={(date) => setPayPeriodStart(date || dayjs())}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <DatePicker
                      label="End Date"
                      value={payPeriodEnd}
                      onChange={(date) => setPayPeriodEnd(date || dayjs())}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* Employee Selection */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Select Employees
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Department</InputLabel>
                      <Select
                        value={department}
                        label="Department"
                        onChange={(e) => setDepartment(e.target.value)}
                      >
                        {departments.map((dept) => (
                          <MenuItem key={dept} value={dept}>
                            {dept}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleSelectAll}
                    >
                      {selectedEmployees.length === filteredEmployees.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </Box>
                </Box>

                <Grid container spacing={1}>
                  {filteredEmployees.map((employee) => (
                    <Grid item xs={12} sm={6} md={4} key={employee.id}>
                      <Box
                        sx={{
                          p: 2,
                          border: 1,
                          borderColor: selectedEmployees.includes(employee.id) ? 'primary.main' : 'divider',
                          borderRadius: 1,
                          cursor: 'pointer',
                          backgroundColor: selectedEmployees.includes(employee.id) ? 'primary.50' : 'background.paper',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                        onClick={() => handleEmployeeToggle(employee.id)}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          {employee.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {employee.department}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          ${employee.baseSalary.toLocaleString()}/year
                        </Typography>
                        {selectedEmployees.includes(employee.id) && (
                          <Chip 
                            label="Selected" 
                            color="primary" 
                            size="small" 
                            sx={{ mt: 1 }} 
                          />
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {/* Summary */}
              {selectedEmployees.length > 0 && (
                <>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Payroll Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Selected Employees
                        </Typography>
                        <Typography variant="h6">
                          {selectedEmployees.length}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Total Annual Salary
                        </Typography>
                        <Typography variant="h6">
                          ${totalBaseSalary.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Estimated Gross Pay
                        </Typography>
                        <Typography variant="h6">
                          ${estimatedGrossPay.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Pay Period Days
                        </Typography>
                        <Typography variant="h6">
                          {payPeriodEnd.diff(payPeriodStart, 'day') + 1}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={processing}>
            Cancel
          </Button>
          <Button 
            onClick={handleRunPayroll} 
            variant="contained"
            disabled={selectedEmployees.length === 0 || processing}
          >
            {processing ? 'Processing...' : `Run Payroll (${selectedEmployees.length} employees)`}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default PayrollForm;
