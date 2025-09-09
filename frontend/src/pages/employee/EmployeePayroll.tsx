import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Download,
  ExpandMore,
  AccountBalance,
  TrendingUp,
  Receipt,
  AttachMoney,
  Refresh,
  Visibility,
} from '@mui/icons-material';
import api from '../../services/api';

interface PayrollRecord {
  _id: string;
  payPeriod: {
    month: number;
    year: number;
  };
  basicSalary: number;
  calculations: {
    grossSalary: number;
    netSalary: number;
    totalAllowances: number;
    totalDeductions: number;
  };
  allowances: {
    housing: number;
    transport: number;
    medical: number;
    food: number;
    bonus: number;
    overtime: number;
    other: number;
  };
  deductions: {
    tax: number;
    socialSecurity: number;
    insurance: number;
    providentFund: number;
    loan: number;
    advance: number;
    other: number;
  };
  attendance: {
    workingDays: number;
    presentDays: number;
    absentDays: number;
    halfDays: number;
    overtimeHours: number;
    lateArrivals: number;
    earlyDepartures: number;
  };
  paymentDetails: {
    status: 'pending' | 'paid' | 'failed' | 'processed';
    paymentDate?: string;
    paymentMethod: string;
    transactionId?: string;
  };
  generatedBy?: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  notes?: string;
  createdAt: string;
}

interface PayrollSummary {
  currentYear: number;
  totalPayslips: number;
  yearlyEarnings: {
    totalGross: number;
    totalNet: number;
    totalDeductions: number;
    totalAllowances: number;
    totalTax: number;
    totalBonus: number;
    totalOvertime: number;
  };
  avgMonthlySalary: number;
  latestPayslip: {
    month: number;
    year: number;
    netSalary: number;
    status: string;
    payDate?: string;
  } | null;
}

