import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  TextField,
  Alert,
  Skeleton,
  Fade,
} from '@mui/material';
import {
  Add,
  Visibility,
  Download,
  PlayArrow,
  Assessment,
  AccountBalance,
  TrendingUp,
  Calculate,
  Refresh,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
// Import components - will implement these later
// import PayrollForm from '../../components/payroll/PayrollForm';
// import PayslipViewer from '../../components/payroll/PayslipViewer';
// import SalaryCalculator from '../../components/payroll/SalaryCalculator';

// Temporary placeholder components
const PayrollForm: React.FC<any> = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose}>
    <div>Payroll Form - Implementation in progress</div>
  </Dialog>
);

const PayslipViewer: React.FC<any> = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose}>
    <div>Payslip Viewer - Implementation in progress</div>
  </Dialog>
);

const SalaryCalculator: React.FC<any> = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose}>
    <div>Salary Calculator - Implementation in progress</div>
  </Dialog>
);

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  payPeriod: {
    start: Dayjs;
    end: Dayjs;
  };
  baseSalary: number;
  allowances: {
    type: string;
    amount: number;
  }[];
  deductions: {
    type: string;
    amount: number;
  }[];
  grossPay: number;
  netPay: number;
  taxes: {
    federal: number;
    state: number;
    social: number;
  };
  status: 'Draft' | 'Processed' | 'Paid' | 'Cancelled';
  processedDate?: Dayjs;
  paidDate?: Dayjs;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`payroll-tabpanel-${index}`}
      aria-labelledby={`payroll-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const PayrollManagement: React.FC = () => {
  // State management
  const [tabValue, setTabValue] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState(dayjs().startOf('month'));
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [payrollFormOpen, setPayrollFormOpen] = useState(false);
  const [payslipViewerOpen, setPayslipViewerOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(null);
  
  // Data state
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [departments, setDepartments] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch payroll data from API
  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Replace with actual API endpoint
      const response = await fetch('/api/payroll', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch payroll data: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform API data to match our interface
      const transformedRecords = data.payrollRecords?.map((record: any) => ({
        ...record,
        payPeriod: {
          start: dayjs(record.payPeriod.start),
          end: dayjs(record.payPeriod.end),
        },
        processedDate: record.processedDate ? dayjs(record.processedDate) : undefined,
        paidDate: record.paidDate ? dayjs(record.paidDate) : undefined,
      })) || [];

      setPayrollRecords(transformedRecords);
      
      // Extract unique departments
      const uniqueDepartments = ['All', ...Array.from(new Set(transformedRecords.map((record: PayrollRecord) => record.department).filter(Boolean))) as string[]];
      setDepartments(uniqueDepartments);
      
    } catch (err) {
      console.error('Error fetching payroll data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load payroll data');
      
      // Fallback: Show empty state instead of hardcoded data
      setPayrollRecords([]);
      setDepartments(['All']);
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments from API
  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const deptList = ['All', ...data.departments];
        setDepartments(deptList);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchPayrollData();
    fetchDepartments();
  }, [selectedPeriod]);

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPayrollData();
    await fetchDepartments();
    setRefreshing(false);
  };

  // Process payroll API call
  const handleProcessPayroll = async (id: string) => {
    try {
      const response = await fetch(`/api/payroll/${id}/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to process payroll');
      }

      // Refresh data after processing
      await fetchPayrollData();
      
    } catch (err) {
      console.error('Error processing payroll:', err);
      setError(err instanceof Error ? err.message : 'Failed to process payroll');
    }
  };

  // Download payslip API call
  const handleDownloadPayslip = async (payroll: PayrollRecord) => {
    try {
      const response = await fetch(`/api/payroll/${payroll.id}/payslip`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download payslip');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payslip-${payroll.employeeName}-${payroll.payPeriod.start.format('YYYY-MM')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Error downloading payslip:', err);
      setError(err instanceof Error ? err.message : 'Failed to download payslip');
    }
  };

  // Calculate summary statistics
  const totalGrossPay = payrollRecords.reduce((sum, record) => sum + record.grossPay, 0);
  const totalNetPay = payrollRecords.reduce((sum, record) => sum + record.netPay, 0);
  const totalTaxes = payrollRecords.reduce((sum, record) => 
    sum + record.taxes.federal + record.taxes.state + record.taxes.social, 0
  );
  const pendingPayrolls = payrollRecords.filter(record => record.status === 'Draft' || record.status === 'Processed').length;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewPayslip = (payroll: PayrollRecord) => {
    setSelectedPayroll(payroll);
    setPayslipViewerOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Processed': return 'info';
      case 'Draft': return 'warning';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  // Filter records based on selected filters
  const filteredRecords = payrollRecords.filter(record => {
    const departmentMatch = selectedDepartment === 'All' || record.department === selectedDepartment;
    const periodMatch = record.payPeriod.start.isSame(selectedPeriod, 'month');
    return departmentMatch && periodMatch;
  });

  // Loading state
  if (loading) {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Skeleton variant="text" width={300} height={40} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="rectangular" width={140} height={36} />
              <Skeleton variant="rectangular" width={120} height={36} />
            </Box>
          </Box>

          {/* Summary Cards Skeleton */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={32} />
                    <Skeleton variant="text" width="50%" height={16} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Table Skeleton */}
          <Paper>
            <Box sx={{ p: 3 }}>
              <Skeleton variant="rectangular" width="100%" height={400} />
            </Box>
          </Paper>
        </Box>
      </LocalizationProvider>
    );
  }

  // Error state
  if (error) {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box>
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={handleRefresh}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '400px',
            gap: 2 
          }}>
            <Typography variant="h6" color="text.secondary">
              Unable to load payroll data
            </Typography>
            <Button variant="contained" onClick={handleRefresh} startIcon={<Refresh />}>
              Refresh Data
            </Button>
          </Box>
        </Box>
      </LocalizationProvider>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Fade in timeout={500}>
        <Box>
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
                Payroll Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage employee payroll, generate payslips, and track salary payments.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{ minWidth: { xs: 'auto', sm: 140 } }}
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Calculate />}
                onClick={() => setCalculatorOpen(true)}
                sx={{ minWidth: { xs: 'auto', sm: 140 } }}
              >
                Calculator
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setPayrollFormOpen(true)}
                sx={{ minWidth: { xs: 'auto', sm: 120 } }}
              >
                Run Payroll
              </Button>
            </Box>
          </Box>

          {/* Show alert if no data */}
          {!loading && payrollRecords.length === 0 && (
            <Alert severity="info" sx={{ mb: 3 }}>
              No payroll records found for the selected period. Click "Run Payroll" to generate new payroll records.
            </Alert>
          )}

          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Total Gross Pay</Typography>
                  </Box>
                  <Typography variant="h4" color="primary.main">
                    ${totalGrossPay.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedPeriod.format('MMMM YYYY')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="h6">Total Net Pay</Typography>
                  </Box>
                  <Typography variant="h4" color="success.main">
                    ${totalNetPay.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    After deductions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Assessment sx={{ mr: 1, color: 'warning.main' }} />
                    <Typography variant="h6">Total Taxes</Typography>
                  </Box>
                  <Typography variant="h4" color="warning.main">
                    ${totalTaxes.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Federal + State + Social
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PlayArrow sx={{ mr: 1, color: 'info.main' }} />
                    <Typography variant="h6">Pending Payrolls</Typography>
                  </Box>
                  <Typography variant="h4" color="info.main">
                    {pendingPayrolls}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Require processing
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <DatePicker
                label="Pay Period"
                value={selectedPeriod}
                onChange={(date) => setSelectedPeriod(date || dayjs())}
                views={['year', 'month']}
                renderInput={(params) => (
                  <TextField {...params} fullWidth size="small" />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  value={selectedDepartment}
                  label="Department"
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs */}
        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="payroll management tabs">
              <Tab label="Payroll Records" />
              <Tab label="Payroll Reports" />
            </Tabs>
          </Box>

          {/* Payroll Records Tab */}
          <TabPanel value={tabValue} index={0}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Pay Period</TableCell>
                    <TableCell align="right">Gross Pay</TableCell>
                    <TableCell align="right">Net Pay</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.employeeName}</TableCell>
                      <TableCell>{record.department}</TableCell>
                      <TableCell>
                        {record.payPeriod.start.format('MMM DD')} - {record.payPeriod.end.format('MMM DD, YYYY')}
                      </TableCell>
                      <TableCell align="right">
                        ${record.grossPay.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        ${record.netPay.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={record.status}
                          color={getStatusColor(record.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Payslip">
                          <IconButton
                            size="small"
                            onClick={() => handleViewPayslip(record)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download Payslip">
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadPayslip(record)}
                            disabled={record.status === 'Draft'}
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                        {record.status === 'Draft' && (
                          <Tooltip title="Process Payroll">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleProcessPayroll(record.id)}
                            >
                              <PlayArrow />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Reports Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Monthly Payroll Summary
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Employees: {filteredRecords.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Gross Pay: ${totalGrossPay.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Net Pay: ${totalNetPay.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Taxes: ${totalTaxes.toLocaleString()}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Department Breakdown
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {departments.filter(d => d !== 'All').map((dept) => {
                      const deptRecords = filteredRecords.filter(r => r.department === dept);
                      const deptTotal = deptRecords.reduce((sum, r) => sum + r.netPay, 0);
                      return deptRecords.length > 0 ? (
                        <Typography key={dept} variant="body2" color="text.secondary">
                          {dept}: ${deptTotal.toLocaleString()} ({deptRecords.length} employees)
                        </Typography>
                      ) : null;
                    })}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>

        {/* Dialogs */}
        <PayrollForm
          open={payrollFormOpen}
          onClose={() => setPayrollFormOpen(false)}
        />

        <PayslipViewer
          open={payslipViewerOpen}
          onClose={() => setPayslipViewerOpen(false)}
          payroll={selectedPayroll}
        />

        <SalaryCalculator
          open={calculatorOpen}
          onClose={() => setCalculatorOpen(false)}
        />
        </Box>
      </Fade>
    </LocalizationProvider>
  );
};

export default PayrollManagement;