const EmployeePayroll: React.FC = () => {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchPayrollData();
  }, [selectedYear]);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/payroll/my?year=${selectedYear}&limit=12`);
      
      if (response.data.success) {
        setPayrollRecords(response.data.data.payrollRecords);
        setSummary(response.data.data.summary);
      }
    } catch (error: any) {
      console.error('Error fetching payroll data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (record: PayrollRecord) => {
    setSelectedRecord(record);
    setDetailsOpen(true);
  };

  const handleDownloadPayslip = async (payrollId: string) => {
    try {
      const response = await api.get(`/payroll/${payrollId}/download`);
      
      if (response.data.success) {
        const payslipData = response.data.data;
        
        // Create a printable HTML page
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Payslip - ${payslipData.employeeName}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 20px; 
                  color: #333; 
                }
                .header { 
                  text-align: center; 
                  border-bottom: 2px solid #2196F3; 
                  padding-bottom: 20px; 
                  margin-bottom: 30px; 
                }
                .company-title { 
                  font-size: 24px; 
                  font-weight: bold; 
                  color: #2196F3; 
                  margin-bottom: 10px; 
                }
                .payslip-title { 
                  font-size: 18px; 
                  margin-bottom: 5px; 
                }
                .employee-info { 
                  display: flex; 
                  justify-content: space-between; 
                  margin-bottom: 30px; 
                  background: #f5f5f5; 
                  padding: 15px; 
                  border-radius: 5px; 
                }
                .section { 
                  margin-bottom: 25px; 
                }
                .section-title { 
                  font-size: 16px; 
                  font-weight: bold; 
                  margin-bottom: 10px; 
                  padding: 8px; 
                  background: #e3f2fd; 
                  border-left: 4px solid #2196F3; 
                }
                .earnings-section .section-title { 
                  background: #e8f5e8; 
                  border-left-color: #4caf50; 
                }
                .deductions-section .section-title { 
                  background: #ffebee; 
                  border-left-color: #f44336; 
                }
                .item { 
                  display: flex; 
                  justify-content: space-between; 
                  padding: 8px 0; 
                  border-bottom: 1px solid #eee; 
                }
                .item:last-child { 
                  border-bottom: none; 
                }
                .total-row { 
                  font-weight: bold; 
                  padding: 10px; 
                  margin-top: 10px; 
                  border-radius: 5px; 
                }
                .earnings-total { 
                  background: #e8f5e8; 
                  color: #2e7d32; 
                }
                .deductions-total { 
                  background: #ffebee; 
                  color: #c62828; 
                }
                .net-salary { 
                  background: #e3f2fd; 
                  color: #1565c0; 
                  font-size: 18px; 
                  text-align: center; 
                  padding: 15px; 
                  margin: 20px 0; 
                  border: 2px solid #2196F3; 
                  border-radius: 8px; 
                }
                .two-column { 
                  display: flex; 
                  gap: 30px; 
                }
                .column { 
                  flex: 1; 
                }
                .attendance-info, .payment-info { 
                  background: #f8f9fa; 
                  padding: 15px; 
                  border-radius: 5px; 
                  margin-top: 20px; 
                }
                @media print {
                  body { margin: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="company-title">HRMS - Human Resource Management System</div>
                <div class="payslip-title">PAYSLIP</div>
                <div>${payslipData.payPeriod}</div>
              </div>
              
              <div class="employee-info">
                <div>
                  <strong>Employee Name:</strong> ${payslipData.employeeName}<br>
                  <strong>Employee ID:</strong> ${payslipData.employeeId}<br>
                  <strong>Department:</strong> ${payslipData.department}
                </div>
                <div>
                  <strong>Pay Period:</strong> ${payslipData.payPeriod}<br>
                  <strong>Generated On:</strong> ${new Date(payslipData.generatedDate).toLocaleDateString()}<br>
                  <strong>Generated By:</strong> ${payslipData.generatedBy}
                </div>
              </div>
              
              <div class="two-column">
                <div class="column earnings-section">
                  <div class="section">
                    <div class="section-title">EARNINGS</div>
                    <div class="item">
                      <span>Basic Salary:</span>
                      <span>₹${payslipData.basicSalary.toLocaleString('en-IN')}</span>
                    </div>
                    ${payslipData.allowances.housing > 0 ? `
                    <div class="item">
                      <span>Housing Allowance:</span>
                      <span>₹${payslipData.allowances.housing.toLocaleString('en-IN')}</span>
                    </div>` : ''}
                    ${payslipData.allowances.transport > 0 ? `
                    <div class="item">
                      <span>Transport Allowance:</span>
                      <span>₹${payslipData.allowances.transport.toLocaleString('en-IN')}</span>
                    </div>` : ''}
                    ${payslipData.allowances.medical > 0 ? `
                    <div class="item">
                      <span>Medical Allowance:</span>
                      <span>₹${payslipData.allowances.medical.toLocaleString('en-IN')}</span>
                    </div>` : ''}
                    ${payslipData.allowances.food > 0 ? `
                    <div class="item">
                      <span>Food Allowance:</span>
                      <span>₹${payslipData.allowances.food.toLocaleString('en-IN')}</span>
                    </div>` : ''}
                    ${payslipData.allowances.overtime > 0 ? `
                    <div class="item">
                      <span>Overtime Pay:</span>
                      <span>₹${payslipData.allowances.overtime.toLocaleString('en-IN')}</span>
                    </div>` : ''}
                    ${payslipData.allowances.bonus > 0 ? `
                    <div class="item">
                      <span>Bonus:</span>
                      <span>₹${payslipData.allowances.bonus.toLocaleString('en-IN')}</span>
                    </div>` : ''}
                    ${payslipData.allowances.other > 0 ? `
                    <div class="item">
                      <span>Other Allowances:</span>
                      <span>₹${payslipData.allowances.other.toLocaleString('en-IN')}</span>
                    </div>` : ''}
                    <div class="total-row earnings-total">
                      <div class="item">
                        <span>GROSS SALARY:</span>
                        <span>₹${payslipData.calculations.grossSalary.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="column deductions-section">
                  <div class="section">
                    <div class="section-title">DEDUCTIONS</div>
                    ${payslipData.deductions.tax > 0 ? `
                    <div class="item">
                      <span>Income Tax:</span>
                      <span>₹${payslipData.deductions.tax.toLocaleString('en-IN')}</span>
                    </div>` : ''}
                    ${payslipData.deductions.socialSecurity > 0 ? `
                    <div class="item">
                      <span>Social Security:</span>
                      <span>₹${payslipData.deductions.socialSecurity.toLocaleString('en-IN')}</span>
                    </div>` : ''}
                    ${payslipData.deductions.providentFund > 0 ? `
                    <div class="item">
                      <span>Provident Fund:</span>
                      <span>₹${payslipData.deductions.providentFund.toLocaleString('en-IN')}</span>
                    </div>` : ''}
                    ${payslipData.deductions.insurance > 0 ? `
                    <div class="item">
                      <span>Insurance:</span>
                      <span>₹${payslipData.deductions.insurance.toLocaleString('en-IN')}</span>
                    </div>` : ''}
                    ${payslipData.deductions.loan > 0 ? `
                    <div class="item">
                      <span>Loan Deduction:</span>
                      <span>₹${payslipData.deductions.loan.toLocaleString('en-IN')}</span>
                    </div>` : ''}
                    ${payslipData.deductions.advance > 0 ? `
                    <div class="item">
                      <span>Advance Deduction:</span>
                      <span>₹${payslipData.deductions.advance.toLocaleString('en-IN')}</span>
                    </div>` : ''}
                    ${payslipData.deductions.other > 0 ? `
                    <div class="item">
                      <span>Other Deductions:</span>
                      <span>₹${payslipData.deductions.other.toLocaleString('en-IN')}</span>
                    </div>` : ''}
                    ${payslipData.calculations.totalDeductions === 0 ? `
                    <div class="item" style="text-align: center; color: #666; font-style: italic;">
                      <span>No deductions applied</span>
                    </div>` : ''}
                    <div class="total-row deductions-total">
                      <div class="item">
                        <span>TOTAL DEDUCTIONS:</span>
                        <span>₹${payslipData.calculations.totalDeductions.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="net-salary">
                <div class="item" style="font-size: 20px;">
                  <span>NET SALARY:</span>
                  <span>₹${payslipData.calculations.netSalary.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <div class="two-column">
                ${payslipData.attendance ? `
                <div class="column">
                  <div class="attendance-info">
                    <div class="section-title">ATTENDANCE SUMMARY</div>
                    <div class="item">
                      <span>Working Days:</span>
                      <span>${payslipData.attendance.workingDays}</span>
                    </div>
                    <div class="item">
                      <span>Present Days:</span>
                      <span>${payslipData.attendance.presentDays}</span>
                    </div>
                    <div class="item">
                      <span>Absent Days:</span>
                      <span>${payslipData.attendance.absentDays}</span>
                    </div>
                    <div class="item">
                      <span>Overtime Hours:</span>
                      <span>${payslipData.attendance.overtimeHours}</span>
                    </div>
                  </div>
                </div>` : ''}
                
                <div class="column">
                  <div class="payment-info">
                    <div class="section-title">PAYMENT DETAILS</div>
                    <div class="item">
                      <span>Payment Method:</span>
                      <span>${payslipData.paymentDetails.paymentMethod.replace('-', ' ').toUpperCase()}</span>
                    </div>
                    <div class="item">
                      <span>Status:</span>
                      <span>${payslipData.paymentDetails.status.toUpperCase()}</span>
                    </div>
                    ${payslipData.paymentDetails.paymentDate ? `
                    <div class="item">
                      <span>Payment Date:</span>
                      <span>${new Date(payslipData.paymentDetails.paymentDate).toLocaleDateString()}</span>
                    </div>` : ''}
                    ${payslipData.paymentDetails.transactionId ? `
                    <div class="item">
                      <span>Transaction ID:</span>
                      <span style="font-family: monospace;">${payslipData.paymentDetails.transactionId}</span>
                    </div>` : ''}
                  </div>
                </div>
              </div>
              
              ${payslipData.notes ? `
              <div class="section">
                <div class="section-title">NOTES</div>
                <p style="font-style: italic; color: #666; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                  ${payslipData.notes}
                </p>
              </div>` : ''}
              
              <div class="no-print" style="text-align: center; margin-top: 30px;">
                <button onclick="window.print()" style="background: #2196F3; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 16px;">
                  Print Payslip
                </button>
              </div>
            </body>
            </html>
          `);
          printWindow.document.close();
          
          // Trigger print dialog after a short delay to let the page load
          setTimeout(() => {
            printWindow.print();
          }, 500);
        }
      }
    } catch (error: any) {
      console.error('Error downloading payslip:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          My Payroll
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchPayrollData}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <TextField
            select
            label="Year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            size="small"
            sx={{ minWidth: 120 }}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <AttachMoney color="primary" />
                  <Box>
                    <Typography variant="h6">
                      {formatCurrency(summary.yearlyEarnings.totalNet)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Earnings (YTD)
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <TrendingUp color="success" />
                  <Box>
                    <Typography variant="h6">
                      {formatCurrency(summary.avgMonthlySalary)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Monthly
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Receipt color="info" />
                  <Box>
                    <Typography variant="h6">{summary.totalPayslips}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Payslips
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <AccountBalance color="warning" />
                  <Box>
                    <Typography variant="h6">
                      {formatCurrency(summary.yearlyEarnings.totalTax)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Tax Paid
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Latest Payslip */}
      {summary?.latestPayslip && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Latest Payslip
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>{getMonthName(summary.latestPayslip.month)} {summary.latestPayslip.year}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Net Salary: {formatCurrency(summary.latestPayslip.netSalary)}
              </Typography>
              <Chip
                label={summary.latestPayslip.status}
                color={getStatusColor(summary.latestPayslip.status) as any}
                size="small"
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
              {summary.latestPayslip.payDate && (
                <Typography variant="body2" color="text.secondary">
                  Paid on: {new Date(summary.latestPayslip.payDate).toLocaleDateString()}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Payroll Records */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Payroll History
        </Typography>
        
        {payrollRecords.length === 0 ? (
          <Alert severity="info">
            No payroll records found for {selectedYear}
          </Alert>
        ) : (
          <Stack spacing={2}>
            {payrollRecords.map((record) => (
              <Accordion key={record._id}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Grid container spacing={2} alignItems="center" sx={{ width: '100%' }}>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {getMonthName(record.payPeriod.month)} {record.payPeriod.year}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body1" fontWeight="medium">
                        {formatCurrency(record.calculations.netSalary)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Net Salary
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Chip
                        label={record.paymentDetails.status}
                        color={getStatusColor(record.paymentDetails.status) as any}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={3} sx={{ textAlign: { sm: 'right' } }}>
                      <Stack direction="row" spacing={1} justifyContent={{ sm: 'flex-end' }}>
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(record);
                          }}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          startIcon={<Download />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadPayslip(record._id);
                          }}
                        >
                          Download
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" gutterBottom>
                        Earnings
                      </Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Base Salary:</Typography>
                          <Typography variant="body2">
                            {formatCurrency(record.basicSalary)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Housing:</Typography>
                          <Typography variant="body2">
                            {formatCurrency(record.allowances.housing)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Transport:</Typography>
                          <Typography variant="body2">
                            {formatCurrency(record.allowances.transport)}
                          </Typography>
                        </Box>
                        {record.allowances.bonus > 0 && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Bonus:</Typography>
                            <Typography variant="body2">
                              {formatCurrency(record.allowances.bonus)}
                            </Typography>
                          </Box>
                        )}
                        {record.allowances.overtime > 0 && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Overtime:</Typography>
                            <Typography variant="body2">
                              {formatCurrency(record.allowances.overtime)}
                            </Typography>
                          </Box>
                        )}
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                          <Typography variant="body2">Gross Salary:</Typography>
                          <Typography variant="body2">
                            {formatCurrency(record.calculations.grossSalary)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" gutterBottom>
                        Deductions
                      </Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Income Tax:</Typography>
                          <Typography variant="body2">
                            {formatCurrency(record.deductions.tax)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Provident Fund:</Typography>
                          <Typography variant="body2">
                            {formatCurrency(record.deductions.providentFund)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Insurance:</Typography>
                          <Typography variant="body2">
                            {formatCurrency(record.deductions.insurance)}
                          </Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                          <Typography variant="body2">Total Deductions:</Typography>
                          <Typography variant="body2">
                            {formatCurrency(record.calculations.totalDeductions)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" gutterBottom>
                        Payment Details
                      </Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                          <Typography variant="body1">Net Salary:</Typography>
                          <Typography variant="body1" color="primary">
                            {formatCurrency(record.calculations.netSalary)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Method:</Typography>
                          <Typography variant="body2">
                            {record.paymentDetails.paymentMethod}
                          </Typography>
                        </Box>
                        {record.paymentDetails.paymentDate && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Payment Date:</Typography>
                            <Typography variant="body2">
                              {new Date(record.paymentDetails.paymentDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}
                        {record.paymentDetails.transactionId && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Transaction ID:</Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {record.paymentDetails.transactionId}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}
      </Paper>

      {/* Payslip Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Payslip Details - {selectedRecord && `${getMonthName(selectedRecord.payPeriod.month)} ${selectedRecord.payPeriod.year}`}
        </DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Box sx={{ p: 2 }}>
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 4, pb: 2, borderBottom: '2px solid #e0e0e0' }}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  PAYSLIP
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {getMonthName(selectedRecord.payPeriod.month)} {selectedRecord.payPeriod.year}
                </Typography>
                <Chip 
                  label={selectedRecord.paymentDetails.status.toUpperCase()} 
                  color={getStatusColor(selectedRecord.paymentDetails.status) as any}
                  sx={{ mt: 1 }}
                />
              </Box>

              <Grid container spacing={4}>
                {/* Earnings Section */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h6" color="success.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp />
                      EARNINGS
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body1">Basic Salary:</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatCurrency(selectedRecord.basicSalary)}
                        </Typography>
                      </Box>
                      
                      {selectedRecord.allowances.housing > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                          <Typography variant="body1">Housing Allowance:</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {formatCurrency(selectedRecord.allowances.housing)}
                          </Typography>
                        </Box>
                      )}
                      
                      {selectedRecord.allowances.transport > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                          <Typography variant="body1">Transport Allowance:</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {formatCurrency(selectedRecord.allowances.transport)}
                          </Typography>
                        </Box>
                      )}
                      
                      {selectedRecord.allowances.medical > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                          <Typography variant="body1">Medical Allowance:</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {formatCurrency(selectedRecord.allowances.medical)}
                          </Typography>
                        </Box>
                      )}
                      
                      {selectedRecord.allowances.food > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                          <Typography variant="body1">Food Allowance:</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {formatCurrency(selectedRecord.allowances.food)}
                          </Typography>
                        </Box>
                      )}
                      
                      {selectedRecord.allowances.overtime > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                          <Typography variant="body1">Overtime Pay:</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {formatCurrency(selectedRecord.allowances.overtime)}
                          </Typography>
                        </Box>
                      )}
                      
                      {selectedRecord.allowances.bonus > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                          <Typography variant="body1">Bonus:</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {formatCurrency(selectedRecord.allowances.bonus)}
                          </Typography>
                        </Box>
                      )}
                      
                      {selectedRecord.allowances.other > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                          <Typography variant="body1">Other Allowances:</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {formatCurrency(selectedRecord.allowances.other)}
                          </Typography>
                        </Box>
                      )}
                      
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, bgcolor: 'success.50', px: 2, borderRadius: 1 }}>
                        <Typography variant="h6" fontWeight="bold">GROSS SALARY:</Typography>
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          {formatCurrency(selectedRecord.calculations.grossSalary)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                {/* Deductions Section */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h6" color="error.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountBalance />
                      DEDUCTIONS
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={2}>
                      {selectedRecord.deductions.tax > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                          <Typography variant="body1">Income Tax:</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {formatCurrency(selectedRecord.deductions.tax)}
                          </Typography>
                        </Box>
                      )}
                      
                      {selectedRecord.deductions.socialSecurity > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                          <Typography variant="body1">Social Security:</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {formatCurrency(selectedRecord.deductions.socialSecurity)}
                          </Typography>
                        </Box>
                      )}
                      
                      {selectedRecord.deductions.providentFund > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                          <Typography variant="body1">Provident Fund:</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {formatCurrency(selectedRecord.deductions.providentFund)}
                          </Typography>
                        </Box>
                      )}
                      
                      {selectedRecord.deductions.insurance > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                          <Typography variant="body1">Insurance:</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {formatCurrency(selectedRecord.deductions.insurance)}
                          </Typography>
                        </Box>
                      )}
                      
                      {selectedRecord.deductions.loan > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                          <Typography variant="body1">Loan Deduction:</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {formatCurrency(selectedRecord.deductions.loan)}
                          </Typography>
                        </Box>
                      )}
                      
                      {selectedRecord.deductions.advance > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                          <Typography variant="body1">Advance Deduction:</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {formatCurrency(selectedRecord.deductions.advance)}
                          </Typography>
                        </Box>
                      )}
                      
                      {selectedRecord.deductions.other > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                          <Typography variant="body1">Other Deductions:</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {formatCurrency(selectedRecord.deductions.other)}
                          </Typography>
                        </Box>
                      )}
                      
                      {selectedRecord.calculations.totalDeductions === 0 && (
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            No deductions applied
                          </Typography>
                        </Box>
                      )}
                      
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, bgcolor: 'error.50', px: 2, borderRadius: 1 }}>
                        <Typography variant="h6" fontWeight="bold">TOTAL DEDUCTIONS:</Typography>
                        <Typography variant="h6" fontWeight="bold" color="error.main">
                          {formatCurrency(selectedRecord.calculations.totalDeductions)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                {/* Net Salary Section */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, bgcolor: 'primary.50', border: '2px solid', borderColor: 'primary.main' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h5" fontWeight="bold" color="primary.main">
                        NET SALARY:
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="primary.main">
                        {formatCurrency(selectedRecord.calculations.netSalary)}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                {/* Attendance Information */}
                {selectedRecord.attendance && (
                  <Grid item xs={12} md={6}>
                    <Paper elevation={1} sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Receipt />
                        ATTENDANCE SUMMARY
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Working Days:</Typography>
                          <Typography variant="h6" fontWeight="bold">{selectedRecord.attendance.workingDays}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Present Days:</Typography>
                          <Typography variant="h6" fontWeight="bold" color="success.main">{selectedRecord.attendance.presentDays}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Absent Days:</Typography>
                          <Typography variant="h6" fontWeight="bold" color="error.main">{selectedRecord.attendance.absentDays}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Overtime Hours:</Typography>
                          <Typography variant="h6" fontWeight="bold" color="warning.main">{selectedRecord.attendance.overtimeHours}</Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                )}

                {/* Payment Details */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachMoney />
                      PAYMENT DETAILS
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body1">Payment Method:</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedRecord.paymentDetails.paymentMethod.replace('-', ' ').toUpperCase()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body1">Status:</Typography>
                        <Chip 
                          label={selectedRecord.paymentDetails.status.toUpperCase()} 
                          color={getStatusColor(selectedRecord.paymentDetails.status) as any}
                          size="small"
                        />
                      </Box>
                      {selectedRecord.paymentDetails.paymentDate && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body1">Payment Date:</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {new Date(selectedRecord.paymentDetails.paymentDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                      {selectedRecord.paymentDetails.transactionId && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body1">Transaction ID:</Typography>
                          <Typography variant="body1" fontWeight="medium" sx={{ fontFamily: 'monospace' }}>
                            {selectedRecord.paymentDetails.transactionId}
                          </Typography>
                        </Box>
                      )}
                      {selectedRecord.generatedBy && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body1">Generated By:</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {selectedRecord.generatedBy.profile.firstName} {selectedRecord.generatedBy.profile.lastName}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body1">Generated On:</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {new Date(selectedRecord.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                {/* Notes Section */}
                {selectedRecord.notes && (
                  <Grid item xs={12}>
                    <Paper elevation={1} sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        NOTES
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                        {selectedRecord.notes}
                      </Typography>
                    </Paper>
                  </Grid>
                )}

                {/* Download Button */}
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', pt: 2 }}>
                    <Button 
                      variant="contained" 
                      size="large"
                      startIcon={<Download />}
                      onClick={() => handleDownloadPayslip(selectedRecord._id)}
                      sx={{ minWidth: 200 }}
                    >
                      Download Payslip
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDetailsOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeePayroll;
